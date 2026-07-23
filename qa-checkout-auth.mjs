// Test checkout auth flow:
// 1. Guest (no cookie) → middleware redirects to /login
// 2. Logged-in customer → /checkout renders (no redirect)
// 3. Logged-in customer → POST /api/orders creates order
const BASE = "http://localhost:3300";

async function test() {
  console.log("=== CHECKOUT AUTH TESTS ===\n");

  // Test 1: Guest accessing /checkout should be redirected by middleware
  console.log("1. GUEST → /checkout");
  const guestRes = await fetch(BASE + "/checkout", { redirect: "manual" });
  console.log("   status:", guestRes.status);
  console.log("   location:", guestRes.headers.get("location"));
  const guestRedirect = guestRes.status === 307 && guestRes.headers.get("location")?.includes("/login");
  console.log("   RESULT:", guestRedirect ? "PASS ✓" : "FAIL ✗");

  // Test 2: Register a fresh customer
  const ts = Date.now();
  const email = `checkouttest_${ts}@test.com`;
  const password = "Test@1234";
  console.log(`\n2. REGISTER customer ${email}`);
  const regRes = await fetch(BASE + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Checkout Test", email, password }),
  });
  const regData = await regRes.json();
  console.log("   register status:", regRes.status, "user:", regData.user?.email);

  // Get session cookie from register response
  const setCookieArr = regRes.headers.getSetCookie?.() || [];
  const sessionCookie = setCookieArr.find(c => c.startsWith("eyecare_session="));
  console.log("   session cookie:", sessionCookie ? "SET" : "MISSING");

  if (!sessionCookie) {
    console.log("   FALLBACK: try login");
    const loginRes = await fetch(BASE + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginSetCookie = loginRes.headers.getSetCookie?.() || [];
    const loginSession = loginSetCookie.find(c => c.startsWith("eyecare_session="));
    if (!loginSession) {
      console.log("   Cannot get session cookie. Aborting.");
      return;
    }
    var cookie = loginSession.split(";")[0];
  } else {
    var cookie = sessionCookie.split(";")[0];
  }
  console.log("   cookie:", cookie.slice(0, 30) + "...");

  // Test 3: Logged-in customer accessing /checkout should NOT be redirected
  console.log("\n3. LOGGED-IN → /checkout");
  const authCheckoutRes = await fetch(BASE + "/checkout", {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  console.log("   status:", authCheckoutRes.status);
  console.log("   location:", authCheckoutRes.headers.get("location"));
  const noRedirect = authCheckoutRes.status === 200;
  console.log("   RESULT:", noRedirect ? "PASS ✓" : "FAIL ✗");

  // Test 4: Logged-in customer placing order
  console.log("\n4. LOGGED-IN → POST /api/orders");
  const orderRes = await fetch(BASE + "/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      customerName: "Checkout Test",
      customerEmail: email,
      customerPhone: "01012345678",
      shippingAddress: {
        firstName: "Checkout",
        lastName: "Test",
        address: "123 Test St",
        city: "Cairo",
        governorate: "Cairo",
        country: "Egypt",
      },
      items: [{ productId: "1", variantId: "v1", productName: "Test", brand: "Test", image: "", frameColor: "", lensColor: "", sku: "", price: 100, quantity: 1 }],
      subtotal: 100,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 100,
      paymentMethod: "cod",
    }),
  });
  const orderData = await orderRes.json();
  console.log("   status:", orderRes.status);
  console.log("   order:", orderData.order?.id || orderData.error);
  const orderCreated = orderRes.status === 200 && orderData.order?.id;
  console.log("   RESULT:", orderCreated ? "PASS ✓" : "FAIL ✗");

  // Test 5: Guest placing order (no cookie) → 401
  console.log("\n5. GUEST → POST /api/orders (no cookie)");
  const guestOrderRes = await fetch(BASE + "/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Guest",
      items: [],
      subtotal: 0,
      total: 0,
    }),
  });
  console.log("   status:", guestOrderRes.status);
  const guestBlocked = guestOrderRes.status === 401;
  console.log("   RESULT:", guestBlocked ? "PASS ✓" : "FAIL ✗");

  console.log("\n=== SUMMARY ===");
  console.log("Guest → /checkout redirect to /login:", guestRedirect ? "✓" : "✗");
  console.log("Auth  → /checkout no redirect:", noRedirect ? "✓" : "✗");
  console.log("Auth  → POST /api/orders creates order:", orderCreated ? "✓" : "✗");
  console.log("Guest → POST /api/orders blocked (401):", guestBlocked ? "✓" : "✗");
}

test().catch(console.error);
