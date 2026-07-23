"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  GitCompareArrows,
  Languages,
  LogOut,
  LayoutDashboard,
  Package,
  ClipboardList,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/shared/SearchModal";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container-luxury">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-luxury-black dark:bg-luxury-gold rounded-full flex items-center justify-center">
                <span className="text-luxury-white dark:text-luxury-black text-xs font-bold">
                  EC
                </span>
              </div>
              <span className="font-display text-xl lg:text-2xl tracking-wide">
                Eye Care
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-sm tracking-wider uppercase hover:text-luxury-gold transition-colors">
                {t("nav.home")}
              </Link>
              <Link href="/shop" className="text-sm tracking-wider uppercase hover:text-luxury-gold transition-colors">
                {t("nav.shop")}
              </Link>
              <Link href="/shop?category=Sunglasses" className="text-sm tracking-wider uppercase hover:text-luxury-gold transition-colors">
                {t("cat.sunglasses")}
              </Link>
              {isAuthenticated && !isAdmin && (
                <Link href="/account" className="text-sm tracking-wider uppercase hover:text-luxury-gold transition-colors">
                  {t("nav.account")}
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin/dashboard" className="text-sm tracking-wider uppercase hover:text-luxury-gold transition-colors">
                  {t("nav.dashboard")}
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:text-luxury-gold transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 hover:text-luxury-gold transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="p-2 hover:text-luxury-gold transition-colors"
                aria-label="Switch language"
              >
                <Languages className="w-5 h-5" />
                <span className="ml-1 text-xs font-medium">{language === "en" ? "عربي" : "EN"}</span>
              </button>
              <Link
                href="/compare"
                className="p-2 hover:text-luxury-gold transition-colors relative hidden sm:block"
              >
                <GitCompareArrows className="w-5 h-5" />
                {compareCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-luxury-gold text-luxury-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </Link>
              <Link
                href="/wishlist"
                className="p-2 hover:text-luxury-gold transition-colors relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-luxury-gold text-luxury-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="p-2 hover:text-luxury-gold transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-luxury-gold text-luxury-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Auth buttons */}
              {!isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-sm font-medium hover:text-luxury-gold transition-colors"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 text-sm font-medium bg-luxury-black dark:bg-luxury-white text-luxury-white dark:text-luxury-black rounded-lg hover:bg-luxury-gray dark:hover:bg-luxury-silver transition-colors"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              ) : (
                <Link
                  href={isAdmin ? "/admin/dashboard" : "/account"}
                  className="p-2 hover:text-luxury-gold transition-colors hidden sm:block"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={closeMobile}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-luxury-gray shadow-luxury-lg transition-transform duration-300 rtl:left-auto rtl:right-0",
            mobileOpen ? "translate-x-0 rtl:translate-x-0" : "-translate-x-full rtl:translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <span className="font-display text-xl">{t("nav.menu")}</span>
            <button onClick={closeMobile} aria-label="Close menu">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User info if authenticated */}
          {isAuthenticated && user && (
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-luxury-gray/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-luxury-gold" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="p-6 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
            <Link href="/" className="block text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
              {t("nav.home")}
            </Link>
            <Link href="/shop" className="block text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
              {t("nav.shop")}
            </Link>
            <Link href="/shop?category=Sunglasses" className="block text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
              {t("cat.sunglasses")}
            </Link>

            <hr className="border-gray-200 dark:border-gray-700" />

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                      <LayoutDashboard className="w-5 h-5" /> {t("nav.dashboard")}
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                      <Package className="w-5 h-5" /> {t("admin.products")}
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                      <ClipboardList className="w-5 h-5" /> {t("admin.orders")}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/account" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                      <User className="w-5 h-5" /> {t("nav.myAccount")}
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                      <ClipboardList className="w-5 h-5" /> {t("nav.orders")}
                    </Link>
                  </>
                )}
                <Link href="/wishlist" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                  <Heart className="w-5 h-5" /> {t("nav.wishlist")} ({wishlistCount})
                </Link>
                <Link href="/compare" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                  <GitCompareArrows className="w-5 h-5" /> {t("nav.compare")} ({compareCount})
                </Link>
                <Link href="/order-tracking" className="block text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                  {t("nav.trackOrder")}
                </Link>

                <hr className="border-gray-200 dark:border-gray-700" />

                <button
                  onClick={() => { logout(); closeMobile(); }}
                  className="flex items-center gap-2 text-lg tracking-wide text-red-500 hover:text-red-600 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" /> {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/wishlist" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                  <Heart className="w-5 h-5" /> {t("nav.wishlist")}
                </Link>
                <Link href="/compare" className="flex items-center gap-2 text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                  <GitCompareArrows className="w-5 h-5" /> {t("nav.compare")}
                </Link>
                <Link href="/order-tracking" className="block text-lg tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                  {t("nav.trackOrder")}
                </Link>

                <hr className="border-gray-200 dark:border-gray-700" />

                <Link href="/login" className="block text-lg font-medium tracking-wide hover:text-luxury-gold transition-colors" onClick={closeMobile}>
                  {t("nav.login")}
                </Link>
                <Link href="/register" className="block text-lg font-medium tracking-wide text-luxury-gold" onClick={closeMobile}>
                  {t("nav.register")}
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
