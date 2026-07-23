
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/ui/ProductImage";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice, getEffectivePrice, getLocalized } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuth();
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const { t, language } = useLanguage();
  const { getProductById } = useProducts();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={t("cart.empty")}
        description={t("cart.emptyDesc")}
        actionLabel={t("cart.startShopping")}
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="container-luxury py-8 lg:py-12">
      <h1 className="heading-section mb-8">
        {t("cart.title")} ({itemCount})
      </h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => {
            const product = getProductById(item.productId);
            if (!product) return null;
            const variant = product.variants.find((v) => v.id === item.variantId);
            const price = getEffectivePrice(product);

            return (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-4 sm:gap-6 pb-6 border-b border-gray-200 dark:border-gray-700"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 dark:bg-luxury-gray"
                >
                  <ProductImage
                    src={variant?.image || product.images[0]}
                    alt={getLocalized(product.name, product.nameAr, language)}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {getLocalized(product.brand, product.brandAr, language)}
                  </p>
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-medium hover:text-luxury-gold transition-colors"
                  >
                    {getLocalized(product.name, product.nameAr, language)}
                  </Link>
                  {variant && (
                    <p className="text-sm text-gray-500 mt-1">
                      {variant.frameColor} / {variant.lensColor}
                    </p>
                  )}
                  <p className="font-medium mt-2">{formatPrice(price)}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.variantId,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        removeItem(item.productId, item.variantId)
                      }
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-28 p-6 bg-gray-50 dark:bg-luxury-gray/50 space-y-4">
            <h2 className="font-display text-xl">{t("cart.orderSummary")}</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t("cart.shipping")}</span>
              <span className="text-green-600">{t("cart.free")}</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between font-medium text-lg">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout">
              <Button className="w-full" size="lg">
                {t("cart.checkout")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link
              href="/shop"
              className="block text-center text-sm text-gray-500 hover:text-luxury-gold transition-colors"
            >
              {t("cart.continue")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
