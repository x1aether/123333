# MongoDB Migration - TODO

## Step 1: Environment setup
- [ ] Create `.env` in project root with `'legacy_mongo_removed'` and `MONGODB_DB` (and any other required vars).
- [ ] Ensure code reads all config only from `.env`.

## Step 2: MongoDB data layer
- [ ] Completely refactor `src/lib/db.ts`:
  - [ ] Replace JSON file read/write with MongoDB Atlas async CRUD.
  - [ ] Implement async equivalents of: `readCollection`, `writeCollection`, `readOne`, `findOne`, `insertOne`, `updateOne`, `deleteOne`, `generateId`.
  - [ ] Collection naming compatibility with existing `data/*.json` (use collection names like `users`, `orders`, etc.).
  - [ ] Implement automatic one-time migration: if `data/<collection>.json` exists, import into MongoDB on first run (and avoid re-importing repeatedly).

## Step 3: Update auth + API routes to async
- [ ] Update `src/lib/auth.ts` to use async DB helpers.
- [ ] Update every `src/app/api/**/route.ts` that calls old JSON DB helpers to use async (await).

## Step 4: Remove JSON storage logic
- [ ] Remove/stop using JSON persistence after MongoDB CRUD is verified.
- [ ] Ensure there is no remaining JSON read/write logic used at runtime.

## Step 5: Fix remaining build/runtime issues
- [ ] Fix TypeScript errors caused by async refactor.
- [ ] Fix routing/auth issues (login/logout/me/admin dashboard).
- [ ] Verify translations, responsive design, dark/light mode still work (as applicable).
- [ ] Fix any failing endpoints.

## Step 6: Verification
- [ ] Run `npm run build` and `npm run lint` (if available).
- [ ] Run basic smoke checks for auth and CRUD endpoints (login/register, orders, notifications, settings).
