"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ui/ProductImage";
import {
  ZoomIn,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const PLACEHOLDER_IMAGE = "/images/products/placeholder.jpg";

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const safeImages = (images ?? []).filter(
    (img): img is string => typeof img === "string" && img.trim().length > 0
  );
  const effectiveImages = safeImages.length > 0 ? safeImages : [PLACEHOLDER_IMAGE];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [show360, setShow360] = useState(false);

  const next = () =>
    setActiveIndex((i) => (i + 1) % effectiveImages.length);
  const prev = () =>
    setActiveIndex(
      (i) => (i - 1 + effectiveImages.length) % effectiveImages.length
    );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative aspect-square bg-gray-50 dark:bg-luxury-gray overflow-hidden cursor-zoom-in",
          zoomed && "cursor-zoom-out"
        )}
        onClick={() => setZoomed(!zoomed)}
      >
        {show360 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-luxury-black">
            <RotateCcw className="w-12 h-12 text-luxury-gold animate-spin mb-4" style={{ animationDuration: "3s" }} />
            <p className="text-sm text-gray-500 tracking-wider uppercase">360° Preview</p>
            <p className="text-xs text-gray-400 mt-1">Drag to rotate</p>
            <ProductImage
              src={effectiveImages[activeIndex]}
              alt={`${name} 360 view`}
              fill
              className="object-cover opacity-30"
            />
          </div>
        ) : (
          <ProductImage
            src={effectiveImages[activeIndex]}
            alt={`${name} - Image ${activeIndex + 1}`}
            fill
            className={cn(
              "object-cover transition-transform duration-500",
              zoomed && "scale-150"
            )}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        )}

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
            className="w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-luxury-black/80 backdrop-blur-sm"
            aria-label="Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShow360(!show360); }}
            className={cn(
              "w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-luxury-black/80 backdrop-blur-sm",
              show360 && "bg-luxury-gold text-luxury-black"
            )}
            aria-label="360 view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {effectiveImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-luxury-black/80 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-luxury-black/80 backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {effectiveImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {effectiveImages.map((img, i) => (
            <button
              key={i}
              onClick={() => { setActiveIndex(i); setShow360(false); }}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors",
                activeIndex === i
                  ? "border-luxury-gold"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <ProductImage src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
