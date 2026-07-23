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

// GET /api/admin/users — admin only, full user list
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

// POST /api/admin/users — admin creates user
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const users = await readCollection<StoredUser>("users");
    const exists = users.find(
      (u) => u.email.toLowerCase() === body.email.toLowerCase()
    );
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const { hashPassword } = await import("@/lib/auth");
    const { generateId } = await import("@/lib/db");
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: generateId("user"),
      name: body.name,
      email: body.email,
      passwordHash: hashPassword(body.password),
      role: body.role || "customer",
      phone: body.phone || "",
      avatar: "/images/avatars/default.jpg",
      createdAt: now,
      updatedAt: now,
      isActive: body.isActive !== false,
      addresses: body.addresses || [],
    };

    users.push(newUser);
    await writeCollection("users", users);

    return NextResponse.json({ user: safeUser(newUser), message: "User created" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/users — admin updates user
export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const users = await readCollection<StoredUser>("users");
    const index = users.findIndex((u) => u.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allowedUpdates = ["name", "email", "phone", "role", "isActive", "isBanned", "banReason", "addresses"];
    const updates: Partial<StoredUser> = { updatedAt: new Date().toISOString() };

    for (const key of allowedUpdates) {
      if (key in body) {
        (updates as Record<string, unknown>)[key] = body[key];
      }
    }

    // Password reset
    if (body.newPassword) {
      const { hashPassword } = await import("@/lib/auth");
      updates.passwordHash = hashPassword(body.newPassword);
    }

    users[index] = { ...users[index], ...updates };
    await writeCollection("users", users);

    return NextResponse.json({ user: safeUser(users[index]), message: "User updated" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users — admin deletes user
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
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
