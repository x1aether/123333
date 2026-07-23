import { NextResponse } from "next/server";
import { getSessionFromCookie, deleteSession, clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSessionFromCookie();
    if (session) {
      deleteSession(session.id);
    }
    await clearSessionCookie();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
