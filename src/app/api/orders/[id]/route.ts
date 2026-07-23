import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, generateId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyOrderStatus } from "@/lib/notifications";
import type { Order, OrderStatus, Product } from "@/types";

// Valid status transitions
const STATUS_FLOW: Record<string, OrderStatus[]> = {
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: ["returned"],
  returned: ["refunded"],
  cancelled: [],
  rejected: [],
  refunded: [],
};

// GET /api/orders/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    const orders = await readCollection<Order>("orders");
    const order = orders.find((o) => o.id === id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    // Access rules for reading a single order by its (unguessable) id:
    //  - guests (no session) may track any order by id — the id is the secret;
    //  - guest-placed orders are always viewable for tracking;
    //  - admins may view any order;
    //  - logged-in customers may view their own orders.
    // A logged-in customer cannot enumerate another customer's account order.
    const isGuestOrder = order.customerId === "guest";
    const canView =
      !currentUser ||
      isGuestOrder ||
      currentUser.role === "admin" ||
      order.customerId === currentUser.id;
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — update order status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const orders = await readCollection<Order>("orders");
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Customer cancellation with 24h rule
    if (body.orderStatus === "cancelled" && currentUser.role !== "admin") {
      // Verify ownership
      if (orders[index].customerId !== currentUser.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Check 24h window
      const orderAge = Date.now() - new Date(orders[index].createdAt).getTime();
      if (orderAge > 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: "Cancellation period (24h) has expired" }, { status: 400 });
      }
      // Check status allows cancellation
      if (!["pending", "accepted", "preparing"].includes(orders[index].orderStatus)) {
        return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 });
      }
    } else if (currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date().toISOString();
    const updates: Partial<Order> = { updatedAt: now };

    if (body.orderStatus) {
      const newStatus = body.orderStatus as OrderStatus;
      const currentStatus = orders[index].orderStatus;
      const allowedTransitions = STATUS_FLOW[currentStatus] || [];

      // Allow admin to force any status if needed, but log warning
      if (allowedTransitions.length > 0 && !allowedTransitions.includes(newStatus)) {
        console.warn(
          `Status transition from ${currentStatus} to ${newStatus} is non-standard`
        );
      }

      updates.orderStatus = newStatus;
      updates.statusHistory = [
        ...(orders[index].statusHistory || []),
        {
          status: newStatus,
          timestamp: now,
          note: body.note || `Status updated to ${newStatus}`,
        },
      ];

      // Restore stock when order is cancelled or rejected
      if ((newStatus === "cancelled" || newStatus === "rejected") && 
          currentStatus !== "cancelled" && currentStatus !== "rejected") {
        try {
          const products = await readCollection<Product>("products");
          let productsChanged = false;
          for (const item of orders[index].items) {
            const pIdx = products.findIndex((p) => p.id === item.productId);
            if (pIdx !== -1) {
              products[pIdx].stockQuantity = (products[pIdx].stockQuantity || 0) + item.quantity;
              if (products[pIdx].stockQuantity > 0) {
                if (products[pIdx].stockStatus === "Out of Stock" || products[pIdx].stockStatus === "Low Stock") {
                  products[pIdx].stockStatus = "In Stock";
                }
              }
              productsChanged = true;
            }
          }
          if (productsChanged) {
            await writeCollection("products", products);
          }
        } catch (stockErr) {
          console.error("Stock restoration error (non-fatal):", stockErr);
        }
      }

      // Auto-generate tracking number when shipped
      if (newStatus === "shipped" && !orders[index].trackingNumber) {
        updates.trackingNumber = `EC-TRK-${generateId()}`;
      }

      // Mark payment as paid when delivered (for COD)
      if (newStatus === "delivered" && orders[index].paymentMethod === "cod") {
        updates.paymentStatus = "paid";
      }
    }

    if (body.paymentStatus) updates.paymentStatus = body.paymentStatus;
    if (body.trackingNumber) updates.trackingNumber = body.trackingNumber;
    if (body.notes !== undefined) updates.notes = body.notes;

    orders[index] = { ...orders[index], ...updates };
    await writeCollection("orders", orders);

    // Fire-and-forget customer notification on status change. The notification
    // service is disabled by default (no-op) until a provider is configured,
    // so this never blocks or breaks the order update.
    if (body.orderStatus) {
      void notifyOrderStatus(orders[index], orders[index].orderStatus);
    }

    return NextResponse.json({ order: orders[index], message: "Order updated" });
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/orders/[id] — cancel order (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await readCollection<Order>("orders");
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    orders[index] = {
      ...orders[index],
      orderStatus: "cancelled",
      updatedAt: now,
      statusHistory: [
        ...(orders[index].statusHistory || []),
        { status: "cancelled", timestamp: now, note: "Order cancelled by admin" },
      ],
    };
    await writeCollection("orders", orders);

    return NextResponse.json({ message: "Order cancelled" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
