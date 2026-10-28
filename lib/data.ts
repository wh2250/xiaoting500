import { supabaseAdmin } from "@/lib/supabase/server";
import { isDemoMode, STORAGE_BUCKET } from "@/lib/env";
import {
  demoGetAllSubmissionDates,
  demoGetDay,
  demoGetRange,
  demoLatestReminder,
  demoLatestUnreadReminder,
} from "@/lib/demo-store";
import { addDays, monthRange, todayISO } from "@/lib/date";
import type { DayRecord, Reminder, Stats, Submission, Task } from "@/lib/types";

/* ------------------------- 行映射 ------------------------- */

type TaskRow = {
  id: string;
  date: string;
  title: string;
  description: string | null;
  subtasks: string[] | null;
  created_by: string | null;
  created_at: string;
};

type SubmissionRow = {
  id: string;
  task_id: string;
  date: string;
  image_urls: string[] | null;
  note: string | null;
  submitted_at: string;
};

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    description: row.description,
    subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

/** 数据库里存的是 Storage 对象路径，读取时批量换成 12 小时有效的签名 URL */
async function signImagePaths(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];

  const direct = paths.every(
    (p) => p.startsWith("data:") || p.startsWith("http") || p.startsWith("/"),
  );
  if (direct) return paths;

  const { data, error } = await supabaseAdmin()
    .storage.from(STORAGE_BUCKET)
    .createSignedUrls(paths, 60 * 60 * 12);

  if (error) {
    console.error("生成签名 URL 失败", error);
    return [];
  }

  return paths.map((path) => data?.find((item) => item.path === path)?.signedUrl ?? "");
}

async function mapSubmission(row: SubmissionRow | null): Promise<Submission | null> {
  if (!row) return null;
  return {
    id: row.id,
    task_id: row.task_id,
    date: row.date,
    image_urls: await signImagePaths(row.image_urls ?? []),
    note: row.note,
    submitted_at: row.submitted_at,
  };
}

async function mapDay(
  date: string,
  task: TaskRow | null,
  submission: SubmissionRow | null,
): Promise<DayRecord> {
  const [mappedTask, mappedSubmission] = await Promise.all([
    Promise.resolve(task ? mapTask(task) : null),
    mapSubmission(submission),
  ]);
  return {
    date,
    task: mappedTask,
    submission: mappedSubmission,
  };
}

/* ------------------------- 查询 ------------------------- */

export async function getDay(date: string): Promise<DayRecord> {
  if (isDemoMode()) return demoGetDay(date);

  const sb = supabaseAdmin();
  const [taskRes, subRes] = await Promise.all([
    sb.from("tasks").select("*").eq("date", date).maybeSingle(),
    sb.from("submissions").select("*").eq("date", date).maybeSingle(),
  ]);

  if (taskRes.error) throw new Error(taskRes.error.message);
  if (subRes.error) throw new Error(subRes.error.message);

  return mapDay(date, taskRes.data as TaskRow | null, subRes.data as SubmissionRow | null);
}

/** 拉取日期区间内的所有任务和提交，按日期升序返回 */
export async function getDayRecords(start: string, end: string): Promise<DayRecord[]> {
  if (isDemoMode()) return demoGetRange(start, end);

  const sb = supabaseAdmin();
  const [taskRes, subRes] = await Promise.all([
    sb.from("tasks").select("*").gte("date", start).lte("date", end),
    sb.from("submissions").select("*").gte("date", start).lte("date", end),
  ]);

  if (taskRes.error) throw new Error(taskRes.error.message);
  if (subRes.error) throw new Error(subRes.error.message);

  const tasks = (taskRes.data ?? []) as TaskRow[];
  const subs = (subRes.data ?? []) as SubmissionRow[];
  const dates = new Set<string>([...tasks.map((t) => t.date), ...subs.map((s) => s.date)]);

  return Promise.all(
    [...dates]
      .sort()
      .map((date) =>
        mapDay(
          date,
          tasks.find((t) => t.date === date) ?? null,
          subs.find((s) => s.date === date) ?? null,
        ),
      ),
  );
}

/** 日历：按月份查询 */
export async function getMonthRecords(monthKey: string): Promise<DayRecord[]> {
  const { start, end } = monthRange(monthKey);
  return getDayRecords(start, end);
}

/** 最近 N 天的记录（含今天），用于管理端历史页 */
export async function getRecentRecords(days = 30): Promise<DayRecord[]> {
  const today = todayISO();
  const records = await getDayRecords(addDays(today, -(days - 1)), today);
  return records.reverse();
}

export async function getStats(monthKey: string): Promise<Stats> {
  let dates: string[];

  if (isDemoMode()) {
    dates = demoGetAllSubmissionDates();
  } else {
    const { data, error } = await supabaseAdmin().from("submissions").select("date");
    if (error) throw new Error(error.message);
    dates = (data ?? []).map((row) => row.date as string);
  }

  const uniqueDates = new Set(dates);
  const today = todayISO();

  return {
    monthCompleted: [...uniqueDates].filter((d) => d.startsWith(monthKey)).length,
    streak: calcStreak(uniqueDates, today),
    totalCompleted: uniqueDates.size,
  };
}

/** 从今天（或昨天）往前数连续提交天数 */
export function calcStreak(completed: Set<string>, today = todayISO()): number {
  let cursor = completed.has(today) ? today : addDays(today, -1);
  if (!completed.has(cursor)) return 0;

  let count = 0;
  while (completed.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export async function getUnreadReminder(): Promise<Reminder | null> {
  if (isDemoMode()) return demoLatestUnreadReminder();

  const { data, error } = await supabaseAdmin()
    .from("reminders")
    .select("*")
    .is("read_at", null)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Reminder | null) ?? null;
}

/** 最近一次催作业时间（管理端显示「上次提醒 19:05」） */
export async function getLatestReminderSentAt(): Promise<string | null> {
  if (isDemoMode()) return demoLatestReminder()?.sent_at ?? null;

  const { data, error } = await supabaseAdmin()
    .from("reminders")
    .select("sent_at")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.sent_at as string | undefined) ?? null;
}
