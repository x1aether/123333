"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface CollectionBannerProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  reversed?: boolean;
}

export function CollectionBanner({
  title,
  subtitle,
  description,
  image,
  href,
  reversed = false,
}: CollectionBannerProps) {
  const { t } = useLanguage();

  return (
    <section className="section-padding">
      <div className="container-luxury">
        <div
          className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
            reversed ? "lg:[direction:rtl]" : ""
          }`}
        >
          <motion.div
            initial={{ opacity: 0, x: reversed ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={reversed ? "lg:[direction:ltr]" : ""}
          >
            <p className="text-luxury-gold text-sm tracking-[0.3em] uppercase mb-3">
              {subtitle}
            </p>
            <h2 className="heading-section mb-4">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              {description}
            </p>
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm tracking-wider uppercase hover:text-luxury-gold transition-colors group"
            >
              {t("home.shopNow")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: reversed ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`relative aspect-[4/3] overflow-hidden ${reversed ? "lg:[direction:ltr]" : ""}`}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
