import { createClient } from "@supabase/supabase-js";
import type { SiteContent } from "./admin-types";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);
export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null;

export async function loadRemoteContent(): Promise<SiteContent | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_content").select("payload").eq("id", "main").maybeSingle();
  if (error) throw error;
  return (data?.payload as SiteContent | undefined) ?? null;
}

export async function saveRemoteContent(content: SiteContent): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("site_content").upsert({ id: "main", payload: content, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function signInAdmin(email: string, password: string) {
  if (!supabase) throw new Error("Supabase n’est pas configuré.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutAdmin() {
  if (supabase) await supabase.auth.signOut();
}

export async function hasAdminSession() {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

export async function uploadAdminImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Le téléversement nécessite Supabase.");
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `catalog/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}
