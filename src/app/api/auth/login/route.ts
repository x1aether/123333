import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  verifyPassword,
  createSession,
  setSessionCookie,
  stripPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // req.json() throws on empty/invalid bodies; parse defensively
    const raw = await req.text();
    if (!raw || !raw.trim()) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const body = parsed as Partial<{ email: unknown; password: unknown }>;
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";

    // Debug presence (never log password value)
    // Removed debug logging for production

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been disabled. Contact support." },
        { status: 403 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: user.banReason ? `Your account has been banned: ${user.banReason}` : "Your account has been banned. Contact support." },
        { status: 403 }
      );
    }

    // Verify password using ORIGINAL password only (hash verification internal)
    const isValid = verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionId = await createSession(user.id, user.role);
    await setSessionCookie(sessionId);

    return NextResponse.json({
      user: stripPassword(user),
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
