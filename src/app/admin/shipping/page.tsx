"use client";

import { useState, useEffect } from "react";
import { Save, Truck, Loader2, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { egyptianGovernorates } from "@/data/egypt";

interface ShippingRow {
  governorate: string;
  governorateAr: string;
  price: number;
  estimatedDays: string;
}

export default function AdminShippingPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<ShippingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchShipping();
  }, []);

  const fetchShipping = async () => {
    try {
      const res = await fetch("/api/admin/shipping");
      if (res.ok) {
        const data = await res.json();
        if (data.shipping && data.shipping.length > 0) {
          setRows(
            data.shipping.map((s: any) => ({
              governorate: s.governorate,
              governorateAr:
                egyptianGovernorates.find((g) => g.name === s.governorate)
                  ?.nameAr || s.governorateAr || s.governorate,
              price: s.price,
              estimatedDays: s.estimatedDays,
            }))
          );
          return;
        }
      }
      // Fallback to defaults
      setRows(
        egyptianGovernorates.map((g) => ({
          governorate: g.name,
          governorateAr: g.nameAr,
          price: g.shippingPrice,
          estimatedDays: g.estimatedDays,
        }))
      );
    } catch (error) {
      console.error("Fetch shipping error:", error);
      setRows(
        egyptianGovernorates.map((g) => ({
          governorate: g.name,
          governorateAr: g.nameAr,
          price: g.shippingPrice,
          estimatedDays: g.estimatedDays,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (
    index: number,
    field: "price" | "estimatedDays" | "governorate" | "governorateAr",
    value: string
  ) => {
    const updated = [...rows];
    if (field === "price") {
      updated[index] = { ...updated[index], price: Number(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setRows(updated);
    setSaved(false);
  };

  const addRow = () => {
    // Add the first governorate not yet present, else a blank custom row
    const existing = new Set(rows.map((r) => r.governorate));
    const next = egyptianGovernorates.find((g) => !existing.has(g.name));
    if (next) {
      setRows([
        ...rows,
        {
          governorate: next.name,
          governorateAr: next.nameAr,
          price: next.shippingPrice,
          estimatedDays: next.estimatedDays,
        },
      ]);
    } else {
      setRows([
        ...rows,
        { governorate: "", governorateAr: "", price: 0, estimatedDays: "2-3" },
      ]);
    }
    setSaved(false);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const shipping = rows
        .filter((r) => r.governorate.trim() !== "")
        .map((r) => ({
          governorate: r.governorate,
          governorateAr: r.governorateAr,
          price: r.price,
          estimatedDays: r.estimatedDays,
        }));
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Save shipping error:", error);
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {t("admin.shipping.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            {t("admin.shipping.subtitle")}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black dark:hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <span className="text-green-400">✓</span>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? t("admin.shipping.saved") : t("admin.shipping.save")}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t("admin.shipping.governorate")}
                </th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t("admin.shipping.price")} (EGP)
                </th>
                <th className="px-4 lg:px-6 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t("admin.shipping.estimatedDays")}
                </th>
                <th className="px-4 lg:px-6 py-3 text-end text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t("admin.shipping.actions") !== "admin.shipping.actions" ? t("admin.shipping.actions") : ""}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((row, index) => (
                <tr
                  key={row.governorate}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 lg:px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                      {row.governorate ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {row.governorate}
                          </div>
                          <div className="text-xs text-gray-500" dir="rtl">
                            {row.governorateAr}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={row.governorate}
                            onChange={(e) => updateRow(index, "governorate", e.target.value)}
                            className="w-40 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                            placeholder="Governorate"
                          />
                          <input
                            type="text"
                            value={row.governorateAr}
                            onChange={(e) => updateRow(index, "governorateAr", e.target.value)}
                            className="w-40 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                            placeholder="المحافظة"
                            dir="rtl"
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3">
                    <input
                      type="number"
                      min="0"
                      value={row.price}
                      onChange={(e) => updateRow(index, "price", e.target.value)}
                      className="w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                    />
                  </td>
                  <td className="px-4 lg:px-6 py-3">
                    <input
                      type="text"
                      value={row.estimatedDays}
                      onChange={(e) =>
                        updateRow(index, "estimatedDays", e.target.value)
                      }
                      className="w-24 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      placeholder="2-3"
                    />
                  </td>
                  <td className="px-4 lg:px-6 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:border-luxury-gold hover:text-luxury-gold transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("admin.settings.addGovernorate") !== "admin.settings.addGovernorate"
              ? t("admin.settings.addGovernorate")
              : "Add Governorate"}
          </button>
        </div>
      </div>
    </div>
  );
}
