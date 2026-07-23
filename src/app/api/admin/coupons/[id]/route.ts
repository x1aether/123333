import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Coupon } from "@/types";

// GET /api/admin/coupons/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const coupons = await readCollection<Coupon>("coupons");
    const coupon = coupons.find((c) => c.id === id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ coupon });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/coupons/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const coupons = await readCollection<Coupon>("coupons");
    const index = coupons.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const updates: Partial<Coupon> = {};
    if (body.code !== undefined) updates.code = body.code.toUpperCase();
    if (body.description !== undefined) updates.description = body.description;
    if (body.discount !== undefined) updates.discount = Number(body.discount);
    if (body.type !== undefined) updates.type = body.type;
    if (body.minPurchase !== undefined) updates.minPurchase = Number(body.minPurchase);
    if (body.maxUses !== undefined) updates.maxUses = Number(body.maxUses);
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt;

    coupons[index] = { ...coupons[index], ...updates };
    await writeCollection("coupons", coupons);

    return NextResponse.json({ coupon: coupons[index], message: "Coupon updated" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const coupons = await readCollection<Coupon>("coupons");
    const filtered = coupons.filter((c) => c.id !== id);

    if (filtered.length === coupons.length) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    await writeCollection("coupons", filtered);
    return NextResponse.json({ message: "Coupon deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
