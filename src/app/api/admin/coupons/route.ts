import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection, generateId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Coupon } from "@/types";

// GET /api/admin/coupons — list all coupons (admin only)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const coupons = await readCollection<Coupon>("coupons");
    return NextResponse.json({ coupons });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/coupons — create coupon (admin only)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    if (!body.code || !body.discount || !body.type) {
      return NextResponse.json(
        { error: "Code, discount, and type are required" },
        { status: 400 }
      );
    }

    const coupons = await readCollection<Coupon>("coupons");

    // Check for duplicate code
    const exists = coupons.find(
      (c) => c.code.toLowerCase() === body.code.toLowerCase()
    );
    if (exists) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newCoupon: Coupon = {
      id: generateId("coupon"),
      code: body.code.toUpperCase(),
      description: body.description || "",
      discount: Number(body.discount),
      type: body.type,
      minPurchase: Number(body.minPurchase) || 0,
      maxUses: Number(body.maxUses) || 100,
      usedCount: 0,
      isActive: body.isActive !== false,
      expiresAt: body.expiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
      createdAt: now,
    };

    coupons.push(newCoupon);
    await writeCollection("coupons", coupons);

    return NextResponse.json({ coupon: newCoupon, message: "Coupon created" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
