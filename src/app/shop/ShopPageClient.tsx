"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { ProductCard } from "@/components/shared/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { QuickViewModal } from "@/components/shared/QuickViewModal";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  filterProducts,
  sortProducts,
  defaultFilters,
} from "@/lib/utils";
import type { Product, FilterState } from "@/types";
import { Glasses } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const getSortOptions = (language: string) => [
  { label: language === "ar" ? "مميز" : "Featured", value: "featured" },
  { label: language === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High", value: "price-asc" },
  { label: language === "ar" ? "السعر: من الأعلى للأقل" : "Price: High to Low", value: "price-desc" },
  { label: language === "ar" ? "الاسم: أ - ي" : "Name: A to Z", value: "name-asc" },
  { label: language === "ar" ? "الأعلى تقييماً" : "Top Rated", value: "rating" },
  { label: language === "ar" ? "الأحدث" : "Newest", value: "newest" },
];

const ITEMS_PER_PAGE = 12;

function ShopContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t, language } = useLanguage();
  const { products, loading } = useProducts();
  const sortOptions = getSortOptions(language);

  useEffect(() => {
    const newFilters = { ...defaultFilters };
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");
    const shape = searchParams.get("shape");
    const filter = searchParams.get("filter");
    const q = searchParams.get("q");

    if (brand) newFilters.brands = [brand];
    if (category) newFilters.categories = [category as FilterState["categories"][0]];
    if (shape) newFilters.frameShapes = [shape as FilterState["frameShapes"][0]];
    if (filter === "new-arrivals") newFilters.newArrivals = true;
    if (filter === "best-sellers") newFilters.bestSellers = true;
    if (filter === "polarized") newFilters.polarized = true;
    if (q) setSearchQuery(q);

    setFilters(newFilters);
    setCurrentPage(1);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, filters, searchQuery);
    return sortProducts(filtered, sortBy);
  }, [products, filters, sortBy, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container-luxury py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="heading-section mb-2">{t("shop.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("shop.subtitle")}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <ShopFilters
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setCurrentPage(1);
              }}
              productCount={filteredProducts.length}
            />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm tracking-wider uppercase"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("shop.filters")}
            </button>

            <p className="text-sm text-gray-500">
              {t("shop.showing")} {paginatedProducts.length} {t("shop.of")} {filteredProducts.length}
            </p>

            <div className="flex items-center gap-4 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm bg-transparent border border-gray-200 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-luxury-gold"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid" ? "text-luxury-gold" : "text-gray-400"
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list" ? "text-luxury-gold" : "text-gray-400"
                  )}
                  aria-label="List view"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : paginatedProducts.length === 0 ? (
            <EmptyState
              icon={Glasses}
              title={t("shop.noResults")}
              description={t("shop.noResultsDesc")}
              actionLabel={t("shop.clearFilters")}
              actionHref="/shop"
            />
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 gap-6"
                  : "space-y-6"
              )}
            >
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:border-luxury-gold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-10 h-10 text-sm transition-colors",
                    currentPage === i + 1
                      ? "bg-luxury-black dark:bg-luxury-white text-luxury-white dark:text-luxury-black"
                      : "hover:text-luxury-gold"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:border-luxury-gold transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-luxury-gray p-6 overflow-y-auto">
            <ShopFilters
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setCurrentPage(1);
              }}
              productCount={filteredProducts.length}
            />
          </div>
        </div>
      )}

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default function ShopPageClient() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
