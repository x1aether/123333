"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Truck, CheckCircle, Search, Clock, Box, MapPin, XCircle, Ban, Loader2, FileText } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import type { Order, OrderStatus } from "@/types";

const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  accepted: CheckCircle,
  preparing: Box,
  packed: Package,
  shipped: Truck,
  out_for_delivery: MapPin,
  delivered: CheckCircle,
  cancelled: XCircle,
  rejected: Ban,
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else {
        const data = await res.json();
        setError(data.error || t("orderTracking.notFound"));
        setOrder(null);
      }
    } catch {
      setError(t("orderTracking.networkError"));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      fetchOrder(id);
    }
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) fetchOrder(orderId.trim());
  };

  const isCancelled = order?.orderStatus === "cancelled" || order?.orderStatus === "rejected";
  const currentStepIndex = order ? STATUS_FLOW.indexOf(order.orderStatus) : -1;

  return (
    <div className="container-luxury py-8 lg:py-12 max-w-2xl mx-auto">
      <h1 className="heading-section mb-2 text-center">{t("orderTracking.title")}</h1>
      <p className="text-gray-500 text-center mb-8">
        {t("orderTracking.description")}
      </p>

      <form onSubmit={handleTrack} className="flex gap-3 mb-12">
        <Input
          placeholder={t("orderTracking.placeholder")}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          {t("orderTracking.track")}
        </Button>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-luxury-gold animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {order && !loading && !error && (
        <div className="animate-slide-up">
          {/* Order Info */}
          <div className="p-6 bg-gray-50 dark:bg-luxury-gray/50 mb-8 text-center rounded-lg">
            <p className="text-sm text-gray-500 mb-1">{t("orderTracking.orderId")}</p>
            <p className="font-display text-xl text-luxury-gold">{order.id}</p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(order.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}
            </p>
            {order.trackingNumber && (
              <p className="text-sm text-gray-500 mt-1">
                {t("orderTracking.trackingNumber")}: <span className="font-medium">{order.trackingNumber}</span>
              </p>
            )}
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                isCancelled
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              }`}>
                {t(`orderStatus.${order.orderStatus}` as any)}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* Status Timeline */}
          {!isCancelled ? (
            <div className="relative">
              <div className="absolute start-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-8">
                {STATUS_FLOW.map((status, i) => {
                  const StatusIcon = STATUS_ICONS[status] || Clock;
                  const isCompleted = i <= currentStepIndex;
                  const historyEntry = order.statusHistory?.find((h) => h.status === status);
                  return (
                    <div key={status} className="flex items-start gap-4 relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shrink-0 ${
                          isCompleted
                            ? "bg-luxury-gold text-luxury-black"
                            : "bg-gray-100 dark:bg-luxury-gray text-gray-400"
                        }`}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="pt-2">
                        <p className={`font-medium ${isCompleted ? "" : "text-gray-400"}`}>
                          {t(`orderStatus.${status}` as any)}
                        </p>
                        {historyEntry && (
                          <p className="text-sm text-gray-500">
                            {new Date(historyEntry.timestamp).toLocaleDateString(
                              language === "ar" ? "ar-EG" : "en-US"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="font-medium text-red-700 dark:text-red-400">
                {t(`orderStatus.${order.orderStatus}` as any)}
              </p>
              {order.statusHistory?.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(order.statusHistory[order.statusHistory.length - 1].timestamp).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Order Items Summary */}
          <div className="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t("orderTracking.items")} ({order.items.length})
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.brand} · Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Link */}
          <div className="mt-6 text-center">
            <Link
              href={`/account/orders/${order.id}/invoice`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              {t("account.viewInvoice")}
            </Link>
          </div>
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t("orderTracking.enterOrderId")}</p>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
