/**
 * 环境变量统一入口。
 * 如果没配置 Supabase，就自动进入「演示模式」，方便本地先看界面。
 * 线上部署时请务必配置真实的环境变量。
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "submissions";

/**
 * 只有在「本地开发 + 没有配置 Supabase」时才进入演示模式。
 * 线上（production）必须配置好 Supabase，避免误把演示数据当成真实数据。
 */
export function isDemoMode(): boolean {
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) return false;
  return process.env.NODE_ENV !== "production";
}
