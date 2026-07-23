import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product, FilterState } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Localization helpers ─────────────────────────────────────────────────────
/** Get localized product field based on language */
export function getLocalized(
  enValue: string | undefined,
  arValue: string | undefined,
  language: string
): string {
  if (language === "ar" && arValue) return arValue;
  return enValue || "";
}

/** Get localized array field */
export function getLocalizedArray(
  enValue: string[] | undefined,
  arValue: string[] | undefined,
  language: string
): string[] {
  if (language === "ar" && arValue && arValue.length > 0) return arValue;
  return enValue || [];
}

/** Category translation map */
export const categoryTranslations: Record<string, { en: string; ar: string }> = {
  "Sunglasses": { en: "Sunglasses", ar: "نظارات شمسية" },
  "Prescription Glasses": { en: "Prescription Glasses", ar: "نظارات طبية" },
  "Reading Glasses": { en: "Reading Glasses", ar: "نظارات قراءة" },
  "Blue Light Glasses": { en: "Blue Light Glasses", ar: "نظارات الضوء الأزرق" },
  "Fashion Eyewear": { en: "Fashion Eyewear", ar: "نظارات أزياء" },
  "Sports Glasses": { en: "Sports Glasses", ar: "نظارات رياضية" },
  "Contact Lenses": { en: "Contact Lenses", ar: "عدسات لاصقة" },
  "Medical Contact Lenses": { en: "Medical Contact Lenses", ar: "عدسات لاصقة طبية" },
  "Accessories": { en: "Accessories", ar: "إكسسوارات" },
};

/** Get translated category name */
export function getTranslatedCategory(category: string, language: string): string {
  const translation = categoryTranslations[category];
  if (!translation) return category;
  return language === "ar" ? translation.ar : translation.en;
}

/** Frame shape translations */
export const frameShapeTranslations: Record<string, { en: string; ar: string }> = {
  "Aviator": { en: "Aviator", ar: "أفياتور" },
  "Round": { en: "Round", ar: "دائري" },
  "Square": { en: "Square", ar: "مربع" },
  "Rectangle": { en: "Rectangle", ar: "مستطيل" },
  "Cat Eye": { en: "Cat Eye", ar: "عين القط" },
  "Oval": { en: "Oval", ar: "بيضاوي" },
  "Wayfarer": { en: "Wayfarer", ar: "وايفارير" },
  "Geometric": { en: "Geometric", ar: "هندسي" },
  "Butterfly": { en: "Butterfly", ar: "فراشة" },
};

/** Material translations */
export const materialTranslations: Record<string, { en: string; ar: string }> = {
  "Acetate": { en: "Acetate", ar: "أسيتات" },
  "Metal": { en: "Metal", ar: "معدن" },
  "Titanium": { en: "Titanium", ar: "تيتانيوم" },
  "TR90": { en: "TR90", ar: "TR90" },
  "Stainless Steel": { en: "Stainless Steel", ar: "ستانلس ستيل" },
  "Carbon Fiber": { en: "Carbon Fiber", ar: "ألياف كربونية" },
  "Wood": { en: "Wood", ar: "خشب" },
};

/** Gender translations */
export const genderTranslations: Record<string, { en: string; ar: string }> = {
  "Men": { en: "Men", ar: "رجال" },
  "Women": { en: "Women", ar: "نساء" },
  "Unisex": { en: "Unisex", ar: "للجنسين" },
};

/** Frame type translations */
export const frameTypeTranslations: Record<string, { en: string; ar: string }> = {
  "Full Rim": { en: "Full Rim", ar: "إطار كامل" },
  "Semi-Rimless": { en: "Semi-Rimless", ar: "نصف إطار" },
  "Rimless": { en: "Rimless", ar: "بدون إطار" },
  "Wrap": { en: "Wrap", ar: "ملفوف" },
  "Shield": { en: "Shield", ar: "درع" },
};

