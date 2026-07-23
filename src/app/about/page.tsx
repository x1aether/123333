import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Eye Care — your premium destination for luxury eyewear.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[50vh] min-h-[400px] flex items-center">
        <Image
          src="/images/hero/banner.jpg"
          alt="About Eye Care"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container-luxury text-white">
          <h1 className="heading-display text-white mb-4">Our Story</h1>
          <p className="text-xl text-gray-300 max-w-xl">
            Curating the world&apos;s finest eyewear since 2020.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-luxury max-w-3xl mx-auto text-center">
          <h2 className="heading-section mb-6">Vision Meets Craftsmanship</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            Eye Care was founded with a singular vision: to make premium eyewear
            accessible to those who appreciate exceptional quality and timeless design.
            We partner with the world&apos;s most prestigious brands to bring you a
            curated collection of sunglasses, prescription glasses, and fashion eyewear.
          </p>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Every frame in our collection is hand-selected by our team of optical
            experts, ensuring that you receive only the finest craftsmanship,
            materials, and lens technology available.
          </p>
        </div>
      </section>

      <section className="section-padding bg-gray-50 dark:bg-luxury-gray/30">
        <div className="container-luxury">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10+", label: "Premium Brands" },
              { number: "50K+", label: "Happy Customers" },
              { number: "15", label: "Eyewear Categories" },
            ].map((stat) => (
              <div key={stat.label} className="p-8">
                <p className="text-4xl font-display text-luxury-gold mb-2">
                  {stat.number}
                </p>
                <p className="text-sm text-gray-500 tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding text-center">
        <div className="container-luxury">
          <h2 className="heading-section mb-6">Experience Luxury Eyewear</h2>
          <Link href="/shop">
            <Button variant="gold" size="lg">
              Shop Collection
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
