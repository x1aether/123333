"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Invoice } from "@/types";

interface InvoiceTemplateProps {
  invoice: Invoice;
}

export default function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const statusLabels: Record<string, { en: string; ar: string }> = {
    pending: { en: "Pending", ar: "قيد الانتظار" },
    accepted: { en: "Accepted", ar: "مقبول" },
    preparing: { en: "Preparing", ar: "قيد التحضير" },
    packed: { en: "Packed", ar: "تم التغليف" },
    shipped: { en: "Shipped", ar: "تم الشحن" },
    out_for_delivery: { en: "Out for Delivery", ar: "في الطريق" },
    delivered: { en: "Delivered", ar: "تم التسليم" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
    rejected: { en: "Rejected", ar: "مرفوض" },
    returned: { en: "Returned", ar: "مرتجع" },
    refunded: { en: "Refunded", ar: "مسترد" },
  };

  const statusText = statusLabels[invoice.orderStatus]?.[isAr ? "ar" : "en"] || invoice.orderStatus;
  const paymentText = invoice.paymentMethod === "cod"
    ? (isAr ? "الدفع عند الاستلام" : "Cash on Delivery")
    : "Visa";

  return (
    <div
      id="invoice-content"
      className="bg-white text-black p-8 max-w-[210mm] mx-auto"
      dir={isAr ? "rtl" : "ltr"}
      style={{ fontFamily: "Arial, sans-serif", fontSize: "12px" }}
    >
      {/* Header with Store Logo */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
        <div className="flex items-start gap-4">
          {invoice.storeLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={invoice.storeLogo} alt={invoice.storeName} className="w-16 h-16 object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invoice.storeName}</h1>
            <p className="text-gray-600 mt-1">{invoice.storeAddress}</p>
            <p className="text-gray-600">{invoice.storeEmail}</p>
            <p className="text-gray-600">{invoice.storePhone}</p>
          </div>
        </div>
        <div className={isAr ? "text-left" : "text-right"}>
          <h2 className="text-xl font-bold text-gray-900">
            {isAr ? "فاتورة" : "INVOICE"}
          </h2>
          <p className="text-gray-600 mt-1">
            <strong>{isAr ? "رقم الفاتورة:" : "Invoice #:"}</strong> {invoice.invoiceNumber}
          </p>
          <p className="text-gray-600">
            <strong>{isAr ? "رقم الطلب:" : "Order #:"}</strong> {invoice.orderNumber}
          </p>
          <p className="text-gray-600">
            <strong>{isAr ? "التاريخ:" : "Date:"}</strong>{" "}
            {new Date(invoice.invoiceDate).toLocaleDateString(isAr ? "ar-EG" : "en-US")}
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center mb-6 p-3 bg-gray-100 rounded">
        <div>
          <span className="text-xs text-gray-500 uppercase font-bold">{isAr ? "حالة الطلب" : "Order Status"}</span>
          <p className="font-bold text-gray-900">{statusText}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase font-bold">{isAr ? "حالة الدفع" : "Payment Status"}</span>
          <p className="font-bold text-gray-900">{invoice.paymentStatus}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase font-bold">{isAr ? "طريقة الدفع" : "Payment Method"}</span>
          <p className="font-bold text-gray-900">{paymentText}</p>
        </div>
        {invoice.trackingNumber && (
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold">{isAr ? "رقم التتبع" : "Tracking #"}</span>
            <p className="font-bold text-gray-900">{invoice.trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Customer & Shipping */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">
            {isAr ? "معلومات العميل" : "Customer Information"}
          </h3>
          <p className="text-gray-700 font-medium">{invoice.customerName}</p>
          <p className="text-gray-700">{invoice.customerPhone}</p>
          {invoice.customerEmail && <p className="text-gray-700">{invoice.customerEmail}</p>}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">
            {isAr ? "عنوان الشحن" : "Shipping Address"}
          </h3>
          <p className="text-gray-700 font-medium">
            {invoice.shippingAddress.firstName} {invoice.shippingAddress.lastName}
          </p>
          <p className="text-gray-700">
            {invoice.shippingAddress.address}
            {invoice.shippingAddress.buildingNumber ? `, ${isAr ? "مبنى" : "Bldg"} ${invoice.shippingAddress.buildingNumber}` : ""}
          </p>
          <p className="text-gray-700">
            {invoice.shippingAddress.city}
            {invoice.shippingAddress.governorate ? `, ${invoice.shippingAddress.governorate}` : ""}
            {", "}{invoice.shippingAddress.country}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2 text-xs">{isAr ? "الصورة" : "Image"}</th>
            <th className={`p-2 text-xs ${isAr ? "text-right" : "text-left"}`}>{isAr ? "المنتج" : "Product"}</th>
            <th className="p-2 text-xs text-center">{isAr ? "الكمية" : "Qty"}</th>
            <th className={`p-2 text-xs ${isAr ? "text-left" : "text-right"}`}>{isAr ? "السعر" : "Unit Price"}</th>
            <th className={`p-2 text-xs ${isAr ? "text-left" : "text-right"}`}>{isAr ? "الإجمالي" : "Total"}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="p-2">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                )}
              </td>
              <td className={`p-2 text-gray-700 ${isAr ? "text-right" : "text-left"}`}>
                <div className="font-medium">{item.productName}</div>
                <div className="text-xs text-gray-500">{item.brand} {item.frameColor ? `• ${item.frameColor}` : ""}</div>
              </td>
              <td className="p-2 text-center text-gray-700">{item.quantity}</td>
              <td className={`p-2 text-gray-700 ${isAr ? "text-left" : "text-right"}`}>{item.price.toFixed(2)} EGP</td>
              <td className={`p-2 font-medium text-gray-900 ${isAr ? "text-left" : "text-right"}`}>
                {(item.price * item.quantity).toFixed(2)} EGP
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Prescription Information */}
      {invoice.prescription && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">
            {isAr ? "معلومات الروشتة" : "Prescription Information"}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-gray-800">{isAr ? "العين اليمنى" : "Right Eye"} (OD)</p>
              <p className="text-gray-600">
                SPH: {invoice.prescription.rightEye.sphere} | CYL: {invoice.prescription.rightEye.cylinder} | Axis: {invoice.prescription.rightEye.axis}
                {invoice.prescription.rightEye.add ? ` | Add: ${invoice.prescription.rightEye.add}` : ""}
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-800">{isAr ? "العين اليسرى" : "Left Eye"} (OS)</p>
              <p className="text-gray-600">
                SPH: {invoice.prescription.leftEye.sphere} | CYL: {invoice.prescription.leftEye.cylinder} | Axis: {invoice.prescription.leftEye.axis}
                {invoice.prescription.leftEye.add ? ` | Add: ${invoice.prescription.leftEye.add}` : ""}
              </p>
            </div>
          </div>
          <p className="text-xs mt-2"><strong>PD:</strong> {invoice.prescription.pd}</p>
          {invoice.prescription.notes && (
            <p className="text-xs text-gray-500 mt-1"><strong>{isAr ? "ملاحظات:" : "Notes:"}</strong> {invoice.prescription.notes}</p>
          )}
        </div>
      )}

      {/* Prescription Image (uploaded by customer) */}
      {invoice.prescriptionImage && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">
            {isAr ? "صورة الروشتة" : "Prescription Image"}
          </h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={invoice.prescriptionImage}
            alt={isAr ? "صورة الروشتة" : "Prescription"}
            className="max-h-64 rounded border border-gray-300 object-contain"
          />
        </div>
      )}

      {/* Summary */}
      <div className="flex justify-end mb-6">
        <div className="w-72">
          <div className="flex justify-between py-1 text-gray-600">
            <span>{isAr ? "المجموع الفرعي" : "Subtotal"}:</span>
            <span>{invoice.subtotal.toFixed(2)} EGP</span>
          </div>
          <div className="flex justify-between py-1 text-gray-600">
            <span>{isAr ? "الشحن" : "Shipping"}:</span>
            <span>{invoice.shipping.toFixed(2)} EGP</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-1 text-green-600">
              <span>{isAr ? "الخصم" : "Discount"}{invoice.couponCode ? ` (${invoice.couponCode})` : ""}:</span>
              <span>-{invoice.discount.toFixed(2)} EGP</span>
            </div>
          )}
          {invoice.tax > 0 && (
            <div className="flex justify-between py-1 text-gray-600">
              <span>{isAr ? "الضريبة" : "Tax"}:</span>
              <span>{invoice.tax.toFixed(2)} EGP</span>
            </div>
          )}
          <hr className="my-2 border-gray-300" />
          <div className="flex justify-between py-2 text-lg font-bold text-gray-900">
            <span>{isAr ? "الإجمالي" : "Grand Total"}:</span>
            <span>{invoice.total.toFixed(2)} EGP</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>{isAr ? "ملاحظات:" : "Notes:"}</strong> {invoice.notes}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
        <p className="mb-1 font-medium">{isAr ? "شكراً لشرائك!" : "Thank you for your purchase!"}</p>
        <p>{isAr ? "الشروط: جميع المبيعات نهائية. الإرجاع خلال 30 يوم بالحالة الأصلية." : "Terms: All sales final. Returns within 30 days in original condition."}</p>
      </div>
    </div>
  );
}
