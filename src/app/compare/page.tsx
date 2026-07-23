"use client";

import { ProductImage } from "@/components/ui/ProductImage";
import Link from "next/link";
import { GitCompareArrows, X, ShoppingBag } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice, getEffectivePrice, getLocalized, getTranslatedCategory, getTranslatedLabel, frameShapeTranslations, materialTranslations, genderTranslations, frameTypeTranslations } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare();
  const { addItem } = useCart();
  const { t, language } = useLanguage();
  const { getProductById } = useProducts();

  const products = items
    .map((id) => getProductById(id))
    .filter((p) => p !== undefined);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={GitCompareArrows}
        title={t("compare.empty")}
        description={t("compare.emptyDesc")}
        actionLabel={t("compare.addProduct")}
        actionHref="/shop"
      />
    );
  }

  const specLabels: Record<string, string> = {
    brand: language === "ar" ? "العلامة التجارية" : "Brand",
    price: language === "ar" ? "السعر" : "Price",
    category: language === "ar" ? "الفئة" : "Category",
    frameType: language === "ar" ? "نوع الإطار" : "Frame Type",
    frameShape: language === "ar" ? "شكل الإطار" : "Frame Shape",
    material: language === "ar" ? "المادة" : "Material",
    frameColor: language === "ar" ? "لون الإطار" : "Frame Color",
    lensColor: language === "ar" ? "لون العدسة" : "Lens Color",
    gender: language === "ar" ? "الجنس" : "Gender",
    uvProtection: language === "ar" ? "حماية UV" : "UV Protection",
    polarized: language === "ar" ? "مستقطب" : "Polarized",
    blueLightFilter: language === "ar" ? "فلتر الضوء الأزرق" : "Blue Light Filter",
    prescriptionCompatible: language === "ar" ? "الوصفة الطبية" : "Prescription",
    uv400: language === "ar" ? "حماية UV400" : "UV400",
    rating: language === "ar" ? "التقييم" : "Rating",
  };

  const specs = [
    { key: "brand" },
    { key: "price" },
    { key: "category" },
    { key: "frameType" },
    { key: "frameShape" },
    { key: "material" },
    { key: "frameColor" },
    { key: "lensColor" },
    { key: "gender" },
    { key: "uvProtection" },
    { key: "polarized" },
    { key: "blueLightFilter" },
    { key: "uv400" },
    { key: "rating" },
  ];

  return (
    <div className="container-luxury py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-section">{t("compare.title")}</h1>
        <button
          onClick={clearAll}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          {t("common.delete")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-4 w-40" />
              {products.map((product) => (
                <th key={product.id} className="p-4 text-center min-w-[200px]">
                  <div className="relative">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 dark:bg-luxury-gray rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <Link href={`/product/${product.slug}`}>
                      <div className="relative w-32 h-32 mx-auto mb-3 bg-gray-50 dark:bg-luxury-gray">
                        <ProductImage
                          src={product.images[0]}
                          alt={getLocalized(product.name, product.nameAr, language)}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="font-medium text-sm">{getLocalized(product.name, product.nameAr, language)}</p>
                    </Link>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() =>
                        addItem(product.id, product.variants?.[0]?.id || `${product.id}-default`)
                      }
                    >
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      {t("product.addToCart")}
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr
                key={spec.key}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="p-4 text-sm text-gray-500 font-medium">
                  {specLabels[spec.key]}
                </td>
                {products.map((product) => {
                  const val = product[spec.key as keyof typeof product];
                  let displayVal: string;
                  if (spec.key === "price") {
                    displayVal = formatPrice(getEffectivePrice(product));
                  } else if (spec.key === "polarized" || spec.key === "blueLightFilter" || spec.key === "uv400") {
                    displayVal = val ? t("common.yes") : t("common.no");
                  } else if (spec.key === "brand") {
                    displayVal = getLocalized(product.brand, product.brandAr, language);
                  } else if (spec.key === "category") {
                    displayVal = getTranslatedCategory(product.category, language);
                  } else if (spec.key === "frameShape") {
                    displayVal = getTranslatedLabel(frameShapeTranslations, product.frameShape, language);
                  } else if (spec.key === "material") {
                    displayVal = getTranslatedLabel(materialTranslations, product.material, language);
                  } else if (spec.key === "gender") {
                    displayVal = getTranslatedLabel(genderTranslations, product.gender, language);
                  } else if (spec.key === "frameType") {
                    displayVal = getTranslatedLabel(frameTypeTranslations, product.frameType, language);
                  } else {
                    displayVal = String(val ?? "—");
                  }
                  return (
                    <td key={product.id} className="p-4 text-sm text-center">
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
