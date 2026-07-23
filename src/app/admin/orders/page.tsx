"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye, Package, Truck, CheckCircle, XCircle, Clock, Search, Filter,
  ArrowRight, Box, MapPin, Ban, FileText, Plus, Trash2, Printer, Save,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { Order, OrderStatus, Product } from "@/types";

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
  returned: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const STATUS_FLOW: Record<string, OrderStatus[]> = {
  pending: ["accepted", "rejected"],
  accepted: ["preparing"],
  preparing: ["packed"],
  packed: ["shipped"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: ["returned"],
  returned: ["refunded"],
  cancelled: [],
  rejected: [],
  refunded: [],
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock, accepted: CheckCircle, preparing: Box, packed: Package,
  shipped: Truck, out_for_delivery: MapPin, delivered: CheckCircle,
  cancelled: XCircle, rejected: Ban, returned: ArrowRight, refunded: ArrowRight,
};

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        await fetchOrders();
        // Update selected order if viewing it
        const updatedRes = await fetch(`/api/orders/${orderId}`);
        if (updatedRes.ok) {
          const data = await updatedRes.json();
          setSelectedOrder(data.order);
        }
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchOrders();
        const updatedRes = await fetch(`/api/orders/${orderId}`);
        if (updatedRes.ok) {
          const data = await updatedRes.json();
          setSelectedOrder(data.order);
        }
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setUpdating(false);
    }
  };

  const saveOrderEdits = async (orderId: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes, trackingNumber: editTracking }),
      });
      if (res.ok) {
        await fetchOrders();
        const updatedRes = await fetch(`/api/orders/${orderId}`);
        if (updatedRes.ok) {
          const data = await updatedRes.json();
          setSelectedOrder(data.order);
        }
      }
    } catch (error) {
      console.error("Failed to save edits:", error);
    } finally {
      setUpdating(false);
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setEditNotes(order.notes || "");
    setEditTracking(order.trackingNumber || "");
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{t("admin.orders.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{t("admin.orders.subtitle")}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black dark:hover:bg-gray-200 text-sm font-medium">
          <Plus className="w-4 h-4" /> {t("admin.orders.createOrder")}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder={t("admin.orders.search")} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-luxury-gold/50 focus:border-transparent text-sm" />
          </div>
          <div className="relative">
            <Filter className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="ps-9 pe-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none text-sm">
              <option value="all">{t("admin.orders.allStatus")}</option>
              {Object.keys(statusColors).map((s) => (
                <option key={s} value={s}>{t(`orderStatus.${s}` as any)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.orders.orderId")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.orders.customer")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.orders.items")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.orders.total")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.orders.status")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.orders.date")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("admin.orders.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 lg:px-6 py-16 text-center">
                  <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{t("admin.orders.noOrders")}</p>
                </td></tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.orderStatus] || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900 dark:text-white">{order.id}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus]}`}>
                          <StatusIcon className="w-3 h-3" />
                          {t(`orderStatus.${order.orderStatus}` as any)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => openOrderDetail(order)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("admin.orders.orderId")}: {selectedOrder.id}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status Flow Buttons */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.orderStatus")}</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[selectedOrder.orderStatus]}`}>
                  {t(`orderStatus.${selectedOrder.orderStatus}` as any)}
                </span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(STATUS_FLOW[selectedOrder.orderStatus] || []).map((nextStatus) => (
                    <button key={nextStatus} onClick={() => updateStatus(selectedOrder.id, nextStatus)}
                      disabled={updating}
                      className="px-4 py-2 text-xs font-medium rounded-lg bg-luxury-black text-white hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3" />
                      {t(`orderStatus.${nextStatus}` as any)}
                    </button>
                  ))}
                  {selectedOrder.orderStatus !== "cancelled" && !["delivered", "cancelled", "rejected", "refunded"].includes(selectedOrder.orderStatus) && (
                    <button onClick={() => cancelOrder(selectedOrder.id)} disabled={updating}
                      className="px-4 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                      <XCircle className="w-3 h-3" />
                      {t("orderStatus.cancelled")}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t("checkout.payment")}: {selectedOrder.paymentMethod.toUpperCase()} &bull; {selectedOrder.paymentStatus}
                </p>
                {selectedOrder.trackingNumber && (
                  <p className="text-xs text-gray-500 mt-1">Tracking: {selectedOrder.trackingNumber}</p>
                )}
              </div>

              {/* Invoice Actions */}
              <div className="flex gap-2">
                <Link href={`/account/orders/${selectedOrder.id}/invoice`}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                  <FileText className="w-3.5 h-3.5" /> {t("invoice.viewInvoice")}
                </Link>
                <button onClick={() => window.open(`/account/orders/${selectedOrder.id}/invoice`, "_blank")}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <Printer className="w-3.5 h-3.5" /> {t("admin.orders.printInvoice")}
                </button>
              </div>

              {/* Edit Notes/Tracking */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.editOrder")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">{t("admin.orders.trackingNumber")}</label>
                    <input type="text" value={editTracking} onChange={(e) => setEditTracking(e.target.value)}
                      placeholder={selectedOrder.trackingNumber || ""}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">{t("admin.orders.notes")}</label>
                    <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                      placeholder={selectedOrder.notes || ""}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                  </div>
                </div>
                <button onClick={() => saveOrderEdits(selectedOrder.id)} disabled={updating}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-luxury-black text-white hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black disabled:opacity-50">
                  <Save className="w-3.5 h-3.5" /> {t("admin.orders.saveChanges")}
                </button>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.statusHistory")}</h3>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${statusColors[h.status]?.split(" ")[0] || "bg-gray-400"}`} />
                        <span className="font-medium text-gray-900 dark:text-white">{t(`orderStatus.${h.status}` as any)}</span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-500 text-xs">{new Date(h.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.customerInfo")}</h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-1.5 text-sm">
                  <p><span className="text-gray-500">{t("common.name")}:</span> <span className="font-medium">{selectedOrder.customerName}</span></p>
                  {selectedOrder.customerEmail && <p><span className="text-gray-500">{t("common.email")}:</span> <span className="font-medium">{selectedOrder.customerEmail}</span></p>}
                  <p><span className="text-gray-500">{t("common.phone")}:</span> <span className="font-medium">{selectedOrder.customerPhone}</span></p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.shippingAddress")}</h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                  <p>{selectedOrder.shippingAddress.address}{selectedOrder.shippingAddress.buildingNumber ? `, ${t("checkout.buildingNumber")} ${selectedOrder.shippingAddress.buildingNumber}` : ""}</p>
                  <p>{selectedOrder.shippingAddress.city}{selectedOrder.shippingAddress.governorate ? `, ${selectedOrder.shippingAddress.governorate}` : ""}{selectedOrder.shippingAddress.state ? `, ${selectedOrder.shippingAddress.state}` : ""}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.orderItems")}</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.brand} &bull; {item.frameColor} &bull; Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription */}
              {selectedOrder.prescription && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.prescriptionInfo")}</h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-sm space-y-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t("checkout.rightEye")} (OD)</p>
                      <p className="text-gray-500">SPH: {selectedOrder.prescription.rightEye.sphere} | CYL: {selectedOrder.prescription.rightEye.cylinder} | Axis: {selectedOrder.prescription.rightEye.axis}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t("checkout.leftEye")} (OS)</p>
                      <p className="text-gray-500">SPH: {selectedOrder.prescription.leftEye.sphere} | CYL: {selectedOrder.prescription.leftEye.cylinder} | Axis: {selectedOrder.prescription.leftEye.axis}</p>
                    </div>
                    <p><span className="font-medium">PD:</span> {selectedOrder.prescription.pd}</p>
                    {selectedOrder.prescription.notes && <p><span className="font-medium">Notes:</span> {selectedOrder.prescription.notes}</p>}
                  </div>
                </div>
              )}

              {/* Prescription Image (uploaded by customer) */}
              {selectedOrder.prescriptionImage && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.prescriptionImage") !== "admin.orders.prescriptionImage" ? t("admin.orders.prescriptionImage") : "Prescription Image"}</h3>
                  <a href={selectedOrder.prescriptionImage} target="_blank" rel="noopener noreferrer" className="inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedOrder.prescriptionImage}
                      alt="Prescription"
                      className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-700 object-contain"
                    />
                  </a>
                </div>
              )}

              {/* Coupon */}
              {selectedOrder.couponCode && (
                <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg text-sm">
                  <span className="font-medium text-green-700 dark:text-green-400">{t("admin.orders.coupon")}: {selectedOrder.couponCode}</span>
                  <span className="text-green-600 ms-2">(-{formatPrice(selectedOrder.discount)})</span>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm">
                  <span className="text-gray-500">{t("checkout.notes")}:</span> {selectedOrder.notes}
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t("admin.orders.orderSummary")}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">{t("cart.subtotal")}</span><span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span></div>
                  {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>{t("admin.orders.discount")}</span><span>-{formatPrice(selectedOrder.discount)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">{t("cart.shipping")}</span><span className="font-medium">{formatPrice(selectedOrder.shipping)}</span></div>
                  {selectedOrder.tax > 0 && <div className="flex justify-between"><span className="text-gray-500">{t("admin.orders.tax")}</span><span className="font-medium">{formatPrice(selectedOrder.tax)}</span></div>}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>{t("cart.total")}</span>
                    <span className="text-luxury-gold">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchOrders(); }}
        />
      )}
    </div>
  );
}

