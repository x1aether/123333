import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Coupon, CouponUsage } from "@/types";

/*
 * POST /api/coupons/validate — public coupon validation for checkout.
 *
 * Customers and guests need to validate a coupon at checkout without access to
 * the admin coupon list. This endpoint accepts a code + cart subtotal, applies
 * all business rules (active, not expired, min purchase, usage limits) and
 * returns the computed discount. It never exposes the full coupon catalogue.
 *
 * Body: { code: string; subtotal: number }
 * Returns: { valid: true, coupon, discount } | { valid: false, error }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const subtotal = Number(body.subtotal) || 0;

    if (!code) {
      return NextResponse.json({ valid: false, error: "Coupon code is required" }, { status: 400 });
    }

    const coupons = await readCollection<Coupon>("coupons");
    const coupon = coupons.find((c) => c.code.toLowerCase() === code.toLowerCase());

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid Coupon" }, { status: 200 });
    }

    // Expiry check
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 200 });
    }

    // Global usage limit
    if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" }, { status: 200 });
    }

    // Minimum purchase
    if (subtotal < (coupon.minPurchase || 0)) {
      return NextResponse.json(
        { valid: false, error: "MIN_PURCHASE", minPurchase: coupon.minPurchase },
        { status: 200 }
      );
    }

    // Optional per-user limit (only enforceable for logged-in users)
    const maxPerUser = (coupon as Coupon & { maxUsesPerUser?: number }).maxUsesPerUser;
    if (maxPerUser === 1) {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const usages = await readCollection<CouponUsage>("couponUsages");
        const used = usages.some(
          (u) => u.userId === currentUser.id && u.couponCode.toLowerCase() === code.toLowerCase()
        );
        if (used) {
          return NextResponse.json({ valid: false, error: "You have already used this coupon" }, { status: 200 });
        }
      }
    }

    const discount =
      coupon.type === "percentage"
        ? Math.round(subtotal * (coupon.discount / 100) * 100) / 100
        : coupon.discount;

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        type: coupon.type,
        minPurchase: coupon.minPurchase,
      },
      discount,
    });
  } catch {
    return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
