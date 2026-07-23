
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

type AnyDoc = Record<string, any>;

export async function readCollection<T extends AnyDoc>(collection: string): Promise<T[]> {
  const { data, error } = await supabase.from(collection).select('*');
  if (error) throw error;
  return (data || []) as T[];
}

// Added readOne to fix build errors in auth.ts and serverProducts.ts
export async function readOne<T extends AnyDoc>(collection: string, query: Record<string, any>): Promise<T | null> {
  return findOneBy<T>(collection, query);
}

export async function writeCollection<T extends AnyDoc>(collection: string, items: T[]): Promise<void> {
  const { error } = await supabase.from(collection).upsert(items as any);
  if (error) throw error;
}

export async function findMany<T extends AnyDoc>(
  collection: string,
  query: Record<string, any> = {}
): Promise<T[]> {
  let request = supabase.from(collection).select('*');
  for (const [key, value] of Object.entries(query)) {
    request = request.eq(key, value);
  }
  const { data, error } = await request;
  if (error) throw error;
  return (data || []) as T[];
}

export async function findOneBy<T extends AnyDoc>(
  collection: string,
  query: Record<string, any>
): Promise<T | null> {
  let request = supabase.from(collection).select('*').limit(1);
  for (const [key, value] of Object.entries(query)) {
    request = request.eq(key, value);
  }
  const { data, error } = await request.single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as T | null;
}

export async function insertOne<T extends { id: string } & AnyDoc>(
  collection: string,
  item: T
): Promise<T> {
  const { error } = await supabase.from(collection).upsert(item as any);
  if (error) throw error;
  return item;
}

export async function updateOne<T extends { id: string } & AnyDoc>(
  collection: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const { data, error } = await supabase
    .from(collection)
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as T | null;
}

// Added generic type <T> to deleteOne to fix Admin API type errors
export async function deleteOne<T = any>(
  collection: string,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from(collection).delete().eq('id', id);
  return !error;
}

export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}
