"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Package, FileText, ExternalLink, XCircle, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import type { Order } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  preparing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  packed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  shipped: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  returned: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export default function AccountOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders?mine=true");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const canCancel = (order: Order): boolean => {
    if (["delivered", "cancelled", "rejected", "refunded", "returned"].includes(order.orderStatus)) {
      return false;
    }
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    return orderAge <= 24 * 60 * 60 * 1000;
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm(t("account.cancelConfirm"))) return;
    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: "cancelled" }),
      });
      if (res.ok) {
        // Refresh orders
        const fetchRes = await fetch("/api/orders?mine=true");
        if (fetchRes.ok) {
          const data = await fetchRes.json();
          setOrders(data.orders || []);
        }
      } else {
        const data = await res.json();
        alert(data.error || t("account.cancelExpired"));
      }
    } catch {
      alert("Network error");
    } finally {
      setCancellingId(null);
    }
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
      <h1 className="heading-section">{t("account.myOrders")}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t("account.noOrders")}</p>
          <Link href="/shop" className="btn-primary mt-4 inline-flex">
            {t("home.shopNow")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 lg:p-6 bg-white dark:bg-luxury-gray rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {t("admin.orders.items")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.orderStatus] || "bg-gray-100"}`}>
                    {t(`orderStatus.${order.orderStatus}` as any)}
                  </span>
                </div>
              </div>

              {/* Order items preview */}
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="relative w-10 h-10 flex-shrink-0 bg-gray-100 rounded">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover rounded" />
                    )}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-medium">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              {/* Prescription image (uploaded by customer for prescription glasses) */}
              {order.prescriptionImage && (
                <div className="mb-3 flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <a
                    href={order.prescriptionImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-14 h-14 flex-shrink-0 bg-white dark:bg-gray-800 rounded border border-blue-300 dark:border-blue-700 overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.prescriptionImage}
                      alt={t("prescription.uploadImage") !== "prescription.uploadImage" ? t("prescription.uploadImage") : "Prescription"}
                      className="w-full h-full object-contain"
                    />
                  </a>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-300">
                      {t("prescription.uploadImage") !== "prescription.uploadImage" ? t("prescription.uploadImage") : "Prescription Image"}
                    </p>
                    <a
                      href={order.prescriptionImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
                    >
                      {t("common.view") !== "common.view" ? t("common.view") : "View full image"}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(order.total)}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`/order-tracking?id=${order.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {t("account.trackOrder")}
                  </a>
                  <Link
                    href={`/account/orders/${order.id}/invoice`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  >
                    <FileText className="w-3 h-3" />
                    {t("account.viewInvoice")}
                  </Link>
                  {canCancel(order) && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 disabled:opacity-50"
                    >
                      {cancellingId === order.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {t("account.cancelOrder")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
