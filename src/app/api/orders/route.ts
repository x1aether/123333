import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, generateId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Order, Product, Coupon, CouponUsage } from "@/types";

// GET /api/orders — list orders (admin gets all, customer gets their own)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await readCollection<Order>("orders");

    if (currentUser.role === "admin") {
      return NextResponse.json({ orders });
    }

    // Customer gets only their orders
    const userOrders = orders.filter((o) => o.customerId === currentUser.id);
    return NextResponse.json({ orders: userOrders });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/orders — create new order (supports guest checkout)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Guest checkout: a logged-in user is used when present, otherwise the
    // order is attributed to a "guest" with the contact details from the form.
    const currentUser = await getCurrentUser();

    const now = new Date().toISOString();
    const orderId = `EC-${generateId()}`;

    const newOrder: Order = {
      id: orderId,
      customerId: currentUser?.id || "guest",
      customerName: body.customerName,
      customerEmail: currentUser?.email || body.customerEmail || "",
      customerPhone: body.customerPhone || "",
      shippingAddress: body.shippingAddress,
      items: body.items,
      subtotal: body.subtotal,
      discount: body.discount || 0,
      couponCode: body.couponCode || null,
      couponDiscount: body.appliedCoupon?.discount || 0,
      couponType: body.appliedCoupon?.type || "percentage",
      shipping: body.shipping || 0,
      tax: body.tax || 0,
      total: body.total,
      paymentMethod: body.paymentMethod || "cod",
      paymentStatus: "pending",
      orderStatus: "pending",
      trackingNumber: null,
      notes: body.notes || "",
      prescription: body.prescription || null,
      prescriptionImage: body.prescriptionImage || null,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        { status: "pending", timestamp: now, note: "Order placed successfully" },
      ],
    };

    const orders = await readCollection<Order>("orders");
    orders.push(newOrder);
    await writeCollection("orders", orders);

    // Update stock quantities
    try {
      const products = await readCollection<Product>("products");
      let productsChanged = false;
      for (const item of body.items) {
        const pIdx = products.findIndex((p) => p.id === item.productId);
        if (pIdx !== -1) {
          const currentQty = products[pIdx].stockQuantity ?? 10;
          products[pIdx].stockQuantity = Math.max(0, currentQty - item.quantity);
          if (products[pIdx].stockQuantity === 0) {
            products[pIdx].stockStatus = "Out of Stock";
          } else if (products[pIdx].stockQuantity < 3) {
            products[pIdx].stockStatus = "Low Stock";
          }
          productsChanged = true;
        }
      }
      if (productsChanged) {
        await writeCollection("products", products);
      }
    } catch (stockErr) {
      console.error("Stock update error (non-fatal):", stockErr);
    }

    // Track coupon usage
    if (body.couponCode && body.appliedCoupon) {
      try {
        const couponUsages = await readCollection<CouponUsage>("couponUsages");
        const couponUsage: CouponUsage = {
          id: generateId("coupon_usage"),
          couponCode: body.couponCode,
          userId: currentUser?.id || "guest",
          userEmail: currentUser?.email || body.customerEmail || "",
          userName: currentUser?.name || body.customerName || "Guest",
          orderId: orderId,
          orderNumber: orderId,
          discountAmount: body.appliedCoupon.discount,
          discountType: body.appliedCoupon.type,
          orderTotal: body.total,
          usedAt: now,
        };
        couponUsages.push(couponUsage);
        await writeCollection("couponUsages", couponUsages);

        // Increment coupon usage count
        const coupons = await readCollection<Coupon>("coupons");
        const cIdx = coupons.findIndex(
          (c) => c.code.toLowerCase() === body.couponCode.toLowerCase()
        );
        if (cIdx !== -1) {
          coupons[cIdx].usedCount = (coupons[cIdx].usedCount || 0) + 1;
          await writeCollection("coupons", coupons);
        }
      } catch (couponErr) {
        console.error("Coupon update error (non-fatal):", couponErr);
      }
    }

    return NextResponse.json({ order: newOrder, message: "Order placed successfully" });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
