"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { brands } from "@/data/constants";
import { useLanguage } from "@/context/LanguageContext";

export function FeaturedBrands() {
  const { t } = useLanguage();

  return (
    <section className="py-12 border-b border-gray-200 dark:border-gray-800">
      <div className="container-luxury">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-gray-500 mb-8">
          {t("home.featuredBrands")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {brands.map((brand, i) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/shop?brand=${encodeURIComponent(brand)}`}
                className="font-display text-lg lg:text-xl text-gray-400 hover:text-luxury-gold transition-colors duration-300"
              >
                {brand}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
