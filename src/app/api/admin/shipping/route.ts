import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { egyptianGovernorates } from "@/data/egypt";
import type { GovernorateShipping, SiteSettings } from "@/types";

// GET /api/admin/shipping — get governorate shipping prices
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await readCollection<SiteSettings>("settings");
    const governorateShipping = settings[0]?.governorateShipping || [];

    // If no shipping prices saved yet, return defaults from egypt.ts
    if (governorateShipping.length === 0) {
      const defaults: GovernorateShipping[] = egyptianGovernorates.map((g) => ({
        governorate: g.name,
        governorateAr: g.nameAr,
        price: g.shippingPrice,
        estimatedDays: g.estimatedDays,
      }));
      return NextResponse.json({ shipping: defaults });
    }

    return NextResponse.json({ shipping: governorateShipping });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/shipping — update governorate shipping prices
export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const shipping: GovernorateShipping[] = body.shipping;

    if (!Array.isArray(shipping)) {
      return NextResponse.json(
        { error: "Shipping must be an array" },
        { status: 400 }
      );
    }

    const settings = await readCollection<SiteSettings>("settings");
    if (settings.length === 0) {
      // Create default settings if none exist
      const defaultSettings: SiteSettings = {
        storeName: "Eye Care",
        storeEmail: "support@eyecare.com",
        storePhone: "+20 100 000 0000",
        storeAddress: "Cairo, Egypt",
        currency: "EGP",
        currencySymbol: "EGP",
        taxRate: 14,
        freeShippingThreshold: 500,
        standardShipping: 50,
        expressShipping: 100,
        governorateShipping: shipping,
        whatsappNumber: "+201000000000",
        socialMedia: { instagram: "", facebook: "", twitter: "", youtube: "" },
        metaTitle: "Eye Care — Premium Eyewear",
        metaDescription: "Premium eyewear store",
        heroTitle: "See the World Differently",
        heroSubtitle: "New Collection 2026",
        maintenanceMode: false,
        allowRegistration: true,
        orderConfirmationEmail: true,
        shippingNotificationEmail: true,
      };
      await writeCollection("settings", [defaultSettings]);
    } else {
      settings[0].governorateShipping = shipping;
      await writeCollection("settings", settings);
    }

    return NextResponse.json({ shipping, message: "Shipping prices updated" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
