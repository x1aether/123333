import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  createSession,
  setSessionCookie,
  stripPassword,
  hashPassword,
} from "@/lib/auth";
import { insertOne, generateId } from "@/lib/db";
import type { User } from "@/types";

interface StoredUser extends User {
  passwordHash: string;
  password_plain?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newUser: StoredUser = {
      id: generateId("user"),
      name,
      email,
      passwordHash: hashPassword(password),
      // Legacy field kept optional; not used for verification
      password_plain: undefined,
      role: "customer",
      avatar: "/images/avatars/default.jpg",
      phone: phone || "",
      createdAt: now,
      updatedAt: now,
      isActive: true,
      addresses: [],
    };

    await insertOne("users", newUser);

    const sessionId = await createSession(newUser.id, newUser.role);
    await setSessionCookie(sessionId);

    return NextResponse.json({
      user: stripPassword(newUser),
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
