"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";
import { useProducts } from "@/context/ProductsContext";
import { getEffectivePrice } from "@/lib/utils";

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, variantId: string, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const { getProductById } = useProducts();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("eyecare-cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("eyecare-cart", JSON.stringify(items));
  }, [items, mounted]);

  const addItem = useCallback(
    (productId: string, variantId: string, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === productId && i.variantId === variantId
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { productId, variantId, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.variantId === variantId
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    if (!product) return sum;
    return sum + getEffectivePrice(product) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
