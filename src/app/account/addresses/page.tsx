"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Plus, Edit2, Trash2, XCircle, Star } from "lucide-react";

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  governorate: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AccountAddressesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "Home",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    governorate: "",
    country: "Egypt",
    phone: user?.phone || "",
    isDefault: false,
  });

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses as unknown as Address[]);
    }
  }, [user]);

  const resetForm = () => {
    setForm({
      label: "Home",
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ").slice(1).join(" ") || "",
      address: "",
      city: "",
      governorate: "",
      country: "Egypt",
      phone: user?.phone || "",
      isDefault: addresses.length === 0,
    });
    setEditingId(null);
  };

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label,
      firstName: addr.firstName,
      lastName: addr.lastName,
      address: addr.address,
      city: addr.city,
      governorate: (addr as any).governorate || "",
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const newAddr = { ...form, id: editingId || `addr-${Date.now()}` };
      let updated: Address[];
      if (editingId) {
        updated = addresses.map((a) => (a.id === editingId ? newAddr as Address : a));
      } else {
        if (form.isDefault) {
          updated = [...addresses.map((a) => ({ ...a, isDefault: false })), newAddr as Address];
        } else {
          updated = [...addresses, newAddr as Address];
        }
      }
      setAddresses(updated);
      setShowForm(false);
      resetForm();
      // Save to API
      await fetch(`/api/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updated }),
      });
    } catch (error) {
      console.error("Save address error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    await fetch(`/api/users/${user?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: updated }),
    });
  };

  const setDefault = async (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    await fetch(`/api/users/${user?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: updated }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-section">{t("account.addresses")}</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> {t("account.addAddress")}
        </button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t("account.noAddresses")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-4 bg-white dark:bg-luxury-gray rounded-lg border border-gray-200 dark:border-gray-700 relative">
              {addr.isDefault && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-luxury-gold/20 text-luxury-gold text-xs font-medium rounded-full mb-2">
                  <Star className="w-3 h-3" /> {t("account.defaultAddress")}
                </span>
              )}
              <p className="text-xs text-gray-400 font-medium uppercase mb-1">{addr.label}</p>
              <p className="font-medium text-gray-900 dark:text-white">{addr.firstName} {addr.lastName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{addr.address}</p>
              <p className="text-sm text-gray-500">{addr.city}{(addr as any).governorate ? `, ${(addr as any).governorate}` : ""}, {addr.country}</p>
              <p className="text-sm text-gray-500">{addr.phone}</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => openEdit(addr)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)} className="text-xs text-gray-500 hover:text-luxury-gold ml-auto">
                    {t("account.setAsDefault")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? t("account.editAddress") : t("account.addAddress")}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Label</label>
                  <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm">
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("checkout.phone")}</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("checkout.firstName")}</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("checkout.lastName")}</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">{t("checkout.address")}</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("checkout.city")}</label>
                  <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("checkout.governorate")}</label>
                  <input type="text" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t("checkout.country")}</label>
                  <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t("account.setAsDefault")}</span>
              </label>
              <button onClick={handleSave}
                className="w-full py-2.5 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black font-medium text-sm">
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
