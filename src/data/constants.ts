export const brands = [
  "Ray-Ban",
  "Oakley",
  "Persol",
  "Gucci",
  "Gentle Monster",
  "Warby Parker",
  "Tom Ford",
  "Prada",
  "Oliver Peoples",
  "Maui Jim",
];

export const frameShapes = [
  "Aviator",
  "Round",
  "Square",
  "Rectangle",
  "Cat Eye",
  "Oval",
  "Wayfarer",
  "Geometric",
  "Butterfly",
];

export const frameColors = [
  "Black",
  "Gold",
  "Silver",
  "Tortoise",
  "Crystal",
  "Brown",
  "Blue",
  "Green",
  "Rose Gold",
  "Matte Black",
];

export const lensColors = [
  "Clear",
  "Grey",
  "Brown",
  "Green",
  "Blue",
  "Gradient",
  "Mirror",
  "Yellow",
  "Rose",
];

export const categories = [
  "Sunglasses",
  "Prescription Glasses",
  "Reading Glasses",
  "Blue Light Glasses",
  "Fashion Eyewear",
  "Sports Glasses",
  "Contact Lenses",
  "Medical Contact Lenses",
  "Accessories",
];

export const instagramPosts = [
  {
    id: "1",
    image: "/images/placeholder.svg",
    likes: 1243,
  },
  {
    id: "2",
    image: "/images/placeholder.svg",
    likes: 892,
  },
  {
    id: "3",
    image: "/images/placeholder.svg",
    likes: 2156,
  },
  {
    id: "4",
    image: "/images/placeholder.svg",
    likes: 1678,
  },
  {
    id: "5",
    image: "/images/placeholder.svg",
    likes: 934,
  },
  {
    id: "6",
    image: "/images/placeholder.svg",
    likes: 1456,
  },
];

export const coupons = [
  { code: "EYECARE10", discount: 10, type: "percentage" as const, minPurchase: 100 },
  { code: "LUXURY25", discount: 25, type: "fixed" as const, minPurchase: 200 },
  { code: "WELCOME15", discount: 15, type: "percentage" as const, minPurchase: 150 },
];

export const faqs = [
  {
    question: "How do I know which frame size fits me?",
    answer:
      "Measure the width of your face from temple to temple. Our frames list lens width, bridge width, and temple length in millimeters. Use our virtual try-on tool or visit a store for personalized fitting.",
  },
  {
    question: "Can I add prescription lenses to any frame?",
    answer:
      "Most of our frames are prescription-compatible. Look for the 'Prescription Compatible' badge on product pages. Single vision, progressive, and bifocal lenses are available.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day hassle-free return policy. If you're not completely satisfied, return your eyewear in original condition for a full refund or exchange.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 5-7 business days. Express shipping (2-3 days) and overnight options are available at checkout. Prescription orders may take an additional 3-5 days for lens crafting.",
  },
  {
    question: "Do you offer warranty on eyewear?",
    answer:
      "All frames come with a 2-year manufacturer warranty covering defects in materials and workmanship. Lens coatings are covered for 1 year against peeling or scratching under normal use.",
  },
];
