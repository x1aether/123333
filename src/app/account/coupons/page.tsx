"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Ticket, Copy, CheckCircle } from "lucide-react";

interface CouponData {
  id: string;
  code: string;
  description: string;
  discount: number;
  type: "percentage" | "fixed";
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

export default function AccountCouponsPage() {
  const { t } = useLanguage();
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch("/api/admin/coupons");
        if (res.ok) {
          const data = await res.json();
          setCoupons((data.coupons || []).filter((c: CouponData) => c.isActive));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="heading-section">{t("account.availableCoupons")}</h1>

      {coupons.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t("account.noCoupons")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="p-5 bg-white dark:bg-luxury-gray rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-luxury-gold/10 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-5 h-5 text-luxury-gold" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {coupon.type === "percentage" ? `${coupon.discount}%` : `${coupon.discount} EGP`}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">OFF</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{coupon.description}</p>
                {coupon.minPurchase > 0 && (
                  <p className="text-xs text-gray-500 mb-2">Min purchase: {coupon.minPurchase} EGP</p>
                )}
                {coupon.expiresAt && (
                  <p className="text-xs text-gray-400 mb-3">
                    Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono font-bold text-gray-900 dark:text-white text-center">
                    {coupon.code}
                  </code>
                  <button
                    onClick={() => copyCode(coupon.code)}
                    className="p-2 rounded-lg bg-luxury-black text-white hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black"
                  >
                    {copiedId === coupon.code ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
