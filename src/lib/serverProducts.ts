import { readCollection, readOne, findOneBy } from "@/lib/db";
import type { Product } from "@/types";

/**
 * Server-side product data access.
 *
 * MongoDB is the single source of truth for products. Storefront pages and the
 * public /api/products endpoints read through these helpers so that admin
 * create/edit/delete, stock changes and uploaded images are reflected
 * everywhere immediately.
 */

/** A product is visible on the storefront unless explicitly hidden/unpublished. */
export function isVisible(p: Product): boolean {
  return p.isHidden !== true && p.isPublished !== false;
}

/** All storefront-visible products. */
export async function getVisibleProducts(): Promise<Product[]> {
  const products = await readCollection<Product>("products");
  return products.filter(isVisible);
}

/** A single visible product by slug (null if missing or hidden). */
export async function getVisibleProductBySlug(slug: string): Promise<Product | null> {
  const product = await findOneBy<Product>("products", { slug });
  if (!product || !isVisible(product)) return null;
  return product;
}

/** A single product by id regardless of visibility (used internally). */
export async function getProductByIdDb(id: string): Promise<Product | null> {
  return readOne<Product>("products", id);
}

/** Related products for a given product, resolved from relatedProductIds. */
export async function getRelatedProductsDb(product: Product): Promise<Product[]> {
  const ids = product.relatedProductIds || [];
  if (ids.length === 0) return [];
  const all = await getVisibleProducts();
  const byId = new Map(all.map((p) => [p.id, p]));
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));
}
