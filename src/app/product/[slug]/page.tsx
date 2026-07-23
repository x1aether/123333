import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVisibleProductBySlug, getRelatedProductsDb } from "@/lib/serverProducts";
import { ProductDetail } from "@/components/product/ProductDetail";

// Products live in MongoDB and can change at any time, so this page must be
// rendered dynamically rather than statically generated from a fixed list.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getVisibleProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const placeholderUrl = "/images/products/placeholder.jpg";
  const ogImage =
    product.images?.[0] && product.images[0].trim()
      ? product.images[0]
      : placeholderUrl;

  return {
    title: `${product.name} — ${product.brand}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: ogImage }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getVisibleProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProductsDb(product);

  return <ProductDetail product={product} relatedProducts={related} />;
}
