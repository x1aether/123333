"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const MAX_COMPARE = 4;

interface CompareContextType {
  items: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isComparing: (productId: string) => boolean;
  clearAll: () => void;
  count: number;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("eyecare-compare");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("eyecare-compare", JSON.stringify(items));
  }, [items, mounted]);

  const addItem = useCallback((productId: string) => {
    setItems((prev) => {
      if (prev.includes(productId) || prev.length >= MAX_COMPARE) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggleItem = useCallback((productId: string) => {
    setItems((prev) => {
      if (prev.includes(productId))
        return prev.filter((id) => id !== productId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, productId];
    });
  }, []);

  const isComparing = useCallback(
    (productId: string) => items.includes(productId),
    [items]
  );

  const clearAll = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isComparing,
        clearAll,
        count: items.length,
        isFull: items.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context)
    throw new Error("useCompare must be used within CompareProvider");
  return context;
}
