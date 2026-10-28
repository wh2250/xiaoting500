import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Role } from "@/lib/types";
import { isDemoMode } from "@/lib/env";

const COOKIE_NAME = "xt_session";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 天

function secret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "xiaoting-500-demo-secret"
  );
}

/** 给角色签名，防止有人手动改 cookie 变成管理员 */
function sign(role: Role): string {
  const mac = createHmac("sha256", secret()).update(role).digest("base64url");
  return `${role}.${mac}`;
}

function verify(value: string): Role | null {
  const [role, mac] = value.split(".");
  if (role !== "admin" && role !== "student") return null;
  if (!mac) return null;
  const expected = createHmac("sha256", secret()).update(role).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return role;
}

/** 校验口令，返回对应角色 */
export function checkPasscode(input: string): Role | null {
  const code = input.trim();
  if (!code) return null;

  const adminCode = process.env.ADMIN_PASSCODE || (isDemoMode() ? "520520" : "");
  const studentCode = process.env.STUDENT_PASSCODE || (isDemoMode() ? "1314520" : "");

  if (adminCode && code === adminCode) return "admin";
  if (studentCode && code === studentCode) return "student";
  return null;
}

export async function getRole(): Promise<Role | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return verify(raw);
}

export async function setSession(role: Role): Promise<void> {
  (await cookies()).set(COOKIE_NAME, sign(role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/** 页面守卫：没登录去登录页，角色不对就回到自己的首页 */
export async function requireRole(role: Role): Promise<Role> {
  const current = await getRole();
  if (!current) redirect("/login");
  if (current !== role) redirect(current === "admin" ? "/admin" : "/student");
  return current;
}

/** 演示模式下登录页可以显示测试口令 */
export function demoPasscodes(): { admin: string; student: string } | null {
  if (!isDemoMode()) return null;
  return {
    admin: process.env.ADMIN_PASSCODE || "520520",
    student: process.env.STUDENT_PASSCODE || "1314520",
  };
}
