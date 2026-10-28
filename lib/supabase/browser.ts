import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * 浏览器端只读客户端（anon key），仅用于订阅 reminders 表的 Realtime 事件。
 * 数据库 RLS 只允许 anon 读取 reminders，照片 bucket 是私有的。
 * 没配置时返回 null，页面自动退化为「刷新时检查未读提醒」。
 */
export function supabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anonKey) return null;

  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
