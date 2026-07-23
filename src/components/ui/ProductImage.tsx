"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

/*
 * ProductImage — a thin wrapper around next/image that gracefully falls back
 * to a local placeholder when the source is empty OR fails to load at runtime.
 *
 * Product image URLs in the catalog are often external (e.g. Unsplash) and can
 * disappear over time, which would otherwise render a broken-image icon. This
 * component keeps the storefront resilient without changing any stored data.
 */

const FALLBACK_IMAGE = "/images/products/placeholder.jpg";

function resolveSrc(src: ImageProps["src"]): ImageProps["src"] {
  if (typeof src === "string") {
    return src.trim() ? src : FALLBACK_IMAGE;
  }
  // Static imports / non-string sources are always valid.
  return src ?? FALLBACK_IMAGE;
}

export function ProductImage({ src, alt = "", onError, ...rest }: ImageProps) {
  const [imgSrc, setImgSrc] = useState<ImageProps["src"]>(() => resolveSrc(src));

  // Keep internal state in sync when the incoming src changes (e.g. gallery
  // navigation or variant switch), so a previous fallback doesn't stick.
  useEffect(() => {
    setImgSrc(resolveSrc(src));
  }, [src]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onError={(e) => {
        if (imgSrc !== FALLBACK_IMAGE) {
          setImgSrc(FALLBACK_IMAGE);
        }
        onError?.(e);
      }}
    />
  );
}
