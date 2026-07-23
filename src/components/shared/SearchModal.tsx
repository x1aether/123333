"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice, getEffectivePrice, getLocalized } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { Product } from "@/types";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const { searchProducts } = useProducts();

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchProducts(query).slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query, searchProducts]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-luxury-gray shadow-luxury-lg animate-slide-up">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === "ar" ? "ابحث عن نظارات، علامات تجارية، أنماط..." : "Search eyewear, brands, styles..."}
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-400"
          />
          <button onClick={onClose} aria-label="Close search">
            <X className="w-5 h-5" />
          </button>
        </div>

        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-luxury-black/50 transition-colors"
              >
                <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-luxury-black">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {getLocalized(product.brand, product.brandAr, language)}
                  </p>
                  <p className="font-medium truncate">{getLocalized(product.name, product.nameAr, language)}</p>
                  <p className="text-sm text-luxury-gold">
                    {formatPrice(getEffectivePrice(product))}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {language === "ar" ? "لا توجد نتائج لـ" : "No results found for"} &ldquo;{query}&rdquo;
          </div>
        )}

        {query.length < 2 && (
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-3">{language === "ar" ? "عمليات بحث شائعة" : "Popular Searches"}</p>
            <div className="flex flex-wrap gap-2">
              {["Aviator", "Polarized", "Blue Light", "Ray-Ban", "Prescription"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 hover:border-luxury-gold hover:text-luxury-gold transition-colors"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
