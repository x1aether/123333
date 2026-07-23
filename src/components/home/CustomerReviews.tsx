"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const testimonials = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Fashion Editor",
    rating: 5,
    text: "The quality of eyewear at Eye Care is unmatched. My Persol 649 arrived beautifully packaged, and the fit is absolutely perfect.",
    avatar: "SM",
  },
  {
    id: "2",
    name: "James Chen",
    role: "Architect",
    rating: 5,
    text: "Finally found blue light glasses that don't compromise on style. The Warby Parker Chamberlain has been a game-changer for my workdays.",
    avatar: "JC",
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    role: "Professional Athlete",
    rating: 5,
    text: "Oakley Radar EV Path sunglasses are incredible for training. Crystal clear vision and they stay put during intense workouts.",
    avatar: "ER",
  },
];

export function CustomerReviews() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-luxury-black text-luxury-white">
      <div className="container-luxury">
        <div className="text-center mb-12">
          <p className="text-luxury-gold text-sm tracking-[0.3em] uppercase mb-3">
            {t("home.testimonials")}
          </p>
          <h2 className="heading-section text-white">{t("home.whatClientsSay")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-dark p-8"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-luxury-gold text-luxury-gold"
                  />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-medium text-sm">{review.name}</p>
                  <p className="text-xs text-gray-500">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
