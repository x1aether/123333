import { NextRequest, NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/types";

interface StoredUser extends User {
  password_plain?: string;
  passwordHash?: string;
}

function safeUser(u: StoredUser): Omit<StoredUser, "password_plain" | "passwordHash"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_plain, passwordHash, ...safe } = u;
  return safe;
}

// GET /api/users — admin only
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await readCollection<StoredUser>("users");
    return NextResponse.json({ users: users.map(safeUser) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/users — update current user profile
export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const users = await readCollection<StoredUser>("users");
    const index = users.findIndex((u) => u.id === currentUser.id);

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allowedUpdates = ["name", "phone", "avatar", "addresses"];
    const updates: Partial<StoredUser> = { updatedAt: new Date().toISOString() };

    for (const key of allowedUpdates) {
      if (key in body) {
        (updates as Record<string, unknown>)[key] = body[key];
      }
    }

    // Password change
    if (body.newPassword && body.currentPassword) {
      const { verifyPassword, hashPassword } = await import("@/lib/auth");
      const user = users[index];
      const isValid = verifyPassword(body.currentPassword, user.passwordHash || "");
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      updates.passwordHash = hashPassword(body.newPassword);
    }

    users[index] = { ...users[index], ...updates };
    const { writeCollection } = await import("@/lib/db");
    await writeCollection("users", users);

    return NextResponse.json({ user: safeUser(users[index]), message: "Profile updated" });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
