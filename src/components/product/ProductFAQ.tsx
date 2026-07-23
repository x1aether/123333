"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/constants";
import { cn } from "@/lib/utils";

export function ProductFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-700"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex items-center justify-between w-full p-4 text-left"
          >
            <span className="font-medium text-sm pr-4">{faq.question}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 flex-shrink-0 transition-transform",
                openIndex === i && "rotate-180"
              )}
            />
          </button>
          {openIndex === i && (
            <div className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
