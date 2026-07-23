import { NextRequest, NextResponse } from "next/server";
import { readCollection, updateOne, deleteOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Product } from "@/types";

// GET /api/admin/products/[id] — fetch a single product (admin only)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const products = await readCollection<Product>("products");
    const product = products.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] — update a product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const productData = await request.json();

    const products = await readCollection<Product>("products");
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct: Product = {
      ...products[productIndex],
      ...productData,
      id,
      updatedAt: new Date().toISOString(),
    };

    await updateOne<Product>("products", id, updatedProduct);

    // Update image library if images changed
    if (productData.images) {
      const imageLibrary = await readCollection<any>("image_library");
      const filteredLibrary = imageLibrary.filter((img) => img.productId !== id);

      const additions = productData.images.map((imageUrl: string, index: number) => ({
        id: `img_${Date.now()}_${index}`,
        name: `${updatedProduct.name} - Image ${index + 1}`,
        category: "products",
        imagePath: imageUrl,
        altText: `${updatedProduct.name} product image`,
        productId: id,
        uploadDate: new Date().toISOString(),
      }));

      const { writeCollection } = await import("@/lib/db");
      await writeCollection("image_library", [...filteredLibrary, ...additions]);
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — delete a product (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const products = await readCollection<Product>("products");
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await deleteOne<Product>("products", id);

    // Update image library - remove images for this product
    const imageLibrary = await readCollection<any>("image_library");
    const filteredLibrary = imageLibrary.filter((img) => img.productId !== id);
    const { writeCollection } = await import("@/lib/db");
    await writeCollection("image_library", filteredLibrary);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
