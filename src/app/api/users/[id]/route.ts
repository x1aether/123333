import { NextRequest, NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/db";
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

// GET /api/users/[id] — get user by id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    // Users can view their own profile, admins can view any
    if (currentUser?.role !== "admin" && currentUser?.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await readCollection<StoredUser>("users");
    const user = users.find((u) => u.id === id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: safeUser(user) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/users/[id] — update user
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Users can update their own profile, admins can update any
    if (currentUser.role !== "admin" && currentUser.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const users = await readCollection<StoredUser>("users");
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allowedUpdates = currentUser.role === "admin"
      ? ["name", "email", "phone", "role", "isActive", "addresses", "avatar"]
      : ["name", "phone", "avatar", "addresses"];

    const updates: Partial<StoredUser> = { updatedAt: new Date().toISOString() };

    for (const key of allowedUpdates) {
      if (key in body) {
        (updates as Record<string, unknown>)[key] = body[key];
      }
    }

    // Password change for self
    if (body.newPassword && body.currentPassword && currentUser.id === id) {
      const { verifyPassword, hashPassword } = await import("@/lib/auth");
      const user = users[index];
      if (!verifyPassword(body.currentPassword, user.passwordHash || "")) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      updates.passwordHash = hashPassword(body.newPassword);
    }

    // Admin password reset
    if (body.newPassword && currentUser.role === "admin") {
      const { hashPassword } = await import("@/lib/auth");
      updates.passwordHash = hashPassword(body.newPassword);
    }

    users[index] = { ...users[index], ...updates };
    await writeCollection("users", users);

    return NextResponse.json({ user: safeUser(users[index]), message: "Profile updated" });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/users/[id] — admin deletes user
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (id === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const users = await readCollection<StoredUser>("users");
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await writeCollection("users", filtered);
    return NextResponse.json({ message: "User deleted" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
