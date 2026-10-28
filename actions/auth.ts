"use server";

import { redirect } from "next/navigation";
import { checkPasscode, clearSession, setSession } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

/** 口令登录：两个口令分别进入管理端 / 学生端 */
export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const code = String(formData.get("passcode") ?? "");
  const role = checkPasscode(code);

  if (!role) {
    return { error: "口令不对哦，再想想～" };
  }

  await setSession(role);
  redirect(role === "admin" ? "/admin" : "/student");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}
