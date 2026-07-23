import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/db";

/*
 * Image upload endpoint.
 *
 * Storage location: /data/uploads/<folder>/<id>.<ext>
 *   - Files are stored OUTSIDE /public so the Next.js static file server
 *     does not cache them at build time. They are served dynamically by
 *     the route handler at /app/uploads/[...path]/route.ts, which reads
 *     from disk on every request. This means uploads are immediately
 *     visible in both development and production without a rebuild.
 *   - Only the relative URL (e.g. "/uploads/products/xxx.jpg") is persisted
 *     in the database — never absolute paths.
 *   - Folders are created automatically on first upload.
 *   - Type and size are validated before writing.
 */

// Uploads live at <repo>/data/uploads so they are served dynamically by the
// route handler at /app/uploads/[...path]/route.ts (reads from disk on every
// request). Storing OUTSIDE /public means newly uploaded files are visible
// immediately in both dev and production without a rebuild.
const UPLOAD_BASE = path.join(process.cwd(), "data", "uploads");

const FOLDERS: Record<string, { adminOnly: boolean }> = {
  products: { adminOnly: true },
  prescriptions: { adminOnly: false },
  banners: { adminOnly: true },
  brands: { adminOnly: true },
  categories: { adminOnly: true },
  logos: { adminOnly: true },
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// Ensure the base upload directory (and any subfolder) exists.
// Called on every upload so missing folders are auto-created.
async function ensureFolder(folder: string) {
  const absDir = path.join(UPLOAD_BASE, folder);
  await fs.mkdir(absDir, { recursive: true });
  return absDir;
}

// POST /api/upload — multipart form-data { file, folder }
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "products";

    const folderConfig = FOLDERS[folder];
    if (!folderConfig) {
      return NextResponse.json(
        { error: `Invalid upload folder '${folder}'. Allowed: ${Object.keys(FOLDERS).join(", ")}` },
        { status: 400 }
      );
    }

    // The `prescriptions` folder is open to guests so they can attach a
    // prescription image during guest checkout. Every other folder requires
    // an authenticated user, and admin-only folders require the admin role.
    if (folder !== "prescriptions") {
      if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (folderConfig.adminOnly && currentUser.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = file as File;
    if (!ALLOWED_TYPES.includes(blob.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, WEBP, GIF or AVIF." },
        { status: 400 }
      );
    }
    if (blob.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const ext = EXT_BY_TYPE[blob.type] || "jpg";
    const filename = `${generateId(folder)}.${ext}`;
    const absDir = await ensureFolder(folder);

    const bytes = Buffer.from(await blob.arrayBuffer());
    await fs.writeFile(path.join(absDir, filename), bytes);

    // Relative URL served by Next.js from /public — forward slashes for web.
    const url = `/uploads/${folder}/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
