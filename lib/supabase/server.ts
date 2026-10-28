import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * 仅服务端使用的 Supabase 客户端（service_role）。
 * 所有数据库读写都经过 Server Action / RSC，密钥不会出现在浏览器。
 */
export function supabaseAdmin(): SupabaseClient {
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
