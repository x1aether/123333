import { NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import type { SiteSettings } from "@/types";

// GET /api/settings — public, read-only site settings for the storefront
// (currency, shipping, whatsapp, hero, social). No auth required, but we only
// expose non-sensitive presentation/commerce fields.
export async function GET() {
  try {
    const settings = await readCollection<SiteSettings>("settings");
    const first = Array.isArray(settings)
      ? settings[0]
      : (settings as SiteSettings | undefined);

    if (!first) {
      return NextResponse.json({ settings: null });
    }

    const publicSettings = {
      storeName: first.storeName,
      storeEmail: first.storeEmail,
      storePhone: first.storePhone,
      storeAddress: first.storeAddress,
      currency: first.currency,
      currencySymbol: first.currencySymbol,
      taxRate: first.taxRate,
      freeShippingThreshold: first.freeShippingThreshold,
      standardShipping: first.standardShipping,
      expressShipping: first.expressShipping,
      governorateShipping: first.governorateShipping || [],
      whatsappNumber: first.whatsappNumber,
      socialMedia: first.socialMedia,
      metaTitle: first.metaTitle,
      metaDescription: first.metaDescription,
      heroTitle: first.heroTitle,
      heroSubtitle: first.heroSubtitle,
    };

    return NextResponse.json({ settings: publicSettings });
  } catch {
    return NextResponse.json({ settings: null }, { status: 200 });
  }
}
