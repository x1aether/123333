import { NextRequest, NextResponse } from "next/server";
import { readCollection, insertOne, generateId } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Product } from "@/types";

// GET /api/admin/products — list all products (admin only), with optional filters
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");

    let products = await readCollection<Product>("products");

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    if (brand) {
      products = products.filter((p) => p.brand === brand);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/admin/products — create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const productData = await request.json();

    if (!productData || typeof productData.name !== "string" || !productData.name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const products = await readCollection<Product>("products");

    // Generate collision-safe ID (max numeric id + 1, fallback to timestamp)
    const numericIds = products
      .map((p) => parseInt(p.id, 10))
      .filter((n) => !Number.isNaN(n));
    const newId = (numericIds.length ? Math.max(...numericIds) + 1 : Date.now()).toString();

    const newProduct: Product = {
      ...productData,
      id: newId,
      slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, "-"),
      name: productData.name,
      nameAr: productData.nameAr || "",
      brand: productData.brand,
      price: Number(productData.price),
      salePrice: productData.salePrice ? Number(productData.salePrice) : undefined,
      sku: productData.sku,
      category: productData.category,
      categoryAr: productData.categoryAr || "",
      frameType: productData.frameType,
      frameShape: productData.frameShape,
      lensColor: productData.lensColor,
      frameColor: productData.frameColor,
      gender: productData.gender,
      material: productData.material,
      uvProtection: productData.uvProtection,
      polarized: Boolean(productData.polarized),
      blueLightFilter: Boolean(productData.blueLightFilter),
      uv400: Boolean(productData.uv400),
      prescriptionCompatible: Boolean(productData.prescriptionCompatible),
      stockStatus: productData.stockStatus,
      stockQuantity: Number(productData.stockQuantity) || 0,
      images: productData.images || [],
      description: productData.description,
      descriptionAr: productData.descriptionAr || "",
      features: productData.features || [],
      featuresAr: productData.featuresAr || [],
      variants: productData.variants || [],
      reviews: [],
      relatedProductIds: [],
      isNewArrival: Boolean(productData.isNewArrival),
      isBestSeller: Boolean(productData.isBestSeller),
      isPublished: Boolean(productData.isPublished),
      isHidden: false,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Product;

    await insertOne<Product>("products", newProduct);

    // Update image library if images provided
    if (productData.images && productData.images.length > 0) {
      const imageLibrary = await readCollection<any>("image_library");
      const additions = productData.images.map((imageUrl: string, index: number) => ({
        id: `img_${Date.now()}_${index}`,
        name: `${productData.name} - Image ${index + 1}`,
        category: "products",
        imagePath: imageUrl,
        altText: `${productData.name} product image`,
        productId: newId,
        uploadDate: new Date().toISOString(),
      }));
      const { writeCollection } = await import("@/lib/db");
      await writeCollection("image_library", [...imageLibrary, ...additions]);
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
