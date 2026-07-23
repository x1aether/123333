"use client";

import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProductFAQ } from "@/components/product/ProductFAQ";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container-luxury py-8 lg:py-12">
      <div className="text-center mb-12">
        <h1 className="heading-section mb-3">Contact Us</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Have a question about our eyewear? Our team of optical experts is here to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="font-display text-xl mb-6">Get in Touch</h2>
          {submitted ? (
            <div className="p-8 bg-green-50 dark:bg-green-900/20 text-center">
              <p className="text-green-700 dark:text-green-400 font-medium">
                Thank you! We&apos;ll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="First Name" required />
                <Input label="Last Name" required />
              </div>
              <Input label="Email" type="email" required />
              <Input label="Subject" required />
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-luxury-gray border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 resize-none"
                />
              </div>
              <Button type="submit" variant="gold">
                Send Message
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl mb-6">Contact Information</h2>
            <div className="space-y-4">
              {[
                { icon: Phone, label: "Phone", value: "+1 (800) 555-EYES" },
                { icon: Mail, label: "Email", value: "hello@eyecare.com" },
                { icon: MapPin, label: "Address", value: "123 Fifth Avenue, New York, NY 10001" },
                { icon: Clock, label: "Hours", value: "Mon–Fri: 9AM–6PM EST" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-luxury-gold/10">
                    <item.icon className="w-5 h-5 text-luxury-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="heading-section mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-2xl mx-auto">
          <ProductFAQ />
        </div>
      </div>
    </div>
  );
}
