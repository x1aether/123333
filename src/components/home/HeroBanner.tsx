"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export function HeroBanner() {
  const { t } = useLanguage();

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      <Image
        src="/images/hero/banner.jpg"
        alt="Premium luxury eyewear collection"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="relative h-full container-luxury flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-xl text-white"
        >
          <p className="text-luxury-gold text-sm tracking-[0.3em] uppercase mb-4">
            {t("home.heroTag")}
          </p>
          <h1 className="heading-display text-white mb-6">
            {t("home.heroTitle1")}
            <br />
            <span className="text-gradient-gold">{t("home.heroTitle2")}</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {t("home.heroDesc")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/shop">
              <Button variant="gold" size="lg">
                {t("home.shopCollection")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/shop?category=Sunglasses">
              <Button
                variant="secondary"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-luxury-black"
              >
                {t("home.exploreSunglasses")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8 text-white/60 text-xs tracking-widest uppercase">
        <span>{t("home.freeShipping")}</span>
        <span className="w-px h-4 bg-white/30" />
        <span>{t("home.warranty")}</span>
        <span className="w-px h-4 bg-white/30 hidden sm:block" />
        <span className="hidden sm:block">{t("home.returns")}</span>
      </div>
    </section>
  );
}