// ── Create Order Modal Component ────────────────────────────────────────────
function CreateOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "",
    streetAddress: "", buildingNumber: "", city: "", governorate: "Giza", country: "Egypt",
    gpsLat: "", gpsLng: "", notes: "", paymentMethod: "cod" as "cod" | "visa",
  });
  const [items, setItems] = useState<Array<{ productName: string; brand: string; price: number; quantity: number; image: string; sku: string; productId: string; variantId: string; frameColor: string; lensColor: string }>>([]);
  const [creating, setCreating] = useState(false);
  // Searchable product catalogue for manual order creation (replaces free-text entry).
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : data.products || []);
        }
      } catch {
        /* ignore — admin can still create an order without the catalogue */
      }
    })();
  }, []);

  const filteredProducts = productSearch.trim()
    ? products
        .filter((p) => {
          const q = productSearch.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            (p.brand || "").toLowerCase().includes(q) ||
            (p.category || "").toLowerCase().includes(q) ||
            (p.nameAr || "").includes(productSearch)
          );
        })
        .slice(0, 8)
    : [];

  const addProduct = (p: Product) => {
    const price = p.salePrice ?? p.price;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === p.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productName: p.name,
          brand: p.brand,
          price,
          quantity: 1,
          image: p.images?.[0] || "/images/products/placeholder.jpg",
          sku: p.sku || "",
          productId: p.id,
          variantId: p.variants?.[0]?.id || "",
          frameColor: p.frameColor || "",
          lensColor: p.lensColor || "",
        },
      ];
    });
    setProductSearch("");
  };

  const changeQty = (idx: number, delta: number) =>
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it
      )
    );

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const handleCreate = async () => {
    if (!form.customerName || !form.customerPhone || items.length === 0) {
      alert("Customer name, phone, and at least one item are required.");
      return;
    }
    setCreating(true);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 50; // Default shipping
    const total = subtotal + shipping;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerEmail: form.customerEmail,
          shippingAddress: {
            firstName: form.customerName.split(" ")[0],
            lastName: form.customerName.split(" ").slice(1).join(" "),
            address: form.streetAddress,
            buildingNumber: form.buildingNumber,
            city: form.city,
            governorate: form.governorate,
            country: form.country,
            gpsLat: form.gpsLat || undefined,
            gpsLng: form.gpsLng || undefined,
          },
          items,
          subtotal,
          discount: 0,
          shipping,
          tax: 0,
          total,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        }),
      });
      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create order");
      }
    } catch {
      alert("Network error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("admin.orders.createOrder")}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><XCircle className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">{t("admin.orders.customerName")} *</label>
              <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">{t("common.phone")} *</label>
              <input type="tel" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">{t("common.email")}</label>
              <input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">{t("admin.orders.country")}</label>
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">{t("admin.orders.governorate")}</label>
              <input type="text" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">{t("admin.orders.city")}</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">{t("admin.orders.streetAddress")}</label>
              <input type="text" value={form.streetAddress} onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">{t("checkout.buildingNumber")}</label>
              <input type="text" value={form.buildingNumber} onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">{t("admin.orders.notes")}</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
          </div>

          {/* Add Items — searchable product picker */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">{t("admin.orders.orderItems")}</h3>
            <div className="relative mb-3">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("admin.orders.searchProduct")}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full ps-9 pe-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-start hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded bg-gray-100 dark:bg-gray-700 shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images?.[0] || "/images/products/placeholder.jpg"} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.brand} • {p.category}</p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(p.salePrice ?? p.price)}</span>
                    </button>
                  ))}
                </div>
              )}
              {productSearch.trim() && filteredProducts.length === 0 && (
                <p className="absolute z-20 mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-sm text-gray-500">
                  {t("admin.orders.noProductsFound")}
                </p>
              )}
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-2 text-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-gray-900 dark:text-white truncate">{item.productName} <span className="text-gray-500">({item.brand})</span></span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded">
                    <button type="button" onClick={() => changeQty(idx, -1)} className="px-2 py-0.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">−</button>
                    <span className="px-2 min-w-[2rem] text-center">{item.quantity}</span>
                    <button type="button" onClick={() => changeQty(idx, 1)} className="px-2 py-0.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">+</button>
                  </div>
                  <span className="font-medium whitespace-nowrap w-20 text-end">{formatPrice(item.price * item.quantity)}</span>
                  <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {items.length > 0 && (
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>{t("admin.orders.subtotal")}</span>
                <span>{formatPrice(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
              </div>
            )}
          </div>

          <button onClick={handleCreate} disabled={creating || items.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black dark:hover:bg-gray-200 font-medium disabled:opacity-50">
            {creating ? t("admin.orders.creating") : t("admin.orders.createOrder")}
          </button>
        </div>
      </div>
    </div>
  );
}
