"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const MAX_RECENT = 8;

interface RecentlyViewedContextType {
  items: string[];
  addItem: (productId: string) => void;
  clearAll: () => void;
}

const RecentlyViewedContext = createContext<
  RecentlyViewedContextType | undefined
>(undefined);

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("eyecare-recent");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("eyecare-recent", JSON.stringify(items));
  }, [items, mounted]);

  const addItem = useCallback((productId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const clearAll = useCallback(() => setItems([]), []);

  return (
    <RecentlyViewedContext.Provider value={{ items, addItem, clearAll }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context)
    throw new Error(
      "useRecentlyViewed must be used within RecentlyViewedProvider"
    );
  return context;
}