/** Get translated label from a translation map */
export function getTranslatedLabel(
  translations: Record<string, { en: string; ar: string }>,
  value: string,
  language: string
): string {
  const translation = translations[value];
  if (!translation) return value;
  return language === "ar" ? translation.ar : translation.en;
}

export function formatPrice(price: number): string {
  // Egyptian Pound formatting used across the whole storefront.
  // Example: 1999 -> "1,999 ج.م"
  const amount = new Intl.NumberFormat("en-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(price) ? price : 0);
  return `${amount} ج.م`;
}

export function getEffectivePrice(product: Product): number {
  return product.salePrice ?? product.price;
}

export function getDiscountPercent(product: Product): number | null {
  if (!product.salePrice) return null;
  return Math.round(
    ((product.price - product.salePrice) / product.price) * 100
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function filterProducts(
  products: Product[],
  filters: FilterState,
  searchQuery: string
): Product[] {
  return products.filter((product) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.frameShape.toLowerCase().includes(query) ||
        product.material.toLowerCase().includes(query) ||
        (product.nameAr && product.nameAr.includes(searchQuery)) ||
        (product.brandAr && product.brandAr.includes(searchQuery)) ||
        (product.categoryAr && product.categoryAr.includes(searchQuery)) ||
        (product.descriptionAr && product.descriptionAr.includes(searchQuery));
      if (!matchesSearch) return false;
    }

    if (filters.brands.length && !filters.brands.includes(product.brand))
      return false;

    const price = getEffectivePrice(product);
    if (price < filters.priceMin || price > filters.priceMax) return false;

    if (
      filters.frameShapes.length &&
      !filters.frameShapes.includes(product.frameShape)
    )
      return false;

    if (
      filters.materials.length &&
      !filters.materials.includes(product.material)
    )
      return false;

    if (
      filters.frameColors.length &&
      !filters.frameColors.includes(product.frameColor)
    )
      return false;

    if (
      filters.lensColors.length &&
      !filters.lensColors.includes(product.lensColor)
    )
      return false;

    if (filters.genders.length && !filters.genders.includes(product.gender))
      return false;

    if (filters.polarized !== null && product.polarized !== filters.polarized)
      return false;

    if (
      filters.uvProtection !== null &&
      (filters.uvProtection ? product.uvProtection !== "None" : product.uvProtection === "None")
    )
      return false;

    if (
      filters.blueLightFilter !== null &&
      product.blueLightFilter !== filters.blueLightFilter
    )
      return false;

    if (
      filters.uv400 !== null &&
      Boolean(product.uv400) !== filters.uv400
    )
      return false;

    if (
      filters.categories.length &&
      !filters.categories.includes(product.category)
    )
      return false;

    if (filters.newArrivals && !product.isNewArrival) return false;
    if (filters.bestSellers && !product.isBestSeller) return false;

    return true;
  });
}

export function sortProducts(
  products: Product[],
  sortBy: string
): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case "price-asc":
      return sorted.sort(
        (a, b) => getEffectivePrice(a) - getEffectivePrice(b)
      );
    case "price-desc":
      return sorted.sort(
        (a, b) => getEffectivePrice(b) - getEffectivePrice(a)
      );
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sorted.sort(
        (a, b) => Number(b.isNewArrival) - Number(a.isNewArrival)
      );
    default:
      return sorted.sort(
        (a, b) => Number(b.isBestSeller) - Number(a.isBestSeller)
      );
  }
}

export const defaultFilters: FilterState = {
  brands: [],
  priceMin: 0,
  priceMax: 1000,
  frameShapes: [],
  materials: [],
  frameColors: [],
  lensColors: [],
  genders: [],
  polarized: null,
  uvProtection: null,
  blueLightFilter: null,
  uv400: null,
  categories: [],
  newArrivals: false,
  bestSellers: false,
};

export const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "newest" },
];
