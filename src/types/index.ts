// ============================================================
// EYEWEAR TYPES
// ============================================================

export type FrameShape =
  | "Aviator"
  | "Round"
  | "Square"
  | "Rectangle"
  | "Cat Eye"
  | "Oval"
  | "Wayfarer"
  | "Geometric"
  | "Butterfly";

export type FrameType =
  | "Full Rim"
  | "Semi-Rimless"
  | "Rimless"
  | "Wrap"
  | "Shield";

export type Gender = "Men" | "Women" | "Unisex";

export type Material =
  | "Acetate"
  | "Metal"
  | "Titanium"
  | "TR90"
  | "Stainless Steel"
  | "Carbon Fiber"
  | "Wood";

export type Category =
  | "Sunglasses"
  | "Prescription Glasses"
  | "Reading Glasses"
  | "Blue Light Glasses"
  | "Fashion Eyewear"
  | "Sports Glasses"
  | "Contact Lenses"
  | "Medical Contact Lenses"
  | "Accessories";

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

// ============================================================
// PRODUCT TYPES
// ============================================================

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface ProductVariant {
  id: string;
  frameColor: string;
  lensColor: string;
  image: string;
  sku?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  brand: string;
  brandAr?: string;
  price: number;
  salePrice?: number;
  /** @deprecated SKU removed from the UI; kept optional for backward compatibility with existing records. */
  sku?: string;
  category: Category;
  categoryAr?: string;
  frameType: FrameType;
  frameTypeAr?: string;
  frameShape: FrameShape;
  frameShapeAr?: string;
  lensColor: string;
  lensColorAr?: string;
  frameColor: string;
  frameColorAr?: string;
  gender: Gender;
  material: Material;
  uvProtection: string;
  polarized: boolean;
  blueLightFilter: boolean;
  /** UV400 protection (replaces the former "prescriptionCompatible" attribute in the UI). */
  uv400?: boolean;
  /** @deprecated replaced by `uv400` in the UI; kept optional for backward compatibility. */
  prescriptionCompatible?: boolean;
  stockStatus: StockStatus;
  stockQuantity: number;
  images: string[];
  description: string;
  descriptionAr?: string;
  features: string[];
  featuresAr?: string[];
  variants: ProductVariant[];
  reviews: Review[];
  relatedProductIds: string[];
  isNewArrival: boolean;
  isBestSeller: boolean;
  isPublished?: boolean;
  isHidden?: boolean;
  rating: number;
  reviewCount: number;
}

// ============================================================
// CART TYPES
// ============================================================

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

// ============================================================
// FILTER & SORT TYPES
// ============================================================

export interface FilterState {
  brands: string[];
  priceMin: number;
  priceMax: number;
  frameShapes: FrameShape[];
  materials: Material[];
  frameColors: string[];
  lensColors: string[];
  genders: Gender[];
  polarized: boolean | null;
  uvProtection: boolean | null;
  blueLightFilter: boolean | null;
  uv400: boolean | null;
  categories: Category[];
  newArrivals: boolean;
  bestSellers: boolean;
}

export interface SortOption {
  label: string;
  value: string;
}

// ============================================================
// FAQ TYPE
// ============================================================

export interface FAQ {
  question: string;
  answer: string;
}

// ============================================================
// COUPON TYPES
// ============================================================

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: number;
  type: "percentage" | "fixed";
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

// ============================================================
// ORDER TYPES
// ============================================================

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rejected"
  | "returned"
  | "refunded";

export type PaymentMethod = "cod" | "visa";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  brand: string;
  image: string;
  frameColor: string;
  lensColor: string;
  sku?: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  buildingNumber?: string;
  city: string;
  state?: string;
  governorate?: string;
  country: string;
  gpsLat?: string;
  gpsLng?: string;
}

export interface GovernorateShipping {
  governorate: string;
  governorateAr?: string;
  price: number;
  estimatedDays: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface PrescriptionData {
  rightEye: {
    sphere: string;
    cylinder: string;
    axis: string;
    add: string;
  };
  leftEye: {
    sphere: string;
    cylinder: string;
    axis: string;
    add: string;
  };
  pd: string;
  notes: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  couponDiscount?: number;
  couponType?: "percentage" | "fixed";
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber: string | null;
  notes: string;
  prescription: PrescriptionData | null;
  prescriptionImage: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistory[];
}

// ============================================================
// USER / AUTH TYPES
// ============================================================

export type UserRole = "admin" | "customer";

export interface UserAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isBanned?: boolean;
  banReason?: string;
  addresses: UserAddress[];
}

// Auth user returned after login (no password)
export type AuthUser = Omit<User, "passwordHash">;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export type NotificationType =
  | "new_order"
  | "cancelled_order"
  | "low_stock"
  | "new_customer"
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string; // "admin" or user id
  link?: string;
  createdAt: string;
}

// ============================================================
// CATEGORY & BRAND TYPES
// ============================================================

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  isActive: boolean;
  order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  country: string;
  productCount: number;
  isActive: boolean;
  isFeatured: boolean;
  website?: string;
}

// ============================================================
// SETTINGS TYPE
// ============================================================

export interface SiteSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  freeShippingThreshold: number;
  standardShipping: number;
  expressShipping: number;
  governorateShipping: GovernorateShipping[];
  whatsappNumber: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  orderConfirmationEmail: boolean;
  shippingNotificationEmail: boolean;
}

// ============================================================
// INVOICE TYPE
// ============================================================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string | null;
  items: OrderItem[];
  prescription?: PrescriptionData | null;
  prescriptionImage?: string | null;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode: string | null;
  couponDiscount?: number;
  couponType?: "percentage" | "fixed";
  tax: number;
  total: number;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeLogo?: string;
  notes?: string;
}

export interface CouponUsage {
  id: string;
  couponCode: string;
  userId: string;
  userEmail: string;
  userName: string;
  orderId: string;
  orderNumber: string;
  discountAmount: number;
  discountType: "percentage" | "fixed";
  orderTotal: number;
  usedAt: string;
}

// ============================================================
// PENDING REGISTRATION (Email Verification)
// ============================================================

export interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  code: string;
  expiresAt: number;
  createdAt: number;
}
