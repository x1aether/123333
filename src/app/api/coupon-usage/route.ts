import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { CouponUsage } from "@/types";

// GET /api/coupon-usage — get coupon usage history (admin only, or filter by couponCode)
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const couponCode = searchParams.get("couponCode");

    const couponUsages = await readCollection<CouponUsage>("couponUsages");

    if (couponCode) {
      const filteredUsages = couponUsages.filter(
        (u) => u.couponCode.toLowerCase() === couponCode.toLowerCase()
      );
      return NextResponse.json({ usages: filteredUsages });
    }

    return NextResponse.json({ usages: couponUsages });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
