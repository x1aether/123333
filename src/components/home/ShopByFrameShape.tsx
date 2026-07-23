"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { frameShapes } from "@/data/constants";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslatedLabel, frameShapeTranslations } from "@/lib/utils";

const shapeImages: Record<string, string> = {
  Aviator: "/images/placeholder.svg",
  Round: "/images/placeholder.svg",
  Square: "/images/placeholder.svg",
  Rectangle: "/images/placeholder.svg",
  "Cat Eye": "/images/placeholder.svg",
  Oval: "/images/placeholder.svg",
  Wayfarer: "/images/placeholder.svg",
  Geometric: "/images/placeholder.svg",
  Butterfly: "/images/placeholder.svg",
};

export function ShopByFrameShape() {
  const displayShapes = frameShapes.slice(0, 6);
  const { t, language } = useLanguage();

  return (
    <section className="section-padding bg-gray-50 dark:bg-luxury-gray/30">
      <div className="container-luxury">
        <div className="text-center mb-12">
          <h2 className="heading-section mb-3">{t("home.frameShapeTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            {t("home.frameShapeDesc")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayShapes.map((shape, i) => (
            <motion.div
              key={shape}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/shop?shape=${encodeURIComponent(shape)}`}
                className="group block text-center"
              >
                <div className="relative aspect-square overflow-hidden bg-white dark:bg-luxury-gray mb-3">
                  <Image
                    src={shapeImages[shape]}
                    alt={shape}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <span className="text-sm tracking-wider uppercase group-hover:text-luxury-gold transition-colors">
                  {getTranslatedLabel(frameShapeTranslations, shape, language)}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
