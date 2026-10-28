"use server";

import { revalidatePath } from "next/cache";
import { getRole } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { todayISO } from "@/lib/date";
import { demoCreateReminder, demoMarkReminderRead } from "@/lib/demo-store";
import { supabaseAdmin } from "@/lib/supabase/server";

export interface ReminderState {
  ok?: boolean;
  error?: string;
  sentAt?: string;
}

/** 管理员：写入一条催作业记录，小婷端会通过 Realtime 收到 */
export async function sendReminderAction(): Promise<ReminderState> {
  if ((await getRole()) !== "admin") {
    return { error: "没有权限哦" };
  }

  if (isDemoMode()) {
    const reminder = demoCreateReminder();
    revalidatePath("/admin");
    return { ok: true, sentAt: reminder.sent_at };
  }

  const sentAt = new Date().toISOString();
  const { error } = await supabaseAdmin()
    .from("reminders")
    .insert({ date: todayISO(), sent_at: sentAt });

  if (error) {
    return { error: `提醒发送失败：${error.message}` };
  }

  revalidatePath("/admin");
  return { ok: true, sentAt };
}

/** 学生：点「知道啦」后把提醒标记为已读 */
export async function markReminderReadAction(id: string): Promise<{ ok: boolean }> {
  if ((await getRole()) !== "student") return { ok: false };

  if (isDemoMode()) {
    demoMarkReminderRead(id);
    revalidatePath("/student");
    return { ok: true };
  }

  const { error } = await supabaseAdmin()
    .from("reminders")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) return { ok: false };

  revalidatePath("/student");
  return { ok: true };
}
