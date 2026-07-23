"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";
import { useState } from "react";
import { Heart, ShoppingBag, Eye, GitCompareArrows } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getLocalized,
  cn,
} from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { toggleItem, isWishlisted } = useWishlist();
  const { addItem } = useCart();
  const { toggleItem: toggleCompare, isComparing } = useCompare();
  const { language } = useLanguage();
  const [imageIndex] = useState(0);
  const discount = getDiscountPercent(product);
  const price = getEffectivePrice(product);

  // Localized fields
  const productName = getLocalized(product.name, product.nameAr, language);
  const productBrand = getLocalized(product.brand, product.brandAr, language);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, product.variants?.[0]?.id || `${product.id}-default`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-luxury-gray mb-4">
          <ProductImage
            src={
              product.images?.[imageIndex] && product.images[imageIndex].trim()
                ? product.images[imageIndex]
                : "/images/products/placeholder.jpg"
            }
            alt={productName}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNewArrival && <Badge variant="new">New</Badge>}
            {discount && <Badge variant="sale">-{discount}%</Badge>}
            {product.polarized && <Badge variant="gold">Polarized</Badge>}
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(product.id);
              }}
              className={cn(
                "w-9 h-9 flex items-center justify-center bg-white/90 dark:bg-luxury-gray/90 backdrop-blur-sm shadow-sm hover:bg-luxury-gold hover:text-luxury-black transition-colors",
                isWishlisted(product.id) && "bg-luxury-gold text-luxury-black"
              )}
              aria-label="Add to wishlist"
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  isWishlisted(product.id) && "fill-current"
                )}
              />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(product.id);
              }}
              className={cn(
                "w-9 h-9 flex items-center justify-center bg-white/90 dark:bg-luxury-gray/90 backdrop-blur-sm shadow-sm hover:bg-luxury-gold hover:text-luxury-black transition-colors",
                isComparing(product.id) && "bg-luxury-gold text-luxury-black"
              )}
              aria-label="Compare"
            >
              <GitCompareArrows className="w-4 h-4" />
            </button>
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="w-9 h-9 flex items-center justify-center bg-white/90 dark:bg-luxury-gray/90 backdrop-blur-sm shadow-sm hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className="absolute bottom-0 left-0 right-0 py-3 bg-luxury-black/90 text-luxury-white text-sm tracking-wider uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Quick Add
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wider uppercase">
            {productBrand}
          </p>
          <h3 className="font-medium text-sm lg:text-base group-hover:text-luxury-gold transition-colors">
            {productName}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-medium">{formatPrice(price)}</span>
            {product.salePrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <Rating rating={product.rating} size="sm" />
        </div>
      </Link>
    </motion.div>
  );
}
