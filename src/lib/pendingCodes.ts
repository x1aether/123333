import { readCollection, writeCollection } from "@/lib/db";

// DB-backed pending verification codes so codes survive server restarts and
// work correctly in multi-instance / production deployments (in-memory Maps
// are lost on restart and are not shared between serverless instances).

const COLLECTION = "pending_codes";

export interface PendingCode {
  id: string; // lowercased email is used as the id
  code: string;
  expiresAt: number;
  data: string;
}

// Remove expired entries to keep the collection small.
async function prune(list: PendingCode[]): Promise<PendingCode[]> {
  const now = Date.now();
  const valid = list.filter((p) => p.expiresAt > now);
  if (valid.length !== list.length) {
    await writeCollection<PendingCode>(COLLECTION, valid);
  }
  return valid;
}

export async function setPendingCode(
  email: string,
  entry: { code: string; expiresAt: number; data: string }
): Promise<void> {
  const key = email.toLowerCase();
  const list = await prune(await readCollection<PendingCode>(COLLECTION));
  const filtered = list.filter((p) => p.id !== key);
  filtered.push({ id: key, ...entry });
  await writeCollection<PendingCode>(COLLECTION, filtered);
}

export async function getPendingCode(email: string): Promise<PendingCode | null> {
  const key = email.toLowerCase();
  const list = await prune(await readCollection<PendingCode>(COLLECTION));
  return list.find((p) => p.id === key) ?? null;
}

export async function deletePendingCode(email: string): Promise<void> {
  const key = email.toLowerCase();
  const list = await readCollection<PendingCode>(COLLECTION);
  const filtered = list.filter((p) => p.id !== key);
  if (filtered.length !== list.length) {
    await writeCollection<PendingCode>(COLLECTION, filtered);
  }
}
