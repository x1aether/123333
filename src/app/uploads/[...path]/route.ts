import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

/*
 * Serves uploaded files from <repo>/data/uploads (outside /public) so that
 * files written at runtime by /api/upload are immediately reachable in both
 * development and production without a rebuild.
 *
 * URL shape: /uploads/<folder>/<filename>  ->  data/uploads/<folder>/<filename>
 */

const UPLOAD_BASE = path.join(process.cwd(), "data", "uploads");

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;

    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Resolve and guard against path traversal — the final absolute path must
    // remain inside UPLOAD_BASE.
    const relative = segments.join("/");
    const absPath = path.normalize(path.join(UPLOAD_BASE, relative));
    if (!absPath.startsWith(UPLOAD_BASE + path.sep)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let file: Buffer;
    try {
      file = await fs.readFile(absPath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(absPath).slice(1).toLowerCase();
    const contentType = CONTENT_TYPE_BY_EXT[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Upload serve error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
