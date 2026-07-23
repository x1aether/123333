import { NextRequest, NextResponse } from "next/server";
import { getVisibleProductBySlug } from "@/lib/serverProducts";

// GET /api/products/[slug] — public single product by slug.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getVisibleProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
