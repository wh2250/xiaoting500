"use server";

import { revalidatePath } from "next/cache";
import { getRole } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { isValidISODate } from "@/lib/date";
import { demoUpsertTask } from "@/lib/demo-store";
import { supabaseAdmin } from "@/lib/supabase/server";

const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";

export interface TaskFormState {
  ok?: boolean;
  error?: string;
}

/** 管理员：新建或更新某一天的任务（按 date upsert） */
export async function saveTaskAction(
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  if ((await getRole()) !== "admin") {
    return { error: "没有权限哦" };
  }

  const date = String(formData.get("date") ?? "");
  if (!isValidISODate(date)) {
    return { error: "日期不正确" };
  }

  const title = String(formData.get("title") ?? "").trim().slice(0, 60) || "今日英语任务";
  const description = String(formData.get("description") ?? "").trim().slice(0, 200) || null;
  const subtasks = formData
    .getAll("subtasks")
    .map((item) => String(item).trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 12);

  if (subtasks.length === 0) {
    return { error: "至少写一条子任务哦" };
  }

  if (isDemoMode()) {
    demoUpsertTask({ date, title, description, subtasks });
    revalidateAll();
    return { ok: true };
  }

  const { error } = await supabaseAdmin()
    .from("tasks")
    .upsert(
      { date, title, description, subtasks, created_by: ADMIN_USER_ID },
      { onConflict: "date" },
    );

  if (error) {
    return { error: `发布失败：${error.message}` };
  }

  revalidateAll();
  return { ok: true };
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/student");
  revalidatePath("/admin/calendar");
  revalidatePath("/student/calendar");
  revalidatePath("/admin/history");
}
