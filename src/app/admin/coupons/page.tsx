"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, XCircle, CheckCircle, Ticket, Save, Eye, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
  createdAt: string;
}

interface CouponUsageData {
  id: string;
  couponCode: string;
  userId: string;
  userEmail: string;
  userName: string;
  orderId: string;
  orderNumber: string;
  discountAmount: number;
  discountType: "percentage" | "fixed";
  orderTotal: number;
  usedAt: string;
}

export default function AdminCouponsPage() {
  const { t } = useLanguage();
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponData | null>(null);
  const [couponUsages, setCouponUsages] = useState<CouponUsageData[]>([]);
  const [loadingUsages, setLoadingUsages] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "", description: "", discount: "", type: "percentage",
    minPurchase: "", maxUses: "100", isActive: true, expiresAt: "",
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) { console.error("Fetch coupons error:", error); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ code: "", description: "", discount: "", type: "percentage", minPurchase: "", maxUses: "100", isActive: true, expiresAt: "" });
    setEditingId(null);
  };

  const openEdit = (coupon: CouponData) => {
    setForm({
      code: coupon.code, description: coupon.description, discount: coupon.discount.toString(),
      type: coupon.type, minPurchase: coupon.minPurchase.toString(), maxUses: coupon.maxUses.toString(),
      isActive: coupon.isActive, expiresAt: coupon.expiresAt?.split("T")[0] || "",
    });
    setEditingId(coupon.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      code: form.code, description: form.description, discount: Number(form.discount),
      type: form.type, minPurchase: Number(form.minPurchase) || 0,
      maxUses: Number(form.maxUses) || 100, isActive: form.isActive,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };

    try {
      if (editingId) {
        await fetch(`/api/admin/coupons/${editingId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/coupons", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) { console.error("Save coupon error:", error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch (error) { console.error("Delete coupon error:", error); }
  };

  const toggleActive = async (coupon: CouponData) => {
    try {
      await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      fetchCoupons();
    } catch (error) { console.error("Toggle error:", error); }
  };

  const viewUsage = async (coupon: CouponData) => {
    setSelectedCoupon(coupon);
    setShowUsageModal(true);
    setLoadingUsages(true);
    try {
      const res = await fetch(`/api/coupon-usage?couponCode=${encodeURIComponent(coupon.code)}`);
      if (res.ok) {
        const data = await res.json();
        setCouponUsages(data.usages || []);
      }
    } catch (error) {
      console.error("Fetch coupon usage error:", error);
    } finally {
      setLoadingUsages(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{t("admin.coupons.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{t("admin.coupons.subtitle")}</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black dark:hover:bg-gray-200 text-sm font-medium">
          <Plus className="w-4 h-4" />{t("admin.coupons.create")}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.coupons.code")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.coupons.discount")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.coupons.uses")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.coupons.status")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.coupons.expires")}</th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("admin.orders.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-4 lg:px-6 py-16 text-center">
                  <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{t("admin.coupons.noCoupons")}</p>
                </td></tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</div>
                      <div className="text-xs text-gray-500">{coupon.description}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {coupon.type === "percentage" ? `${coupon.discount}%` : `${coupon.discount} EGP`}
                      </span>
                      {coupon.minPurchase > 0 && <div className="text-xs text-gray-400">Min: {coupon.minPurchase}</div>}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {coupon.usedCount} / {coupon.maxUses}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <button onClick={() => toggleActive(coupon)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          coupon.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                        {coupon.isActive ? <><CheckCircle className="w-3 h-3" />Active</> : <><XCircle className="w-3 h-3" />Inactive</>}
                      </button>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => viewUsage(coupon)} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors" title="View Usage"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? t("admin.coupons.edit") : t("admin.coupons.create")}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("admin.coupons.code")}</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono" placeholder="SAVE20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("admin.coupons.discountType")}</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("admin.coupons.discountValue")}</label>
                  <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("admin.coupons.minPurchase")}</label>
                  <input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("admin.coupons.maxUses")}</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">{t("admin.coupons.description")}</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("admin.coupons.expires")}</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">{t("common.cancel")}</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black text-sm font-medium">
                <Save className="w-4 h-4" />{t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Usage Modal */}
      {showUsageModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowUsageModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-luxury-gold" />
                  Coupon Usage: {selectedCoupon.code}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedCoupon.description} — {selectedCoupon.type === "percentage" ? `${selectedCoupon.discount}%` : `${selectedCoupon.discount} EGP`}
                </p>
              </div>
              <button onClick={() => setShowUsageModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {loadingUsages ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
                </div>
              ) : couponUsages.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No usage history found for this coupon</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Discount</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Order Total</th>
                        <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {couponUsages.map((usage) => (
                        <tr key={usage.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{usage.userName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{usage.userEmail}</td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{usage.orderNumber}</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">
                            {usage.discountType === "percentage" ? `${usage.discountAmount}%` : `${usage.discountAmount} EGP`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{usage.orderTotal} EGP</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(usage.usedAt).toLocaleDateString()} {new Date(usage.usedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button onClick={() => setShowUsageModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
