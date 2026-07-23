"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Product } from "@/types";

/**
 * ProductsContext — client-side product cache sourced from MongoDB via
 * GET /api/products. Provides the same lookup helpers the storefront used to
 * import from the (now retired) static `@/data/products` module, so components
 * always reflect admin CRUD, stock changes and uploaded images.
 */

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getRelatedProducts: (product: Product) => Product[];
  getBestSellers: () => Product[];
  getNewArrivals: () => Product[];
  searchProducts: (query: string) => Product[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch {
      setError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<ProductsContextType>(() => {
    const getProductById = (id: string) => products.find((p) => p.id === id);
    const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
    return {
      products,
      loading,
      error,
      refresh,
      getProductById,
      getProductBySlug,
      getRelatedProducts: (product: Product) =>
        (product.relatedProductIds || [])
          .map((id) => getProductById(id))
          .filter((p): p is Product => p !== undefined),
      getBestSellers: () => products.filter((p) => p.isBestSeller),
      getNewArrivals: () => products.filter((p) => p.isNewArrival),
      searchProducts: (query: string) => {
        const raw = query.trim();
        if (!raw) return [];
        const q = raw.toLowerCase();
        return products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.frameShape.toLowerCase().includes(q) ||
            (p.material || "").toLowerCase().includes(q) ||
            (p.frameColor || "").toLowerCase().includes(q) ||
            (p.description || "").toLowerCase().includes(q) ||
            (p.nameAr && p.nameAr.includes(raw)) ||
            (p.brandAr && p.brandAr.includes(raw)) ||
            (p.categoryAr && p.categoryAr.includes(raw)) ||
            (p.descriptionAr && p.descriptionAr.includes(raw))
        );
      },
    };
  }, [products, loading, error, refresh]);

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within ProductsProvider");
  }
  return context;
}
