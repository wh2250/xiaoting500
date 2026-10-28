"use server";

import { revalidatePath } from "next/cache";
import { getRole } from "@/lib/auth";
import { isDemoMode, STORAGE_BUCKET } from "@/lib/env";
import { todayISO } from "@/lib/date";
import { demoUpsertSubmission } from "@/lib/demo-store";
import { supabaseAdmin } from "@/lib/supabase/server";

export interface SubmitState {
  ok?: boolean;
  error?: string;
}

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 前端已压缩，8MB 兜底

/** 学生：上传照片 + 备注，按日期覆盖旧记录（重交保留最新一条） */
export async function submitTaskAction(formData: FormData): Promise<SubmitState> {
  if ((await getRole()) !== "student") {
    return { error: "没有权限哦" };
  }

  const date = todayISO();
  const note = String(formData.get("note") ?? "").trim().slice(0, 300) || null;
  const files = formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0)
    .slice(0, MAX_PHOTOS);

  if (files.length === 0) {
    return { error: "至少放一张照片哦" };
  }

  const tooLarge = files.find((file) => file.size > MAX_FILE_SIZE);
  if (tooLarge) {
    return { error: "有张照片太大了，换一张试试" };
  }

  /* ---------- 演示模式：把图片转成 data URL 存到内存 ---------- */
  if (isDemoMode()) {
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
      }),
    );

    demoUpsertSubmission({
      taskId: `demo-task-${date}`,
      date,
      imageUrls,
      note,
    });
    revalidateAll();
    return { ok: true };
  }

  /* ---------- 正式模式：Supabase Storage + 数据库 ---------- */
  const sb = supabaseAdmin();

  const { data: task } = await sb
    .from("tasks")
    .select("id")
    .eq("date", date)
    .maybeSingle();

  if (!task) {
    return { error: "今天还没有布置任务哦" };
  }

  // 重交时先记下旧照片，成功后再删除，避免中间失败丢数据
  const { data: oldRow } = await sb
    .from("submissions")
    .select("image_urls")
    .eq("date", date)
    .maybeSingle();
  const oldPaths: string[] = (oldRow?.image_urls as string[] | undefined) ?? [];

  const uploadedPaths: string[] = [];

  try {
    for (const file of files) {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${date}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await sb.storage
        .from(STORAGE_BUCKET)
        .upload(path, await file.arrayBuffer(), {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);
      uploadedPaths.push(path);
    }

    const { error: dbError } = await sb.from("submissions").upsert(
      {
        task_id: task.id,
        date,
        image_urls: uploadedPaths,
        note,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "date" },
    );

    if (dbError) throw new Error(dbError.message);

    if (oldPaths.length > 0) {
      await sb.storage.from(STORAGE_BUCKET).remove(oldPaths);
    }
  } catch (error) {
    // 上传失败时清理已经传上去的新文件
    if (uploadedPaths.length > 0) {
      await sb.storage.from(STORAGE_BUCKET).remove(uploadedPaths);
    }
    return {
      error: `提交失败：${error instanceof Error ? error.message : "请稍后再试"}`,
    };
  }

  revalidateAll();
  return { ok: true };
}

function revalidateAll() {
  revalidatePath("/student");
  revalidatePath("/admin");
  revalidatePath("/student/calendar");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/history");
}
