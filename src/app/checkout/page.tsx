"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/ui/ProductImage";
import Link from "next/link";
import { Lock, CreditCard, Truck, CheckCircle, MapPin, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { formatPrice, getEffectivePrice, getLocalized } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { countries } from "@/data/countries";
import { egyptianGovernorates } from "@/data/egypt";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading, user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { getProductById } = useProducts();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (isLoading) return;
    // Middleware already protects /checkout at the edge — if the user somehow
    // ended up here without a valid session, the server will 401 the order
    // request and we surface a friendly error instead of redirecting.
    // Admins should use the admin dashboard, not the storefront checkout.
    if (isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [isAdmin, isLoading, router]);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    countryCode: "EG",
    governorate: "Giza",
    city: "",
    streetAddress: "",
    buildingNumber: "",
    gpsLat: "",
    gpsLng: "",
    notes: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: "percentage" | "fixed"; minPurchase: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [paymentMethod] = useState<"cod" | "visa">("cod");
  const [prescriptionType, setPrescriptionType] = useState<"manual" | "upload">("manual");
  const [prescriptionImage, setPrescriptionImage] = useState<File | null>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    rightEye: { sphere: "", cylinder: "", axis: "", add: "" },
    leftEye: { sphere: "", cylinder: "", axis: "", add: "" },
    pd: "",
    notes: "",
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "success" | "error">("idle");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [govShippingOverrides, setGovShippingOverrides] = useState<
    { governorate: string; price: number }[]
  >([]);

  // Load admin-configured per-governorate shipping (overrides static defaults).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.settings?.governorateShipping)) {
          setGovShippingOverrides(data.settings.governorateShipping);
        }
      } catch {
        // fall back to static prices
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Check if cart has prescription glasses
  const hasPrescription = items.some((item) => {
    const product = getProductById(item.productId);
    return product?.category === "Prescription Glasses";
  });

  // Get available countries
  const selectedCountry = countries.find((c) => c.code === form.countryCode);
  const governorates = selectedCountry?.governorates || [];
  const selectedGov = governorates.find((g) => g.name === form.governorate || g.nameAr === form.governorate);
  const cities = selectedGov?.cities || [];

  // Shipping price from governorate — admin override takes precedence over static default.
  const govOverride = govShippingOverrides.find((g) => g.governorate === form.governorate);
  const govShipping = egyptianGovernorates.find((g) => g.name === form.governorate);
  const shippingPrice =
    govOverride && typeof govOverride.price === "number"
      ? govOverride.price
      : govShipping?.shippingPrice || 0;

  const discount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? subtotal * (appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0;

  const total = subtotal - discount + shippingPrice;

  const phoneRegex = /^(\+20|0)?1[0-9]{9}$/;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.fullName.trim()) errors.fullName = t("common.required");
    if (!form.phone.trim()) errors.phone = t("common.required");
    else if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) errors.phone = t("checkout.phoneValidation");
    // Email is required for guests (used for tracking/contact); optional login
    // users already have an email on file.
    if (!isAuthenticated) {
      if (!form.email.trim()) errors.email = t("common.required");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = t("checkout.emailValidation");
    }
    if (!form.countryCode) errors.countryCode = t("common.required");
    if (!form.governorate) errors.governorate = t("common.required");
    if (!form.city) errors.city = t("common.required");
    if (!form.streetAddress.trim()) errors.streetAddress = t("common.required");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    try {
      // Public validation endpoint (works for customers AND guests).
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.valid) {
        if (data.error === "MIN_PURCHASE") {
          setCouponError(t("checkout.couponMinPurchase").replace("{amount}", formatPrice(data.minPurchase || 0)));
        } else {
          setCouponError(data.error || t("checkout.invalidCoupon"));
        }
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(data.coupon);
    } catch {
      setCouponError(t("checkout.couponError"));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          gpsLat: latitude.toString(),
          gpsLng: longitude.toString(),
        }));
        // Reverse geocode using Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const governorate = addr.state || addr.county || "";
            const city = addr.city || addr.town || addr.village || "";
            const street = addr.road || addr.street || "";
            setForm((prev) => ({
              ...prev,
              countryCode: "EG",
              governorate: governorate || prev.governorate,
              city: city || prev.city,
              streetAddress: street || prev.streetAddress,
            }));
          }
        } catch {
          // Geocoding failed, keep lat/lng only
        }
        setLocationStatus("success");
        setGettingLocation(false);
      },
      () => {
        setLocationStatus("error");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setOrderError("");
    setPlacingOrder(true);

    try {
      // Upload prescription image first (permanent storage), then link its URL to the order.
      let prescriptionImageUrl: string | null = null;
      if (hasPrescription && prescriptionType === "upload" && prescriptionImage) {
        const fd = new FormData();
        fd.append("file", prescriptionImage);
        fd.append("folder", "prescriptions");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          setOrderError(uploadData.error || t("checkout.prescriptionUploadError"));
          setPlacingOrder(false);
          return;
        }
        prescriptionImageUrl = uploadData.url;
      }

      const orderData = {
        customerName: form.fullName,
        customerEmail: user?.email || form.email,
        customerPhone: form.phone,
        shippingAddress: {
          firstName: form.fullName.split(" ")[0],
          lastName: form.fullName.split(" ").slice(1).join(" "),
          address: form.streetAddress,
          buildingNumber: form.buildingNumber,
          city: form.city,
          governorate: form.governorate,
          country: selectedCountry?.name || "Egypt",
          gpsLat: form.gpsLat,
          gpsLng: form.gpsLng,
        },
        items: items.map((item) => {
          const product = getProductById(item.productId);
          const price = product ? getEffectivePrice(product) : 0;
          return {
            productId: item.productId,
            variantId: item.variantId,
            productName: product?.name || "",
            brand: product?.brand || "",
            image: product?.images[0] || "",
            frameColor: product?.frameColor || "",
            lensColor: product?.lensColor || "",
            sku: product?.sku || "",
            price,
            quantity: item.quantity,
          };
        }),
        subtotal,
        discount,
        couponCode: appliedCoupon?.code || null,
        appliedCoupon: appliedCoupon,
        shipping: shippingPrice,
        tax: 0,
        total,
        paymentMethod,
        prescription: hasPrescription && prescriptionType === "manual" ? prescriptionData : null,
        prescriptionImage: prescriptionImageUrl,
        orderStatus: "pending",
        paymentStatus: "pending",
        trackingNumber: "",
        notes: form.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        // Server generates the authoritative order id.
        setOrderId(data.order?.id || "");
        setOrderPlaced(true);
        clearCart();
      } else if (response.status === 401) {
        router.replace("/login?redirect=/checkout");
      } else {
        setOrderError(data.error || t("checkout.orderError"));
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderError(t("checkout.orderError"));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container-luxury py-20 text-center max-w-lg mx-auto">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="heading-section mb-4">{t("checkout.orderSuccess")}</h1>
        <p className="text-gray-500 mb-2">{t("checkout.orderSuccessDesc")}</p>
        <p className="font-medium mb-8">
          Order ID: <span className="text-luxury-gold">{orderId}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/order-tracking?id=${orderId}`} className="btn-primary">
            {t("nav.trackOrder")}
          </Link>
          <Link href="/shop" className="btn-secondary">
            {t("cart.continue")}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-luxury py-20 text-center">
        <h1 className="heading-section mb-4">{t("checkout.noItems")}</h1>
        <Link href="/shop" className="btn-primary">{t("nav.shop")}</Link>
      </div>
    );
  }

  return (
    <div className="container-luxury py-8 lg:py-12">
      <div className="flex items-center gap-2 mb-8">
        <Lock className="w-5 h-5 text-luxury-gold" />
        <h1 className="heading-section">{t("checkout.title")}</h1>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Guest checkout notice */}
            {!isAuthenticated && (
              <div className="p-4 bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                {t("checkout.guestNotice")}{" "}
                <Link href="/login?redirect=/checkout" className="font-medium text-luxury-gold hover:underline">
                  {t("checkout.guestLogin")}
                </Link>{" "}
                {t("checkout.guestLoginSuffix")}
              </div>
            )}
            {/* Contact */}
            <section>
              <h2 className="font-display text-xl mb-4">{t("checkout.contact")}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.fullName")} *
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.phone")} *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
                {!isAuthenticated && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      {t("checkout.email")} *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                  </div>
                )}
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="font-display text-xl mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" /> {t("checkout.shipping")}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.country")} *
                  </label>
                  <select
                    value={form.countryCode}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value, governorate: "", city: "" })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.governorate")} *
                  </label>
                  <select
                    value={form.governorate}
                    onChange={(e) => setForm({ ...form, governorate: e.target.value, city: "" })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">{t("checkout.selectGovernorate")}</option>
                    {governorates.map((g) => (
                      <option key={g.name} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                  {formErrors.governorate && <p className="text-xs text-red-500 mt-1">{formErrors.governorate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.city")} *
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">{t("checkout.selectCity")}</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.address")} *
                  </label>
                  <input
                    type="text"
                    value={form.streetAddress}
                    onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  {formErrors.streetAddress && <p className="text-xs text-red-500 mt-1">{formErrors.streetAddress}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.buildingNumber")}
                  </label>
                  <input
                    type="text"
                    value={form.buildingNumber}
                    onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* GPS Location */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.gpsLocation")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={form.gpsLat && form.gpsLng ? `${form.gpsLat}, ${form.gpsLng}` : ""}
                      placeholder={t("checkout.gpsLocation")}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="flex items-center gap-2 px-4 py-2.5 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black dark:hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
                    >
                      {gettingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      {t("checkout.useCurrentLocation")}
                    </button>
                  </div>
                  {locationStatus === "success" && (
                    <p className="text-xs text-green-600 mt-1">{t("checkout.locationSuccess")}</p>
                  )}
                  {locationStatus === "error" && (
                    <p className="text-xs text-red-500 mt-1">{t("checkout.locationError")}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t("checkout.notes")} ({t("common.optional")})
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="font-display text-xl mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> {t("checkout.payment")}
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input type="radio" name="payment" value="cod" checked className="w-4 h-4" readOnly />
                  <div>
                    <p className="font-medium">{t("checkout.cod")}</p>
                    <p className="text-sm text-gray-500">{t("checkout.codDesc")}</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors opacity-50">
                  <input type="radio" name="payment" value="visa" disabled className="w-4 h-4" />
                  <div>
                    <p className="font-medium">{t("checkout.visa")}</p>
                    <p className="text-sm text-gray-500">{t("checkout.comingSoon")}</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Prescription - only if cart has prescription glasses */}
            {hasPrescription && (
              <section>
                <h2 className="font-display text-xl mb-4">{t("checkout.prescription")}</h2>
                <p className="text-sm text-amber-600 mb-4">{t("checkout.prescriptionRequired")}</p>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="prescriptionType" value="manual" checked={prescriptionType === "manual"} onChange={(e) => setPrescriptionType(e.target.value as "manual" | "upload")} className="w-4 h-4" />
                      <span>{t("prescription.manualEntry")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="prescriptionType" value="upload" checked={prescriptionType === "upload"} onChange={(e) => setPrescriptionType(e.target.value as "manual" | "upload")} className="w-4 h-4" />
                      <span>{t("prescription.uploadImage")}</span>
                    </label>
                  </div>

                  {prescriptionType === "manual" && (
                    <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium">{t("prescription.rightEye")}</h3>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.sphere")}</label>
                          <input type="text" value={prescriptionData.rightEye.sphere} onChange={(e) => setPrescriptionData({ ...prescriptionData, rightEye: { ...prescriptionData.rightEye, sphere: e.target.value } })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.cylinder")}</label>
                          <input type="text" value={prescriptionData.rightEye.cylinder} onChange={(e) => setPrescriptionData({ ...prescriptionData, rightEye: { ...prescriptionData.rightEye, cylinder: e.target.value } })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.axis")}</label>
                          <input type="text" value={prescriptionData.rightEye.axis} onChange={(e) => setPrescriptionData({ ...prescriptionData, rightEye: { ...prescriptionData.rightEye, axis: e.target.value } })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.addPower")}</label>
                          <input type="text" value={prescriptionData.rightEye.add} onChange={(e) => setPrescriptionData({ ...prescriptionData, rightEye: { ...prescriptionData.rightEye, add: e.target.value } })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                      </div>

                      <h3 className="font-medium">{t("prescription.leftEye")}</h3>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.sphere")}</label>
                          <input type="text" value={prescriptionData.leftEye.sphere} onChange={(e) => setPrescriptionData({ ...prescriptionData, leftEye: { ...prescriptionData.leftEye, sphere: e.target.value } })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.cylinder")}</label>
                          <input type="text" value={prescriptionData.leftEye.cylinder} onChange={(e) => setPrescriptionData({ ...prescriptionData, leftEye: { ...prescriptionData.leftEye, cylinder: e.target.value } })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.axis")}</label>
                          <input type="text" value={prescriptionData.leftEye.axis} onChange={(e) => setPrescriptionData({ ...prescriptionData, leftEye: { ...prescriptionData.leftEye, axis: e.target.value } })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.addPower")}</label>
                          <input type="text" value={prescriptionData.leftEye.add} onChange={(e) => setPrescriptionData({ ...prescriptionData, leftEye: { ...prescriptionData.leftEye, add: e.target.value } })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">{t("prescription.pd")}</label>
                          <input type="text" value={prescriptionData.pd} onChange={(e) => setPrescriptionData({ ...prescriptionData, pd: e.target.value })} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {prescriptionType === "upload" && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("prescription.uploadImage")}
                      </label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={(e) => setPrescriptionImage(e.target.files?.[0] || null)} 
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-luxury-gold file:text-white hover:file:bg-luxury-gold-light cursor-pointer"
                      />
                      {prescriptionImage && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-sm text-green-600 dark:text-green-400">✓</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{prescriptionImage.name}</p>
                          <button 
                            type="button"
                            onClick={() => setPrescriptionImage(null)}
                            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            {t("common.remove")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-28 p-6 bg-gray-50 dark:bg-luxury-gray/50 rounded-lg space-y-4">
              <h2 className="font-display text-xl">{t("cart.orderSummary")}</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;
                  return (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100">
                        <ProductImage src={product.images[0]} alt={getLocalized(product.name, product.nameAr, language)} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{getLocalized(product.name, product.nameAr, language)}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(getEffectivePrice(product) * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("checkout.couponCode")}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <Button type="button" variant="secondary" onClick={applyCoupon} size="sm">
                  {t("common.apply")}
                </Button>
              </div>
              {couponError && <p className="text-xs text-red-500">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-xs text-green-600">{appliedCoupon.code} — {t("checkout.couponApplied")}</p>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("cart.subtotal")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t("checkout.discount")}</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("checkout.shippingPrice")}</span>
                <span>{shippingPrice > 0 ? formatPrice(shippingPrice) : t("cart.free")}</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between font-medium text-lg">
                <span>{t("cart.total")}</span>
                <span>{formatPrice(total)}</span>
              </div>

              {orderError && (
                <p className="text-sm text-red-500 text-center">{orderError}</p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={placingOrder}>
                {placingOrder ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {placingOrder
                  ? t("checkout.placingOrder")
                  : `${t("checkout.placeOrder")} — ${formatPrice(total)}`}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
