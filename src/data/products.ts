import type { Product } from "@/types";

const img = () => `/images/products/placeholder.jpg`;

export const products: Product[] = [
  {
    id: "1",
    slug: "ray-ban-aviator-classic",
    name: "Aviator Classic",
    nameAr: "أفياتور كلاسيك",
    brand: "Ray-Ban",
    brandAr: "ري بان",
    price: 189,
    salePrice: 159,
    sku: "RB-AV-001",
    category: "Sunglasses",
    categoryAr: "نظارات شمسية",
    frameType: "Full Rim",
    frameTypeAr: "إطار كامل",
    frameShape: "Aviator",
    frameShapeAr: "أفياتور",
    lensColor: "Green",
    lensColorAr: "أخضر",
    frameColor: "Gold",
    frameColorAr: "ذهبي",
    gender: "Unisex",
    material: "Metal",
    uvProtection: "UV400",
    polarized: true,
    blueLightFilter: false,
    prescriptionCompatible: true,
    stockStatus: "In Stock",
    stockQuantity: 10,
    images: [img(), img(), img()],
    description:
      "The iconic Ray-Ban Aviator Classic features a timeless teardrop shape with premium metal construction. Crystal green G-15 lenses provide exceptional clarity and 100% UV protection.",
    descriptionAr:
      "نظارة ري بان أفياتور كلاسيك الأيقونية تتميز بشكل قطرة الدمعة الخالد مع هيكل معدني فاخر. عدسات كريستال خضراء G-15 توفر وضوحًا استثنائيًا وحماية 100% من الأشعة فوق البنفسجية.",
    features: [
      "Iconic teardrop aviator shape",
      "Crystal green G-15 lenses",
      "100% UV400 protection",
      "Polarized lens option",
      "Adjustable nose pads",
    ],
    featuresAr: [
      "شكل أفياتور قطرة الدمعة الأيقوني",
      "عدسات كريستال خضراء G-15",
      "حماية 100% من الأشعة فوق البنفسجية UV400",
      "خيار عدسات مستقطبة",
      "وسادات أنف قابلة للتعديل",
    ],
    variants: [
      { id: "v1", frameColor: "Gold", lensColor: "Green", image: img(), sku: "RB-AV-001-GG" },
      { id: "v2", frameColor: "Silver", lensColor: "Grey", image: img(), sku: "RB-AV-001-SG" },
      { id: "v3", frameColor: "Black", lensColor: "Brown", image: img(), sku: "RB-AV-001-BB" },
    ],
    reviews: [
      { id: "r1", author: "James M.", rating: 5, date: "2026-01-15", title: "Timeless Classic", comment: "These aviators are absolutely perfect.", verified: true },
      { id: "r2", author: "Sarah K.", rating: 5, date: "2026-02-20", title: "Worth Every Penny", comment: "Premium quality that you can feel.", verified: true },
    ],
    relatedProductIds: ["4", "5", "9"],
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 342,
  },
  {
    id: "4",
    slug: "persol-649-original",
    name: "649 Original",
    nameAr: "649 الأصلي",
    brand: "Persol",
    brandAr: "بيرسول",
    price: 380,
    salePrice: 340,
    sku: "PS-649-004",
    category: "Sunglasses",
    categoryAr: "نظارات شمسية",
    frameType: "Full Rim",
    frameTypeAr: "إطار كامل",
    frameShape: "Round",
    frameShapeAr: "دائري",
    lensColor: "Brown",
    lensColorAr: "بني",
    frameColor: "Tortoise",
    frameColorAr: "سلحفاة",
    gender: "Unisex",
    material: "Acetate",
    uvProtection: "UV400",
    polarized: true,
    blueLightFilter: false,
    prescriptionCompatible: true,
    stockStatus: "In Stock",
    stockQuantity: 10,
    images: [img(), img(), img()],
    description:
      "The legendary Persol 649, worn by Steve McQueen. Handcrafted in Italy with the signature Meflecto temple system for supreme comfort.",
    descriptionAr:
      "نظارة بيرسول 649 الأسطورية، التي ارتداها ستيف ماكوين. مصنوعة يدويًا في إيطاليا مع نظام المعابد Meflecto المميز للراحة الفائقة.",
    features: [
      "Handmade in Italy",
      "Meflecto flexible temples",
      "Crystal lenses",
      "Silver arrow hinges",
      "Steve McQueen edition",
    ],
    featuresAr: [
      "صنع يدوي في إيطاليا",
      "معابد Meflecto مرنة",
      "عدسات كريستال",
      "مفصلات سهم فضية",
      "إصدار ستيف ماكوين",
    ],
    variants: [
      { id: "v1", frameColor: "Tortoise", lensColor: "Brown", image: img(), sku: "PS-649-004-TB" },
      { id: "v2", frameColor: "Black", lensColor: "Grey", image: img(), sku: "PS-649-004-BG" },
    ],
    reviews: [
      { id: "r1", author: "David R.", rating: 5, date: "2026-01-28", title: "Italian Craftsmanship", comment: "You can feel the quality immediately.", verified: true },
    ],
    relatedProductIds: ["1", "3", "5"],
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 256,
  },
  {
    id: "3",
    slug: "gentle-monster-her-01",
    name: "HER 01",
    nameAr: "هير 01",
    brand: "Gentle Monster",
    brandAr: "جنتل مونستر",
    price: 320,
    sku: "GM-HER-003",
    category: "Fashion Eyewear",
    categoryAr: "نظارات أزياء",
    frameType: "Full Rim",
    frameTypeAr: "إطار كامل",
    frameShape: "Cat Eye",
    frameShapeAr: "عين القط",
    lensColor: "Clear",
    lensColorAr: "شفاف",
    frameColor: "Black",
    frameColorAr: "أسود",
    gender: "Women",
    material: "Acetate",
    uvProtection: "UV400",
    polarized: false,
    blueLightFilter: true,
    prescriptionCompatible: true,
    stockStatus: "In Stock",
    stockQuantity: 10,
    images: [img(), img(), img()],
    description:
      "Gentle Monster HER 01 redefines contemporary eyewear with an architectural cat-eye silhouette. Handcrafted acetate frames meet avant-garde design.",
    descriptionAr:
      "جنتل مونستر هير 01 تعيد تعريف النظارات المعاصرة بشكل عين القط المعماري. إطارات أسيتات مصنوعة يدويًا تلتقي بتصميم طليعي.",
    features: [
      "Handcrafted Italian acetate",
      "Architectural cat-eye design",
      "Blue light filtering lenses",
      "Signature GM branding",
      "Limited edition collection",
    ],
    featuresAr: [
      "أسيتات إيطالية مصنوعة يدويًا",
      "تصميم عين القط المعماري",
      "عدسات فلترة الضوء الأزرق",
      "علامة GM التجارية المميزة",
      "مجموعة إصدار محدود",
    ],
    variants: [
      { id: "v1", frameColor: "Black", lensColor: "Clear", image: img(), sku: "GM-HER-003-BK" },
      { id: "v2", frameColor: "Crystal", lensColor: "Clear", image: img(), sku: "GM-HER-003-CR" },
    ],
    reviews: [
      { id: "r1", author: "Emma L.", rating: 5, date: "2026-02-10", title: "Statement Piece", comment: "These are wearable art.", verified: true },
    ],
    relatedProductIds: ["1", "5", "7"],
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.7,
    reviewCount: 87,
  },
  {
    id: "5",
    slug: "warby-parker-welty",
    name: "Welty",
    nameAr: "ويلتي",
    brand: "Warby Parker",
    brandAr: "واربي باركر",
    price: 145,
    sku: "WP-WE-005",
    category: "Prescription Glasses",
    categoryAr: "نظارات طبية",
    frameType: "Full Rim",
    frameTypeAr: "إطار كامل",
    frameShape: "Rectangle",
    frameShapeAr: "مستطيل",
    lensColor: "Clear",
    lensColorAr: "شفاف",
    frameColor: "Crystal",
    frameColorAr: "كريستال",
    gender: "Unisex",
    material: "Acetate",
    uvProtection: "UV400",
    polarized: false,
    blueLightFilter: true,
    prescriptionCompatible: true,
    stockStatus: "In Stock",
    stockQuantity: 10,
    images: [img(), img(), img()],
    description:
      "Warby Parker Welty features a refined rectangular silhouette in premium cellulose acetate. Includes blue light filtering lenses for screen protection.",
    descriptionAr:
      "واربي باركر ويلتي تتميز بشكل مستطيل أنيق من أسيتات السيلولوز الفاخرة. تتضمن عدسات فلترة الضوء الأزرق لحماية الشاشة.",
    features: [
      "Premium cellulose acetate",
      "Blue light filtering lenses",
      "Anti-reflective coating",
      "Scratch-resistant",
      "Free home try-on available",
    ],
    featuresAr: [
      "أسيتات سيلولوز فاخرة",
      "عدسات فلترة الضوء الأزرق",
      "طلاء مضاد للانعكاس",
      "مقاوم للخدش",
      "تجربة منزلية مجانية متاحة",
    ],
    variants: [
      { id: "v1", frameColor: "Crystal", lensColor: "Clear", image: img(), sku: "WP-WE-005-CR" },
      { id: "v2", frameColor: "Black", lensColor: "Clear", image: img(), sku: "WP-WE-005-BK" },
    ],
    reviews: [
      { id: "r1", author: "Lisa P.", rating: 4, date: "2026-03-05", title: "Great Everyday Glasses", comment: "Comfortable for all-day wear.", verified: true },
    ],
    relatedProductIds: ["7", "12", "3"],
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.6,
    reviewCount: 412,
  },
  {
    id: "7",
    slug: "warby-parker-chamberlain",
    name: "Chamberlain",
    nameAr: "تشامبرلين",
    brand: "Warby Parker",
    brandAr: "واربي باركر",
    price: 95,
    sku: "WP-CH-007",
    category: "Blue Light Glasses",
    categoryAr: "نظارات الضوء الأزرق",
    frameType: "Full Rim",
    frameTypeAr: "إطار كامل",
    frameShape: "Round",
    frameShapeAr: "دائري",
    lensColor: "Clear",
    lensColorAr: "شفاف",
    frameColor: "Matte Black",
    frameColorAr: "أسود مطفي",
    gender: "Unisex",
    material: "TR90",
    uvProtection: "UV400",
    polarized: false,
    blueLightFilter: true,
    prescriptionCompatible: true,
    stockStatus: "In Stock",
    stockQuantity: 10,
    images: [img(), img(), img()],
    description:
      "Chamberlain blue light glasses feature a classic round frame with advanced blue light filtering technology. Perfect for digital professionals.",
    descriptionAr:
      "نظارات تشامبرلين للضوء الأزرق تتميز بإطار دائري كلاسيكي مع تقنية فلترة الضوء الأزرق المتقدمة. مثالية للمحترفين الرقميين.",
    features: [
      "40% blue light reduction",
      "Anti-glare coating",
      "Lightweight TR90 frame",
      "Prescription-ready",
      "Includes cleaning cloth",
    ],
    featuresAr: [
      "تقليل الضوء الأزرق بنسبة 40%",
      "طلاء مضاد للوهج",
      "إطار TR90 خفيف الوزن",
      "جاهز للوصفة الطبية",
      "يتضمن قطعة تنظيف",
    ],
    variants: [
      { id: "v1", frameColor: "Matte Black", lensColor: "Clear", image: img(), sku: "WP-CH-007-MB" },
      { id: "v2", frameColor: "Crystal", lensColor: "Clear", image: img(), sku: "WP-CH-007-CR" },
    ],
    reviews: [
      { id: "r1", author: "Alex W.", rating: 5, date: "2026-03-10", title: "Game Changer", comment: "My eye strain has significantly reduced.", verified: true },
    ],
    relatedProductIds: ["5", "12", "1"],
    isNewArrival: false,
    isBestSeller: true,
    rating: 4.7,
    reviewCount: 523,
  },
  {
    id: "9",
    slug: "oakley-radar-ev-path",
    name: "Radar EV Path",
    nameAr: "رادار إي في باث",
    brand: "Oakley",
    brandAr: "أوكلي",
    price: 210,
    sku: "OK-RE-009",
    category: "Sports Glasses",
    categoryAr: "نظارات رياضية",
    frameType: "Shield",
    frameTypeAr: "درع",
    frameShape: "Geometric",
    frameShapeAr: "هندسي",
    lensColor: "Mirror",
    lensColorAr: "مرآة",
    frameColor: "Matte Black",
    frameColorAr: "أسود مطفي",
    gender: "Unisex",
    material: "TR90",
    uvProtection: "UV400",
    polarized: false,
    blueLightFilter: false,
    prescriptionCompatible: true,
    stockStatus: "In Stock",
    stockQuantity: 10,
    images: [img(), img(), img()],
    description:
      "Oakley Radar EV Path is engineered for peak athletic performance. Extended lens coverage and Prizm lens technology optimize vision for sport.",
    descriptionAr:
      "أوكلي رادار إي في باث مصممة للأداء الرياضي الذروي. تغطية عدسات ممتدة وتقنية عدسات Prizm تحسن الرؤية للرياضة.",
    features: [
      "Extended lens coverage",
      "Prizm sport lens technology",
      "Unobtainium grip",
      "Interchangeable lenses",
      "Impact protection",
    ],
    featuresAr: [
      "تغطية عدسات ممتدة",
      "تقنية عدسات Prizm الرياضية",
      "قبضة Unobtainium",
      "عدسات قابلة للتبديل",
      "حماية من الصدمات",
    ],
    variants: [
      { id: "v1", frameColor: "Matte Black", lensColor: "Mirror", image: img(), sku: "OK-RE-009-MM" },
      { id: "v2", frameColor: "White", lensColor: "Grey", image: img(), sku: "OK-RE-009-WG" },
    ],
    reviews: [
      { id: "r1", author: "Ryan S.", rating: 5, date: "2026-02-25", title: "Pro Level Performance", comment: "Used these for a marathon. Zero fogging.", verified: true },
    ],
    relatedProductIds: ["1", "4", "5"],
    isNewArrival: true,
    isBestSeller: false,
    rating: 4.8,
    reviewCount: 145,
  },
  {
    id: "12",
    slug: "warby-parker-percey",
    name: "Percey",
    nameAr: "بيرسي",
    brand: "Warby Parker",
    brandAr: "واربي باركر",
    price: 95,
    sku: "WP-PE-012",
    category: "Reading Glasses",
    categoryAr: "نظارات قراءة",
    frameType: "Semi-Rimless",
    frameTypeAr: "نصف إطار",
    frameShape: "Rectangle",
    frameShapeAr: "مستطيل",
    lensColor: "Clear",
    lensColorAr: "شفاف",
    frameColor: "Silver",
    frameColorAr: "فضي",
    gender: "Men",
    material: "Metal",
    uvProtection: "None",
    polarized: false,
    blueLightFilter: false,
    prescriptionCompatible: false,
    stockStatus: "In Stock",
    stockQuantity: 10,
    images: [img(), img(), img()],
    description:
      "Warby Parker Percey reading glasses feature a sophisticated semi-rimless design. Available in multiple magnification strengths for comfortable reading.",
    descriptionAr:
      "نظارات القراءة واربي باركر بيرسي تتميز بتصميم نصف إطار أنيق. متوفرة بقوى تكبير متعددة للقراءة المريحة.",
    features: [
      "Semi-rimless design",
      "Multiple magnification options",
      "Anti-reflective coating",
      "Spring hinges",
      "Includes case",
    ],
    featuresAr: [
      "تصميم نصف إطار",
      "خيارات تكبير متعددة",
      "طلاء مضاد للانعكاس",
      "مفصلات زنبركية",
      "يتضمن حافظة",
    ],
    variants: [
      { id: "v1", frameColor: "Silver", lensColor: "Clear", image: img(), sku: "WP-PE-012-SV" },
      { id: "v2", frameColor: "Gold", lensColor: "Clear", image: img(), sku: "WP-PE-012-GD" },
    ],
    reviews: [
      { id: "r1", author: "Robert F.", rating: 4, date: "2026-03-12", title: "Comfortable Readers", comment: "Lightweight and stylish.", verified: true },
    ],
    relatedProductIds: ["5", "7", "15"],
    isNewArrival: false,
    isBestSeller: false,
    rating: 4.5,
    reviewCount: 234,
  },
  {
    id: "15",
    slug: "premium-lens-cloth-set",
    name: "Premium Lens Cloth Set",
    nameAr: "طقم قماش تنظيف العدسات الفاخر",
    brand: "Eye Care",
    brandAr: "آي كير",
    price: 29,
    sku: "EC-LC-015",
    category: "Accessories",
    categoryAr: "إكسسوارات",
    frameType: "Full Rim",
    frameShape: "Rectangle",
    lensColor: "Clear",
    frameColor: "Silver",
    gender: "Unisex",
    material: "Stainless Steel",
    uvProtection: "None",
    polarized: false,
    blueLightFilter: false,
    prescriptionCompatible: false,
    stockStatus: "In Stock",
    stockQuantity: 10,
    images: [img(), img()],
    description:
      "Premium microfiber lens cloth set with anti-static treatment. Includes 3 cloths and a compact carrying pouch. Safe for all lens coatings.",
    descriptionAr:
      "طقم قماش تنظيف العدسات من الألياف الدقيقة الفاخرة مع معالجة مضادة للكهرباء الساكنة. يتضمن 3 قطع قماش وحقيبة حمل صغيرة. آمن لجميع طلاءات العدسات.",
    features: [
      "Anti-static microfiber",
      "Safe for all coatings",
      "Machine washable",
      "Compact carrying pouch",
      "Set of 3 cloths",
    ],
    featuresAr: [
      "ألياف دقيقة مضادة للكهرباء الساكنة",
      "آمن لجميع الطلاءات",
      "قابل للغسيل في الغسالة",
      "حقيبة حمل صغيرة",
      "طقم من 3 قطع قماش",
    ],
    variants: [
      { id: "v1", frameColor: "Silver", lensColor: "Clear", image: img(), sku: "EC-LC-015-SV" },
    ],
    reviews: [
      { id: "r1", author: "Karen S.", rating: 5, date: "2026-03-01", title: "Essential Accessory", comment: "Best lens cloths I've used.", verified: true },
    ],
    relatedProductIds: ["5", "7", "12"],
    isNewArrival: false,
    isBestSeller: false,
    rating: 4.8,
    reviewCount: 189,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getRelatedProducts(product: Product): Product[] {
  return product.relatedProductIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== undefined);
}

export function getBestSellers(): Product[] {
  return products.filter((p) => p.isBestSeller);
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.isNewArrival);
}

export function getByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getByBrand(brand: string): Product[] {
  return products.filter((p) => p.brand === brand);
}

export function getPolarizedCollection(): Product[] {
  return products.filter((p) => p.polarized);
}

export function getPrescriptionCollection(): Product[] {
  return products.filter((p) => p.prescriptionCompatible);
}

export function getTrendingSunglasses(): Product[] {
  return products
    .filter((p) => p.category === "Sunglasses")
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.frameShape.toLowerCase().includes(q) ||
      (p.nameAr && p.nameAr.includes(query)) ||
      (p.brandAr && p.brandAr.includes(query)) ||
      (p.categoryAr && p.categoryAr.includes(query)) ||
      (p.descriptionAr && p.descriptionAr.includes(query))
  );
}
