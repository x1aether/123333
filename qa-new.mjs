const BASE = "http://localhost:3700";
const ADMIN = "eyecare_session=sess_MRKQZSWGRCJBHX";
const pngBytes = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQCbxWyeAAAAAElFTkSuQmCC", "base64");

async function upload(folder) {
  const fd = new FormData();
  fd.append("file", new Blob([pngBytes], { type: "image/png" }), "t.png");
  fd.append("folder", folder);
  const r = await fetch(BASE + "/api/upload", { method: "POST", headers: { Cookie: ADMIN }, body: fd });
  return { s: r.status, d: await r.json().catch(() => null) };
}
async function fetchImg(url) {
  const r = await fetch(BASE + url);
  return { s: r.status, ct: r.headers.get("content-type"), size: (await r.arrayBuffer()).byteLength };
}

(async () => {
  console.log("BASE =", BASE);
  const p = await upload("products");
  const x = await upload("prescriptions");
  console.log("upload prod:", p.s, p.d?.url);
  console.log("upload rx:", x.s, x.d?.url);
  if (p.d?.url) console.log("FETCH prod ->", await fetchImg(p.d.url));
  if (x.d?.url) console.log("FETCH rx   ->", await fetchImg(x.d.url));
  console.log("legacy /images/products/placeholder.jpg ->", await fetchImg("/images/products/placeholder.jpg"));

  // cleanup
  const fs = await import("node:fs");
  const path = await import("node:path");
  for (const u of [p.d?.url, x.d?.url].filter(Boolean)) {
    const fp = path.default.join(process.cwd(), "data", "uploads", u.replace(/^\/uploads\//, ""));
    try { fs.default.unlinkSync(fp); } catch {}
  }
})();
