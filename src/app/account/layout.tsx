"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", labelKey: "account.overview", icon: User, exact: true },
  { href: "/account/orders", labelKey: "account.myOrders", icon: Package },
  { href: "/account/profile", labelKey: "account.profile", icon: User },
  { href: "/account/addresses", labelKey: "account.addresses", icon: MapPin },
  { href: "/account/coupons", labelKey: "account.coupons", icon: Ticket },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    // Admins are normally redirected to their dashboard, but they must be able
    // to view/print customer invoices (the invoice API authorizes admins).
    const isInvoiceView = pathname.includes("/invoice");
    if (!isLoading && user?.role === "admin" && !isInvoiceView) {
      router.push("/admin/dashboard");
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Invoice pages render full-bleed (their own toolbar + printable template),
  // without the account sidebar chrome — for both customers and admins.
  if (pathname.includes("/invoice")) {
    return <>{children}</>;
  }

  return (
    <div className="container-luxury py-8 lg:py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          {/* User info */}
          <div className="p-4 bg-gray-50 dark:bg-luxury-gray rounded-lg mb-4">
            <div className="w-12 h-12 rounded-full bg-luxury-gold/20 flex items-center justify-center mb-2">
              <User className="w-6 h-6 text-luxury-gold" />
            </div>
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-luxury-black dark:bg-luxury-white text-white dark:text-luxury-black font-medium"
                      : "hover:bg-gray-50 dark:hover:bg-luxury-gray text-gray-600 dark:text-gray-400 hover:text-luxury-black dark:hover:text-luxury-white"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{t(item.labelKey as any)}</span>
                  <ChevronRight className={cn("w-4 h-4 opacity-50", isActive && "opacity-100")} />
                </Link>
              );
            })}

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              {t("account.signOut")}
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
