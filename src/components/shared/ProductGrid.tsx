
import { ProductCard } from "@/components/shared/ProductCard";
import type { Product } from "@/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  onQuickView?: (product: Product) => void;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({
  products,
  title,
  subtitle,
  viewAllHref,
  onQuickView,
  columns = 4,
}: ProductGridProps) {
  const { t } = useLanguage();

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <section className="section-padding">
      <div className="container-luxury">
        {(title || viewAllHref) && (
          <div className="flex items-end justify-between mb-10">
            <div>
              {title && (
                <h2 className="heading-section mb-2">{title}</h2>
              )}
              {subtitle && (
                <p className="text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="hidden sm:flex items-center gap-2 text-sm tracking-wider uppercase hover:text-luxury-gold transition-colors"
              >
                {t("home.viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        <div className={`grid ${gridCols[columns]} gap-6 lg:gap-8`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        {viewAllHref && (
          <div className="mt-8 text-center sm:hidden">
            <Link href={viewAllHref} className="btn-secondary">
              {t("home.viewAll")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
