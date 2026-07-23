import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Eye Care — Premium Luxury Eyewear",
    template: "%s | Eye Care",
  },
  description:
    "Discover premium sunglasses, prescription glasses, blue light eyewear, and luxury fashion frames from world-renowned brands. Shop Ray-Ban, Oakley, Gucci, Persol, and more.",
  keywords: [
    "eyewear",
    "sunglasses",
    "prescription glasses",
    "blue light glasses",
    "luxury eyewear",
    "Ray-Ban",
    "Oakley",
    "Gucci eyewear",
  ],
  openGraph: {
    title: "Eye Care — Premium Luxury Eyewear",
    description:
      "Premium online store for sunglasses, prescription glasses, and luxury fashion eyewear.",
    type: "website",
    locale: "en_US",
    siteName: "Eye Care",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
