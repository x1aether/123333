/**
 * auth.ts — Authentication helpers
 * Session-based auth using HTTP cookies.
 * Swap-ready: replace readCollection/writeCollection with real DB calls.
 */

import { cookies } from "next/headers";
import { findOneBy, insertOne, deleteOne, readOne, generateId } from "./db";
import type { User, AuthUser, UserRole } from "@/types";

const SESSION_COOKIE = "eyecare_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const CSRF_COOKIE = "eyecare_csrf";

interface StoredUser extends User {
  passwordHash: string;
  password_plain?: string; // legacy field (not used for verification)
}

interface Session {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: string;
  expiresAt: string;
}

// ── Password helpers ─────────────────────────────────────────────────────────
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  // Support legacy "hashed_" prefix for backwards compatibility during migration
  if (storedHash.startsWith("hashed_")) {
    return `hashed_${password}` === storedHash;
  }
  return bcrypt.compareSync(password, storedHash);
}

// ── Password strength validation ─────────────────────────────────────────────
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain an uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain a lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain a number");
  return { valid: errors.length === 0, errors };
}

// ── Input sanitization (XSS protection) ─────────────────────────────────────
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(sanitized[key] as string);
    }
  }
  return sanitized;
}

// ── User lookup ───────────────────────────────────────────────────────────────
export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  return findOneBy<StoredUser>("users", { email: { $regex: new RegExp(`^${email}$`, "i") } });
}

export function stripPassword(user: StoredUser): AuthUser {
  const { passwordHash, password_plain, ...safeUser } = user as StoredUser & { password_plain?: string };
  return safeUser as unknown as AuthUser;
}

// ── CSRF protection ──────────────────────────────────────────────────────────
export async function generateCsrfToken(): Promise<string> {
  const token = generateId("csrf");
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });
  return token;
}

export async function verifyCsrfToken(token?: string): Promise<boolean> {
  if (!token) return false;
  const cookieStore = await cookies();
  const stored = cookieStore.get(CSRF_COOKIE)?.value;
  return stored === token;
}

// ── Security headers ──────────────────────────────────────────────────────────
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(self), camera=(), microphone=()",
  };
}

// ── Session management ────────────────────────────────────────────────────────
export async function createSession(userId: string, role: UserRole): Promise<string> {
  const sessionId = generateId("sess");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000);

  const session: Session = {
    id: sessionId,
    userId,
    role,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // The `sessions` collection has a TTL index on `expiresAt`, so MongoDB
  // will automatically purge expired sessions. No manual cleanup needed.
  await insertOne<Session>("sessions", session);
  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const session = await readOne<Session>("sessions", sessionId);
  if (!session) return null;

  // The TTL index in MongoDB handles automatic deletion of expired sessions.
  // However, a session might be retrieved between when it expires and when
  // the TTL job runs. This check provides an immediate guarantee.
  if (new Date(session.expiresAt) < new Date()) {
    // Optional: trigger deletion immediately instead of waiting for TTL
    // await deleteSession(sessionId);
    return null;
  }
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await deleteOne("sessions", sessionId);
}

// ── Cookie helpers (server-side) ──────────────────────────────────────────────
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromCookie(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getSessionFromCookie();
    if (!session) return null;

    // Use efficient `readOne` instead of fetching all users
    const user = await readOne<StoredUser>("users", session.userId);

    if (!user || !user.isActive || user.isBanned) return null;
    return stripPassword(user);
  } catch (err) {
    // Log error instead of failing silently. This helps debug issues with
    // database connectivity or corrupted session/user data.
    console.error("Error in getCurrentUser:", err);
    return null;
  }
}
