"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getLocalized,
  getTranslatedLabel,
  frameShapeTranslations,
  materialTranslations,
} from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

const PLACEHOLDER_IMAGE = "/images/products/placeholder.jpg";

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { language, t } = useLanguage();

  if (!product) return null;

  const discount = getDiscountPercent(product);
  const productName = getLocalized(product.name, product.nameAr, language);
  const productBrand = getLocalized(product.brand, product.brandAr, language);
  const productDescription = getLocalized(product.description, product.descriptionAr, language);
  const productFrameShape = getTranslatedLabel(frameShapeTranslations, product.frameShape, language);
  const productMaterial = getTranslatedLabel(materialTranslations, product.material, language);
  const heroImage =
    product.images?.[0] && product.images[0].trim()
      ? product.images[0]
      : PLACEHOLDER_IMAGE;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white dark:bg-luxury-gray shadow-luxury-lg animate-slide-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-luxury-black/80 backdrop-blur-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-gray-50 dark:bg-luxury-black">
            <Image
              src={heroImage}
              alt={productName}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-8 flex flex-col justify-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {productBrand}
            </p>
            <h2 className="font-display text-2xl mb-2">{productName}</h2>
            <Rating rating={product.rating} reviewCount={product.reviewCount} size="md" className="mb-4" />

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-medium">
                {formatPrice(getEffectivePrice(product))}
              </span>
              {product.salePrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              {discount && <Badge variant="sale">-{discount}%</Badge>}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-3">
              {productDescription}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge>{productFrameShape}</Badge>
              <Badge>{productMaterial}</Badge>
              {product.polarized && <Badge variant="gold">{language === "ar" ? "مستقطب" : "Polarized"}</Badge>}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  addItem(product.id, product.variants?.[0]?.id || `${product.id}-default`);
                  onClose();
                }}
                className="flex-1"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t("product.addToCart")}
              </Button>
              <Link href={`/product/${product.slug}`} className="btn-secondary flex-1 text-center" onClick={onClose}>
                {language === "ar" ? "عرض التفاصيل" : "View Details"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
