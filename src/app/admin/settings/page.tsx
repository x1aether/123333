"use client";

import { useState, useEffect } from "react";
import { Save, Store, Globe, Phone, Settings as SettingsIcon, Truck, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/context/LanguageContext";
import { egyptianGovernorates } from "@/data/egypt";
import type { GovernorateShipping } from "@/types";

// Default per-governorate shipping derived from the Egyptian governorates list.
const defaultGovernorateShipping: GovernorateShipping[] = egyptianGovernorates.map((g) => ({
  governorate: g.name,
  governorateAr: g.nameAr,
  price: g.shippingPrice,
  estimatedDays: g.estimatedDays,
}));

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [governorateShipping, setGovernorateShipping] = useState<GovernorateShipping[]>(defaultGovernorateShipping);
  const [settings, setSettings] = useState({
    storeName: "Eye Care",
    storeEmail: "info@eyecare.com",
    storePhone: "+20 100 000 0000",
    storeAddress: "Cairo, Egypt",
    currency: "EGP",
    currencySymbol: "EGP",
    taxRate: "0",
    freeShippingThreshold: "2000",
    standardShipping: "50",
    expressShipping: "100",
    whatsappNumber: "01012050785",
    socialMedia: {
      instagram: "https://instagram.com/eyecare",
      facebook: "https://facebook.com/eyecare",
      twitter: "https://twitter.com/eyecare",
      youtube: "https://youtube.com/eyecare",
    },
    metaTitle: "Eye Care — Premium Luxury Eyewear",
    metaDescription: "Premium online store for sunglasses, prescription glasses, and luxury fashion eyewear.",
    heroTitle: "See the World Differently",
    heroSubtitle: "Discover curated luxury eyewear from the world's most iconic brands.",
    maintenanceMode: false,
    allowRegistration: true,
  });

  // Load existing settings on mount so the admin edits real persisted values.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const data = await res.json();
        const s = data.settings;
        if (!active || !s) return;
        setSettings((prev) => ({
          ...prev,
          ...s,
          taxRate: s.taxRate?.toString() ?? prev.taxRate,
          freeShippingThreshold: s.freeShippingThreshold?.toString() ?? prev.freeShippingThreshold,
          standardShipping: s.standardShipping?.toString() ?? prev.standardShipping,
          expressShipping: s.expressShipping?.toString() ?? prev.expressShipping,
          socialMedia: { ...prev.socialMedia, ...(s.socialMedia || {}) },
        }));
        if (Array.isArray(s.governorateShipping) && s.governorateShipping.length > 0) {
          setGovernorateShipping(s.governorateShipping);
        }
      } catch {
        // keep defaults on failure
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function updateGovShipping(index: number, patch: Partial<GovernorateShipping>) {
    setGovernorateShipping((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...patch } : g))
    );
  }

  function addGovShipping() {
    setGovernorateShipping((prev) => [
      ...prev,
      { governorate: "", governorateAr: "", price: 0, estimatedDays: "2-3" },
    ]);
  }

  function removeGovShipping(index: number) {
    setGovernorateShipping((prev) => prev.filter((_, i) => i !== index));
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedMessage("");

    try {
      const payload = {
        ...settings,
        taxRate: Number(settings.taxRate) || 0,
        freeShippingThreshold: Number(settings.freeShippingThreshold) || 0,
        standardShipping: Number(settings.standardShipping) || 0,
        expressShipping: Number(settings.expressShipping) || 0,
        governorateShipping: governorateShipping
          .filter((g) => g.governorate.trim() !== "")
          .map((g) => ({ ...g, price: Number(g.price) || 0 })),
      };

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSavedMessage(t("common.success") + "!");
      } else {
        setSavedMessage(t("common.error"));
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSavedMessage(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {t("admin.settings.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          {t("admin.settings.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-luxury-gold" />
            {t("admin.settings.storeInfo")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Store Name"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              required
            />
            <Input
              label="Store Email"
              type="email"
              value={settings.storeEmail}
              onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
              required
            />
            <Input
              label="Store Phone"
              type="tel"
              value={settings.storePhone}
              onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
              required
            />
            <Input
              label="Store Address"
              value={settings.storeAddress}
              onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
              required
              className="md:col-span-2"
            />
          </div>
        </div>

        {/* Currency & Shipping */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-luxury-gold" />
            {t("admin.settings.currencyShipping")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Currency"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              required
            />
            <Input
              label="Currency Symbol"
              value={settings.currencySymbol}
              onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              required
            />
            <Input
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              value={settings.taxRate}
              onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
              required
            />
            <Input
              label="Free Shipping Threshold"
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
              required
            />
            <Input
              label="Standard Shipping Cost"
              type="number"
              value={settings.standardShipping}
              onChange={(e) => setSettings({ ...settings, standardShipping: e.target.value })}
              required
            />
            <Input
              label="Express Shipping Cost"
              type="number"
              value={settings.expressShipping}
              onChange={(e) => setSettings({ ...settings, expressShipping: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Shipping by Governorate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-luxury-gold" />
              {t("admin.settings.governorateShipping")}
            </h2>
            <button
              type="button"
              onClick={addGovShipping}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-luxury-gold/10 text-luxury-gold rounded-lg hover:bg-luxury-gold/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> {t("admin.settings.addGovernorate")}
            </button>
          </div>
          <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
            <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-medium text-gray-400 uppercase px-1">
              <span className="col-span-4">{t("admin.settings.governorate")}</span>
              <span className="col-span-3">{t("admin.settings.governorateAr")}</span>
              <span className="col-span-2">{t("admin.settings.price")}</span>
              <span className="col-span-2">{t("admin.settings.days")}</span>
              <span className="col-span-1"></span>
            </div>
            {governorateShipping.map((g, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center">
                <input
                  type="text"
                  value={g.governorate}
                  onChange={(e) => updateGovShipping(index, { governorate: e.target.value })}
                  placeholder="Cairo"
                  className="col-span-6 md:col-span-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  dir="rtl"
                  value={g.governorateAr || ""}
                  onChange={(e) => updateGovShipping(index, { governorateAr: e.target.value })}
                  placeholder="القاهرة"
                  className="col-span-6 md:col-span-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  min="0"
                  value={g.price}
                  onChange={(e) => updateGovShipping(index, { price: Number(e.target.value) })}
                  placeholder="50"
                  className="col-span-5 md:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={g.estimatedDays}
                  onChange={(e) => updateGovShipping(index, { estimatedDays: e.target.value })}
                  placeholder="2-3"
                  className="col-span-5 md:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeGovShipping(index)}
                  className="col-span-2 md:col-span-1 flex items-center justify-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Social */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-luxury-gold" />
            {t("admin.settings.contactSocial")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="WhatsApp Number"
              type="tel"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              required
            />
            <Input
              label="Instagram URL"
              type="url"
              value={settings.socialMedia.instagram}
              onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, instagram: e.target.value } })}
            />
            <Input
              label="Facebook URL"
              type="url"
              value={settings.socialMedia.facebook}
              onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, facebook: e.target.value } })}
            />
            <Input
              label="Twitter URL"
              type="url"
              value={settings.socialMedia.twitter}
              onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, twitter: e.target.value } })}
            />
            <Input
              label="YouTube URL"
              type="url"
              value={settings.socialMedia.youtube}
              onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, youtube: e.target.value } })}
              className="md:col-span-2"
            />
          </div>
        </div>

        {/* SEO & Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-luxury-gold" />
            {t("admin.settings.seoHero")}
          </h2>
          <div className="space-y-4">
            <Input
              label="Meta Title"
              value={settings.metaTitle}
              onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
              required
            />
            <Input
              label="Meta Description"
              value={settings.metaDescription}
              onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
              required
            />
            <Input
              label="Hero Title"
              value={settings.heroTitle}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              required
            />
            <Input
              label="Hero Subtitle"
              value={settings.heroSubtitle}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              required
            />
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {t("admin.settings.system")}
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t("admin.settings.maintenance")}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t("admin.settings.allowRegistration")}</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end items-center gap-4">
          {savedMessage && (
            <span className="text-sm text-green-600 dark:text-green-400">{savedMessage}</span>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-luxury-black to-gray-800 dark:from-luxury-white dark:to-gray-200 hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            {loading ? t("admin.settings.saving") : t("admin.settings.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
