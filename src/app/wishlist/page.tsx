"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { useProducts } from "@/context/ProductsContext";
import { ProductCard } from "@/components/shared/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function WishlistPage() {
  const { items } = useWishlist();
  const { t } = useLanguage();
  const { getProductById } = useProducts();
  const products = items
    .map((id) => getProductById(id))
    .filter((p) => p !== undefined);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={t("wishlist.empty")}
        description={t("wishlist.emptyDesc")}
        actionLabel={t("wishlist.browse")}
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="container-luxury py-8 lg:py-12">
      <h1 className="heading-section mb-8">
        {t("wishlist.title")} ({products.length})
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
