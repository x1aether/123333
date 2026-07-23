import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, hashPassword, createSession, setSessionCookie, stripPassword } from "@/lib/auth";
import { insertOne, generateId } from "@/lib/db";
import { getPendingCode, deletePendingCode } from "@/lib/pendingCodes";
import type { User } from "@/types";

interface StoredUser extends User {
  passwordHash: string;
  password_plain?: string;
}

// POST /api/auth/verify-email — verify code and create account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const pending = await getPendingCode(email);

    if (!pending) {
      return NextResponse.json(
        { error: "No verification request found. Please request a new code." },
        { status: 400 }
      );
    }

    if (Date.now() > pending.expiresAt) {
      await deletePendingCode(email);
      return NextResponse.json(
        { error: "Code expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (pending.code !== code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Code verified — create account
    const userData = JSON.parse(pending.data);
    await deletePendingCode(email);

    // Check if email already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const passwordHash = userData.password
      ? hashPassword(userData.password)
      : hashPassword(Math.random().toString(36).slice(-10)); // Random password for OAuth

    const newUser: StoredUser = {
      id: generateId("user"),
      name: userData.name || email.split("@")[0],
      email: email,
      passwordHash,
      password_plain: undefined,
      role: "customer",
      avatar: "/images/avatars/default.jpg",
      phone: userData.phone || "",
      createdAt: now,
      updatedAt: now,
      isActive: true,
      addresses: [],
    };

    await insertOne("users", newUser);

    // Create session
    const sessionId = await createSession(newUser.id, newUser.role);
    await setSessionCookie(sessionId);

    return NextResponse.json({
      user: stripPassword(newUser),
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
