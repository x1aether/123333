const BASE = "http://localhost:3700";
const ADMIN = "eyecare_session=sess_MRKQZSWGRCJBHX";

const pngBytes = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQCbxWyeAAAAAElFTkSuQmCC", "base64");

async function upload(folder, cookie) {
  const fd = new FormData();
  fd.append("file", new Blob([pngBytes], { type: "image/png" }), "test.png");
  fd.append("folder", folder);
  const res = await fetch(BASE + "/api/upload", { method: "POST", headers: { Cookie: cookie }, body: fd });
  return { status: res.status, data: await res.json().catch(() => null) };
}
async function fetchImage(url) {
  const res = await fetch(BASE + url);
  return { status: res.status, ct: res.headers.get("content-type"), size: (await res.arrayBuffer()).byteLength };
}
async function apiCall(method, path, body, cookie) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, data: await res.json().catch(() => null) };
}

(async () => {
  console.log("=== PROD TESTS (port 3600) ===");

  // 1. Upload product + prescription images
  const prod = await upload("products", ADMIN);
  console.log("1. PRODUCT upload:", prod.status, prod.data?.url);
  const rx = await upload("prescriptions", ADMIN);
  console.log("2. RX upload:", rx.status, rx.data?.url);

  // 2. Verify both URLs are served as images (not HTML/blank)
  const prodImg = await fetchImage(prod.data.url);
  console.log("3. FETCH prod img:", prodImg, prodImg.ct === "image/png" ? "OK" : "FAIL");
  const rxImg = await fetchImage(rx.data.url);
  console.log("4. FETCH rx img:", rxImg, rxImg.ct === "image/png" ? "OK" : "FAIL");

  // 3. Legacy image path still works
  const legacy = await fetchImage("/images/products/placeholder.jpg");
  console.log("5. LEGACY /images/products/placeholder.jpg:", legacy.status, legacy.ct);

  // 4. Product CRUD with new image path
  const create = await apiCall("POST", "/api/admin/products", {
    name: "PROD Upload Test", nameAr: "اختبار", description: "d", price: 100,
    category: "eyeglasses", brand: "TestBrand",
    images: [prod.data.url],
    stockQuantity: 5, sku: "UPL-" + Date.now(),
  }, ADMIN);
  console.log("6. CREATE product with /uploads/ URL:", create.status, "images:", create.data?.images);

  // 5. Register a new user (no verification step)
  const email = "prodtest_" + Date.now() + "@example.com";
  const reg = await apiCall("POST", "/api/auth/register", { name: "Prod Tester", email, password: "Password123" });
  console.log("7. REGISTER (no verification):", reg.status, "user:", reg.data?.user?.id);

  // 6. Login with the new user
  const login = await apiCall("POST", "/api/auth/login", { email, password: "Password123" });
  console.log("8. LOGIN:", login.status);

  // 7. Cleanup created product
  if (create.status === 201) {
    const del = await apiCall("DELETE", "/api/admin/products/" + create.data.id, null, ADMIN);
    console.log("9. DELETE test product:", del.status);
  }

  // 8. Cleanup uploaded test images
  const fs = await import("node:fs");
  const path = await import("node:path");
  for (const u of [prod.data.url, rx.data.url]) {
    const p = path.default.join(process.cwd(), "data", "uploads", u.replace(/^\/uploads\//, ""));
    try { fs.default.unlinkSync(p); console.log("10. cleaned up", p); } catch {}
  }
})();
