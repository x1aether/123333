"use client";

import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedBrands } from "@/components/home/FeaturedBrands";
import { ShopByFrameShape } from "@/components/home/ShopByFrameShape";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductGrid } from "@/components/shared/ProductGrid";
import { useProducts } from "@/context/ProductsContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { ArrowRight, Sun, Glasses, Eye } from "lucide-react";

export default function HomePage() {
  const { t } = useLanguage();
  const { getBestSellers, getNewArrivals } = useProducts();
  const bestSellers = getBestSellers();
  const newArrivals = getNewArrivals();

  const categories = [
    {
      name: t("cat.sunglasses"),
      description: t("home.catSunglassesDesc"),
      icon: Sun,
      href: "/shop?category=Sunglasses",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      name: t("cat.prescription"),
      description: t("home.catPrescriptionDesc"),
      icon: Glasses,
      href: "/shop?category=Prescription+Glasses",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      name: t("cat.blueLight"),
      description: t("home.catBlueLightDesc"),
      icon: Eye,
      href: "/shop?category=Blue+Light+Glasses",
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div>
      <HeroBanner />

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-luxury-gold text-sm tracking-[0.3em] uppercase mb-3">
              {t("home.collections")}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight">
              {t("home.shopByCategory")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl p-8 transition-transform duration-300 hover:scale-[1.02] hover:shadow-luxury-lg"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90`}
                />
                <div className="relative z-10 text-white">
                  <cat.icon className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-xl font-semibold mb-2">{cat.name}</h3>
                  <p className="text-white/80 text-sm mb-4">{cat.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                    {t("home.shopNow")} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <ProductGrid
          products={bestSellers.slice(0, 4)}
          title={t("home.bestSellers")}
          subtitle={t("home.bestSellersDesc")}
          viewAllHref="/shop?filter=best-sellers"
        />
      )}

      <ShopByFrameShape />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductGrid
          products={newArrivals.slice(0, 4)}
          title={t("home.newArrivals")}
          subtitle={t("home.newArrivalsDesc")}
          viewAllHref="/shop?filter=new-arrivals"
        />
      )}

      <FeaturedBrands />
      <CustomerReviews />
      <InstagramGallery />
      <Newsletter />
    </div>
  );
}
