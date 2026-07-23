"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";
import InvoiceActions from "@/components/invoice/InvoiceActions";
import type { Invoice } from "@/types";

export default function InvoicePage() {
  const params = useParams();
  const orderId = params?.id as string;
  const { t } = useLanguage();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/orders/${orderId}/invoice`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
        }
      } catch (error) {
        console.error("Fetch invoice error:", error);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchInvoice();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container-luxury py-20 text-center">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/account/orders" className="btn-primary mt-4 inline-flex">
          {t("account.myOrders")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Toolbar - hidden on print */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 print:hidden">
        <div className="max-w-[210mm] mx-auto flex items-center justify-between">
          <Link
            href="/account/orders"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("account.myOrders")}
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("invoice.title")} #{invoice.invoiceNumber}
          </h1>
          <InvoiceActions invoiceRef={invoiceRef} />
        </div>
      </div>

      {/* Invoice Content */}
      <div className="py-8 px-4 print:py-0 print:px-0" ref={invoiceRef}>
        <InvoiceTemplate invoice={invoice} />
      </div>
    </div>
  );
}
