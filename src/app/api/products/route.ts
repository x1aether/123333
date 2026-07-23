import { NextRequest, NextResponse } from "next/server";
import { getVisibleProducts } from "@/lib/serverProducts";

// GET /api/products — public storefront product list.
// Optional query filters: ?search=&category=&brand=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");

    let products = await getVisibleProducts();

    if (category) {
      products = products.filter((p) => p.category === category);
    }
    if (brand) {
      products = products.filter((p) => p.brand === brand);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching public products:", error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
