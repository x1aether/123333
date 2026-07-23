import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readCollection, writeCollection } from "@/lib/db";
import type { SiteSettings } from "@/types";

// GET /api/admin/settings — admin reads current settings
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await readCollection<SiteSettings>("settings");
    // readCollection returns an array; fall back to default
    const first = Array.isArray(settings) ? settings[0] : (settings as SiteSettings | undefined);

    return NextResponse.json({ settings: first || null });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/settings — admin updates settings
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    // Persist in the existing JSON DB collection `settings`
    // Keep as a single object (first element) for compatibility with existing reads.
    await writeCollection("settings", [body]);

    return NextResponse.json({ message: "Settings saved", settings: body });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
