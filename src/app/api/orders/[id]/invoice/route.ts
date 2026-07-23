import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Order, Invoice, SiteSettings } from "@/types";

// GET /api/orders/[id]/invoice — generate invoice data for an order
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

    // Access rules mirror single-order tracking: the (unguessable) order id is
    // the access token. Guests may view guest orders / their tracked order;
    // admins may view any; logged-in customers may view their own. A logged-in
    // customer cannot enumerate another customer's account order.
    const isGuestOrder = order.customerId === "guest";
    const canView =
      !currentUser ||
      isGuestOrder ||
      currentUser.role === "admin" ||
      order.customerId === currentUser.id;
    if (!canView) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Load store settings
    let settings: SiteSettings | null = null;
    try {
      const settingsArr = await readCollection<SiteSettings>("settings");
      settings = settingsArr[0] || null;
    } catch {
      // settings not available
    }

    const invoice: Invoice = {
      id: `INV-${order.id}`,
      invoiceNumber: `INV-${order.id.replace("EC-", "")}`,
      orderId: order.id,
      orderNumber: order.id,
      invoiceDate: order.createdAt,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail || "",
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      items: order.items,
      prescription: order.prescription || null,
      prescriptionImage: order.prescriptionImage || null,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      couponCode: order.couponCode,
      tax: order.tax,
      total: order.total,
      storeName: settings?.storeName || "Eye Care",
      storeEmail: settings?.storeEmail || "info@eyecare.eg",
      storePhone: settings?.storePhone || "+20 100 000 0000",
      storeAddress: settings?.storeAddress || "Cairo, Egypt",
      storeLogo: "/images/logos/logo.png",
      notes: order.notes || "",
    };

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
