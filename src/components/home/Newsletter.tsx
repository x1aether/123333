"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="section-padding bg-gray-50 dark:bg-luxury-gray/30">
      <div className="container-luxury max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Mail className="w-8 h-8 mx-auto mb-4 text-luxury-gold" />
          <h2 className="heading-section mb-3">{t("home.newsletterTitle")}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t("home.newsletterDesc")}
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>{t("home.subscribed")}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder={t("home.enterEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" variant="gold">
                {t("home.subscribe")}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
