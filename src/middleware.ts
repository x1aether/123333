import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter for auth endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 30; // max requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("eyecare_session")?.value;

  // Routes that are always public (no auth required)
  const publicPrefixes = [
    "/login",
    "/register",
    "/shop",
    "/product/",
    "/about",
    "/contact",
    "/order-tracking",
    "/compare",
    "/wishlist",
    "/cart",
    // Guest checkout: unauthenticated users may place orders.
    "/checkout",
    "/api/auth/",
    "/api/orders",
    "/api/products",
    "/api/settings",
    // Public coupon validation for checkout (customers + guests).
    "/api/coupons",
    // Upload endpoint is reachable without a session so guests can attach a
    // prescription image at checkout. The route handler still enforces
    // per-folder authorization (admin-only for product/banner/etc.).
    "/api/upload",
    // Uploaded images (products, prescriptions, banners, etc.) must be
    // publicly reachable — both for the storefront and for invoice/order views.
    "/uploads/",
    // Legacy image paths that still exist in seed data.
    "/images/",
  ];

  // Root path is public
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Rate limiting for auth endpoints
  const authEndpoints = ["/api/auth/login", "/api/auth/register", "/api/auth/send-code", "/api/auth/verify-email"];
  if (authEndpoints.some((ep) => pathname.startsWith(ep))) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    return NextResponse.next();
  }

  // API auth nextauth routes are public
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const isPublic = publicPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (isPublic) {
    return NextResponse.next();
  }

  // Protected routes: /account/*, /checkout, /admin/*
  if (!session) {
    // API routes must respond with a machine-readable 401 instead of a
    // 307 redirect to the HTML login page (which breaks fetch() callers).
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip middleware for Next.js internal static assets.
    // NOTE: Do NOT exclude `uploads` or `images` here — they need to pass
    // through the middleware so the publicPrefixes check can let them
    // through (and so the dynamic route handlers at /uploads/[...path]
    // can serve files that didn't exist at build time).
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
