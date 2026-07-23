"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  GitCompareArrows,
  Share2,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import type { Product } from "@/types";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductFAQ } from "@/components/product/ProductFAQ";
import { ProductGrid } from "@/components/shared/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getLocalized,
  getLocalizedArray,
  getTranslatedCategory,
  getTranslatedLabel,
  frameShapeTranslations,
  materialTranslations,
  genderTranslations,
  frameTypeTranslations,
  cn,
} from "@/lib/utils";

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const { language, t } = useLanguage();
  // Products created via the admin panel have no explicit variants. Fall back to
  // a single variant derived from the product so the detail page always renders.
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: `${product.id}-default`,
            frameColor: product.frameColor || "",
            lensColor: product.lensColor || "",
            image: product.images?.[0] || "",
            sku: product.sku,
          },
        ];
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "faq">("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { toggleItem: toggleCompare, isComparing } = useCompare();
  const { addItem: addRecent } = useRecentlyViewed();

  // Localized fields
  const productName = getLocalized(product.name, product.nameAr, language);
  const productBrand = getLocalized(product.brand, product.brandAr, language);
  const productCategory = getTranslatedCategory(product.category, language);
  const productDescription = getLocalized(product.description, product.descriptionAr, language);
  const productFeatures = getLocalizedArray(product.features, product.featuresAr, language);
  const productFrameType = getTranslatedLabel(frameTypeTranslations, product.frameType, language);
  const productFrameShape = getTranslatedLabel(frameShapeTranslations, product.frameShape, language);
  const productMaterial = getTranslatedLabel(materialTranslations, product.material, language);
  const productGender = getTranslatedLabel(genderTranslations, product.gender, language);

  useEffect(() => {
    addRecent(product.id);
  }, [product.id, addRecent]);

  const discount = getDiscountPercent(product);
  const price = getEffectivePrice(product);
  const related = relatedProducts;

  const frameColors = [...new Set(variants.map((v) => v.frameColor))].filter(Boolean);
  const lensColors = [...new Set(variants.map((v) => v.lensColor))].filter(Boolean);

  const handleAddToCart = () => {
    addItem(product.id, selectedVariant.id, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied!");
      setTimeout(() => setShareMessage(""), 2000);
    }
  };

  const specs = [
    { label: language === "ar" ? "العلامة التجارية" : "Brand", value: productBrand },
    { label: language === "ar" ? "الفئة" : "Category", value: productCategory },
    { label: language === "ar" ? "نوع الإطار" : "Frame Type", value: productFrameType },
    { label: language === "ar" ? "شكل الإطار" : "Frame Shape", value: productFrameShape },
    { label: language === "ar" ? "المادة" : "Material", value: productMaterial },
    { label: language === "ar" ? "الجنس" : "Gender", value: productGender },
    { label: language === "ar" ? "حماية UV" : "UV Protection", value: product.uvProtection },
    { label: language === "ar" ? "مستقطب" : "Polarized", value: product.polarized ? (language === "ar" ? "نعم" : "Yes") : (language === "ar" ? "لا" : "No") },
    { label: language === "ar" ? "فلتر الضوء الأزرق" : "Blue Light Filter", value: product.blueLightFilter ? (language === "ar" ? "نعم" : "Yes") : (language === "ar" ? "لا" : "No") },
    { label: language === "ar" ? "حماية UV400" : "UV400", value: product.uv400 ? (language === "ar" ? "نعم" : "Yes") : (language === "ar" ? "لا" : "No") },
    { label: language === "ar" ? "المخزون" : "Stock", value: product.stockStatus },
  ];

  return (
    <div className="container-luxury py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-luxury-gold">{t("nav.home")}</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-luxury-gold">{t("nav.shop")}</Link>
        <span className="mx-2">/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-luxury-gold">
          {productCategory}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-luxury-black dark:text-luxury-white">{productName}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
        <ProductGallery images={product.images} name={productName} />

        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.isNewArrival && <Badge variant="new">{t("product.new")}</Badge>}
            {discount && <Badge variant="sale">-{discount}%</Badge>}
            {product.polarized && <Badge variant="gold">{language === "ar" ? "مستقطب" : "Polarized"}</Badge>}
          </div>

          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
            {productBrand}
          </p>
          <h1 className="font-display text-3xl lg:text-4xl mb-3">{productName}</h1>
          <Rating rating={product.rating} reviewCount={product.reviewCount} size="md" className="mb-6" />

          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl font-medium">{formatPrice(price)}</span>
            {product.salePrice && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Frame Color Selector */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">
              {language === "ar" ? "لون الإطار:" : "Frame Color:"} <span className="text-gray-500">{selectedVariant.frameColor}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {frameColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    const variant = variants.find((v) => v.frameColor === color);
                    if (variant) setSelectedVariant(variant);
                  }}
                  className={cn(
                    "px-4 py-2 text-sm border transition-colors",
                    selectedVariant.frameColor === color
                      ? "border-luxury-gold bg-luxury-gold/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-luxury-gold"
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Lens Color Selector */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">
              {language === "ar" ? "لون العدسة:" : "Lens Color:"} <span className="text-gray-500">{selectedVariant.lensColor}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {lensColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    const variant = variants.find(
                      (v) => v.frameColor === selectedVariant.frameColor && v.lensColor === color
                    ) || variants.find((v) => v.lensColor === color);
                    if (variant) setSelectedVariant(variant);
                  }}
                  className={cn(
                    "px-4 py-2 text-sm border transition-colors",
                    selectedVariant.lensColor === color
                      ? "border-luxury-gold bg-luxury-gold/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-luxury-gold"
                  )}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <p className="text-sm font-medium mb-3">{language === "ar" ? "الكمية" : "Quantity"}</p>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-luxury-gray"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-luxury-gray"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button onClick={handleAddToCart} className="flex-1" size="lg">
              {addedToCart ? (
                <><Check className="w-5 h-5 mr-2" /> {language === "ar" ? "تمت الإضافة للسلة" : "Added to Cart"}</>
              ) : (
                <><ShoppingBag className="w-5 h-5 mr-2" /> {t("product.addToCart")}</>
              )}
            </Button>
            <Link href="/checkout" className="btn-gold flex-1 text-center" onClick={handleAddToCart}>
              {language === "ar" ? "اشتر الآن" : "Buy Now"}
            </Link>
          </div>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => toggleItem(product.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm border transition-colors",
                isWishlisted(product.id)
                  ? "border-luxury-gold text-luxury-gold"
                  : "border-gray-200 dark:border-gray-700 hover:border-luxury-gold"
              )}
            >
              <Heart className={cn("w-4 h-4", isWishlisted(product.id) && "fill-current")} />
              {language === "ar" ? "المفضلة" : "Wishlist"}
            </button>
            <button
              onClick={() => toggleCompare(product.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm border transition-colors",
                isComparing(product.id)
                  ? "border-luxury-gold text-luxury-gold"
                  : "border-gray-200 dark:border-gray-700 hover:border-luxury-gold"
              )}
            >
              <GitCompareArrows className="w-4 h-4" />
              {t("product.compare")}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 hover:border-luxury-gold transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {shareMessage || (language === "ar" ? "مشاركة" : "Share")}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-luxury-gray/50">
            <div className="text-center">
              <Truck className="w-5 h-5 mx-auto mb-1 text-luxury-gold" />
              <p className="text-xs">{language === "ar" ? "شحن مجاني" : "Free Shipping"}</p>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 mx-auto mb-1 text-luxury-gold" />
              <p className="text-xs">{language === "ar" ? "ضمان سنتين" : "2-Year Warranty"}</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-5 h-5 mx-auto mb-1 text-luxury-gold" />
              <p className="text-xs">{language === "ar" ? "إرجاع 30 يوم" : "30-Day Returns"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {(["description", "reviews", "faq"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-3 text-sm tracking-wider uppercase transition-colors",
                activeTab === tab
                  ? "border-b-2 border-luxury-gold text-luxury-gold"
                  : "text-gray-500 hover:text-luxury-black dark:hover:text-luxury-white"
              )}
            >
              {tab === "description" ? t("product.description") : tab === "reviews" ? t("product.reviews") : (language === "ar" ? "الأسئلة الشائعة" : "FAQs")}
            </button>
          ))}
        </div>

        {activeTab === "description" && (
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                {productDescription}
              </p>
              <ul className="space-y-2">
                {productFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-luxury-gold mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg mb-4">{language === "ar" ? "المواصفات" : "Specifications"}</h3>
              <dl className="space-y-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800">
                    <dt className="text-gray-500">{spec.label}</dt>
                    <dd className="font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <ProductReviews
            reviews={product.reviews}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        )}

        {activeTab === "faq" && <ProductFAQ />}
      </div>

      {related.length > 0 && (
        <ProductGrid
          products={related}
          title={language === "ar" ? "منتجات مشابهة" : "Related Products"}
          subtitle={language === "ar" ? "قد تعجبك هذه الإطارات أيضًا." : "You might also like these frames."}
          columns={4}
        />
      )}
    </div>
  );
}
