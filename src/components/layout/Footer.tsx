"use client";

import Link from "next/link";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-luxury-black text-luxury-white">
      <div className="container-luxury section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
                <span className="text-luxury-black text-xs font-bold">EC</span>
              </div>
              <span className="font-display text-xl tracking-wide">Eye Care</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-luxury-gold transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-luxury-gold transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-luxury-gold transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg mb-6">{t("footer.shop")}</h4>
            <ul className="space-y-3">
              <li><Link href="/shop?category=Sunglasses" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("cat.sunglasses")}</Link></li>
              <li><Link href="/shop?category=Prescription+Glasses" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("cat.prescription")}</Link></li>
              <li><Link href="/shop?category=Blue+Light+Glasses" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("cat.blueLight")}</Link></li>
              <li><Link href="/shop?category=Reading+Glasses" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("cat.reading")}</Link></li>
              <li><Link href="/shop?category=Sports+Glasses" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("cat.sports")}</Link></li>
              <li><Link href="/shop?category=Accessories" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("cat.accessories")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg mb-6">{t("footer.brands")}</h4>
            <ul className="space-y-3">
              {["Ray-Ban", "Oakley", "Gucci", "Persol", "Gentle Monster", "Tom Ford"].map((brand) => (
                <li key={brand}>
                  <Link href={`/shop?brand=${brand}`} className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg mb-6">{t("footer.support")}</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("footer.contactUs")}</Link></li>
              <li><Link href="/order-tracking" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("footer.orderTracking")}</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("footer.shippingInfo")}</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("footer.returnsExchanges")}</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-luxury-gold transition-colors">{t("footer.faq")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg mb-6">{t("footer.newsletter")}</h4>
            <p className="text-sm text-gray-400 mb-4">{t("footer.newsletterDesc")}</p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="bg-luxury-gray border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button variant="gold" className="w-full" type="submit">
                {t("home.subscribe")}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <a href="tel:01261285404" className="flex items-center gap-2 hover:text-luxury-gold transition-colors">
                <Phone className="w-4 h-4" /> 01261285404
              </a>
              <a href="mailto:info@nit.net" className="flex items-center gap-2 hover:text-luxury-gold transition-colors">
                <Mail className="w-4 h-4" /> info@nit.net
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> 6th of October, Giza, Egypt
              </span>
            </div>
            <div className="text-sm text-gray-500 text-center md:text-end">
              <p>&copy; {new Date().getFullYear()} Eye Care. {t("footer.rights")}</p>
              <p className="mt-1">{t("footer.developedBy")} <span className="text-luxury-gold">OsamaAhmed</span></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
