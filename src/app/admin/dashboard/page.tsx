"use client";

import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  AlertTriangle,
  Truck,
  Box,
  MapPin,
  Ban,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";

interface DashboardStats {
  todaySales: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  acceptedOrders: number;
  preparingOrders: number;
  packedOrders: number;
  shippedOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  rejectedOrders: number;
  lowStockProducts: Array<{ id: string; name: string; stockQuantity: number; sku: string }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    orderStatus: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    acceptedOrders: 0,
    preparingOrders: 0,
    packedOrders: 0,
    shippedOrders: 0,
    outForDeliveryOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    rejectedOrders: 0,
    lowStockProducts: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    preparing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    packed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    shipped: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    out_for_delivery: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    rejected: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {t("admin.dashboard")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("admin.welcomeDesc")}
        </p>
      </div>

      {/* Revenue & Core Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.todaySales")}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatPrice(stats.todaySales)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 lg:p-3 rounded-lg"><DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.totalRevenue")}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 lg:p-3 rounded-lg"><TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.totalProducts")}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-2 lg:p-3 rounded-lg"><Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.totalCustomers")}</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 lg:p-3 rounded-lg"><Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" /></div>
          </div>
        </div>
      </div>

      {/* Order Status Grid */}
      <div>
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("admin.orders.title")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {[
            { label: t("orderStatus.pending"), count: stats.pendingOrders, icon: Clock, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" },
            { label: t("orderStatus.accepted"), count: stats.acceptedOrders, icon: CheckCircle, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
            { label: t("orderStatus.preparing"), count: stats.preparingOrders, icon: Box, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
            { label: t("orderStatus.packed"), count: stats.packedOrders, icon: Package, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" },
            { label: t("orderStatus.shipped"), count: stats.shippedOrders, icon: Truck, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" },
            { label: t("orderStatus.outForDelivery"), count: stats.outForDeliveryOrders, icon: MapPin, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
            { label: t("orderStatus.delivered"), count: stats.deliveredOrders, icon: CheckCircle, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
            { label: t("orderStatus.cancelled"), count: stats.cancelledOrders, icon: XCircle, color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
            { label: t("orderStatus.rejected"), count: stats.rejectedOrders, icon: Ban, color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20" },
            { label: t("admin.pendingOrders"), count: stats.pendingOrders + stats.acceptedOrders, icon: ShoppingCart, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-3 lg:p-4 border border-transparent`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs font-medium opacity-80 truncate">{stat.label}</span>
              </div>
              <p className="text-2xl lg:text-3xl font-bold">{stat.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-red-200 dark:border-red-900/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.lowStockAlert")}
            </h2>
          </div>
          <div className="space-y-2">
            {stats.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                </div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {p.stockQuantity} {t("product.inStock").toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
            {t("admin.recentOrders")}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">ID</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.orders.customer")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.orders.total")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.orders.status")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.orders.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 lg:px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    {t("admin.orders.noOrders")}
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-mono font-medium text-gray-900 dark:text-white">{order.id}</td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.customerName}</td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-800"}`}>
                        {t(`orderStatus.${order.orderStatus}` as any)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("admin.quickActions")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/products/new" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Package className="w-5 h-5 text-luxury-gold shrink-0" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t("admin.addNewProduct")}</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <ShoppingCart className="w-5 h-5 text-luxury-gold shrink-0" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t("admin.orders.title")}</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Settings className="w-5 h-5 text-luxury-gold shrink-0" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t("admin.storeSettings")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
