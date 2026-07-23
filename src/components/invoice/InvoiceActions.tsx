"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Printer, Download, Loader2 } from "lucide-react";

interface InvoiceActionsProps {
  invoiceRef?: React.RefObject<HTMLDivElement | null>;
}

export default function InvoiceActions({ invoiceRef }: InvoiceActionsProps) {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const element = invoiceRef?.current || document.getElementById("invoice-content");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to generate PDF. Please try print instead.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 print:hidden">
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
      >
        <Printer className="w-4 h-4" />
        {t("invoice.print")}
      </button>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 px-4 py-2 bg-luxury-black text-white rounded-lg hover:bg-gray-800 dark:bg-luxury-white dark:text-luxury-black dark:hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
      >
        {downloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {t("invoice.download")}
      </button>
    </div>
  );
}
