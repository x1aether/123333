import { NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Order, User, Product } from "@/types";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const products = await readCollection<Product>("products");
    const orders = await readCollection<Order>("orders");
    const users = await readCollection<User>("users");

    const totalProducts = products.length;
    const totalCustomers = users.filter((u) => u.role === "customer").length;

    // Status counts for all new statuses
    const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
    const acceptedOrders = orders.filter((o) => o.orderStatus === "accepted").length;
    const preparingOrders = orders.filter((o) => o.orderStatus === "preparing").length;
    const packedOrders = orders.filter((o) => o.orderStatus === "packed").length;
    const shippedOrders = orders.filter((o) => o.orderStatus === "shipped").length;
    const outForDeliveryOrders = orders.filter((o) => o.orderStatus === "out_for_delivery").length;
    const deliveredOrders = orders.filter((o) => o.orderStatus === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === "cancelled").length;
    const rejectedOrders = orders.filter((o) => o.orderStatus === "rejected").length;

    // Revenue only from delivered orders
    const totalRevenue = orders
      .filter((o) => o.orderStatus === "delivered")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const today = new Date().toISOString().split("T")[0];
    const todaySales = orders
      .filter(
        (o) =>
          o.orderStatus === "delivered" &&
          o.updatedAt &&
          o.updatedAt.startsWith(today)
      )
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Low stock alert (stock < 3)
    const lowStockProducts = products.filter(
      (p) => (p.stockQuantity ?? 10) < 3
    );

    // Recent orders (last 10)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json({
      todaySales,
      totalRevenue,
      totalProducts,
      totalCustomers,
      pendingOrders,
      acceptedOrders,
      preparingOrders,
      packedOrders,
      shippedOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      rejectedOrders,
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
