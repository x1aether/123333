import type { Metadata } from "next";
import ShopPageClient from "./ShopPageClient";

export const metadata: Metadata = {
  title: "Shop Eyewear",
  description:
    "Browse our premium collection of sunglasses, prescription glasses, blue light eyewear, and luxury fashion frames.",
};

export default function ShopPage() {
  return <ShopPageClient />;
}
