"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Package, Heart, Calendar, Ticket } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orderCount, setOrderCount] = useState(0);
  const [couponCount, setCouponCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, couponsRes] = await Promise.all([
          fetch("/api/orders?mine=true"),
          fetch("/api/admin/coupons"),
        ]);
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrderCount((data.orders || []).length);
        }
        if (couponsRes.ok) {
          const data = await couponsRes.json();
          setCouponCount((data.coupons || []).filter((c: any) => c.isActive).length);
        }
      } catch {
        // ignore
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-section mb-2">
          {t("account.welcomeBack")}, {user?.name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("account.manageAccount")}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-gray-50 dark:bg-luxury-gray/50 rounded-lg">
          <Package className="w-8 h-8 text-luxury-gold mb-3" />
          <p className="text-2xl font-bold">{orderCount}</p>
          <p className="text-sm text-gray-500">{t("account.totalOrders")}</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-luxury-gray/50 rounded-lg">
          <Heart className="w-8 h-8 text-luxury-gold mb-3" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">{t("account.wishlistItems")}</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-luxury-gray/50 rounded-lg">
          <Ticket className="w-8 h-8 text-luxury-gold mb-3" />
          <p className="text-2xl font-bold">{couponCount}</p>
          <p className="text-sm text-gray-500">{t("account.availableCoupons")}</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-luxury-gray/50 rounded-lg">
          <Calendar className="w-8 h-8 text-luxury-gold mb-3" />
          <p className="text-sm font-medium">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "—"}
          </p>
          <p className="text-sm text-gray-500">{t("account.memberSince")}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/account/orders"
          className="p-6 bg-white dark:bg-luxury-gray rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <Package className="w-6 h-6 text-luxury-gold mb-2" />
          <p className="font-medium">{t("account.myOrders")}</p>
          <p className="text-sm text-gray-500">{t("account.trackOrder")}</p>
        </Link>
        <Link
          href="/account/addresses"
          className="p-6 bg-white dark:bg-luxury-gray rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <Heart className="w-6 h-6 text-luxury-gold mb-2" />
          <p className="font-medium">{t("account.addresses")}</p>
          <p className="text-sm text-gray-500">{t("account.myAddresses")}</p>
        </Link>
      </div>
    </div>
  );
}
