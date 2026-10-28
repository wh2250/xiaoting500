import type { DayRecord, Reminder, Submission, Task } from "@/lib/types";
import { addDays, todayISO } from "@/lib/date";

/**
 * 演示模式的「内存数据库」。
 * 只在没有配置 Supabase 环境变量时启用，用于本地预览界面 / 跑通流程，
 * 数据存在进程内存里，重启后会重置。正式使用请配置 Supabase。
 */

interface DemoDB {
  tasks: Task[];
  submissions: Submission[];
  reminders: Reminder[];
}

const globalRef = globalThis as unknown as { __xtDemoDb?: DemoDB };

const DEMO_IMAGES = ["/demo/note-1.jpg", "/demo/note-2.jpg", "/demo/note-3.jpg"];

function seed(): DemoDB {
  const today = todayISO();
  const tasks: Task[] = [];
  const submissions: Submission[] = [];

  // 今天：已布置、未提交
  tasks.push({
    id: "task-today",
    date: today,
    title: "今日英语 · 稳稳向前",
    description: "今天状态好的话就多做一点，累了也没关系，先把单词拿下～",
    subtasks: ["背单词 50 个", "精读阅读 1 篇", "听力 20 分钟"],
    created_by: "admin",
    created_at: `${today}T09:00:00+08:00`,
  });

  // 过去 18 天：大部分已完成，故意留几天没布置 / 没提交
  const skippedTask = new Set([10, 15]);
  const skippedSubmit = new Set([9, 14]);
  const templates: [string, string[]][] = [
    ["阅读长难句", ["复习昨日单词", "长难句 10 句", "错题整理"]],
    ["听力 + 跟读", ["听力精听 1 篇", "跟读 15 分钟"]],
    ["单词回炉", ["艾宾浩斯复习 80 个", "新词 30 个"]],
    ["写作小练习", ["仿写 1 段", "整理 3 个好句型"]],
  ];

  for (let i = 1; i <= 18; i++) {
    if (skippedTask.has(i)) continue;
    const date = addDays(today, -i);
    const [title, subtasks] = templates[i % templates.length];
    tasks.push({
      id: `task-${date}`,
      date,
      title,
      description: i % 3 === 0 ? "保持节奏就好，不用追求完美。" : null,
      subtasks,
      created_by: "admin",
      created_at: `${date}T08:30:00+08:00`,
    });

    if (skippedSubmit.has(i)) continue;
    const imageCount = i % 3 === 0 ? 2 : 1;
    submissions.push({
      id: `sub-${date}`,
      task_id: `task-${date}`,
      date,
      image_urls: DEMO_IMAGES.slice(0, imageCount).map(
        (src, idx) => `${src}?v=${(i + idx) % 3}`,
      ),
      note: i % 4 === 0 ? "今天阅读错得有点多，明天再复盘一下。" : null,
      submitted_at: `${date}T21:${String(10 + (i % 40)).padStart(2, "0")}:00+08:00`,
    });
  }

  const reminders: Reminder[] = [
    {
      id: "reminder-1",
      date: today,
      sent_at: `${today}T19:05:00+08:00`,
      read_at: null,
    },
  ];

  return { tasks, submissions, reminders };
}

export function demoDb(): DemoDB {
  if (!globalRef.__xtDemoDb) globalRef.__xtDemoDb = seed();
  return globalRef.__xtDemoDb;
}

export function demoGetDay(date: string): DayRecord {
  const db = demoDb();
  return {
    date,
    task: db.tasks.find((t) => t.date === date) ?? null,
    submission: db.submissions.find((s) => s.date === date) ?? null,
  };
}

export function demoGetRange(start: string, end: string): DayRecord[] {
  const db = demoDb();
  const dates = new Set<string>();
  db.tasks.forEach((t) => t.date >= start && t.date <= end && dates.add(t.date));
  db.submissions.forEach((s) => s.date >= start && s.date <= end && dates.add(s.date));
  return [...dates].sort().map((date) => demoGetDay(date));
}

export function demoGetAllSubmissionDates(): string[] {
  return demoDb().submissions.map((s) => s.date).sort();
}

export function demoUpsertTask(input: {
  date: string;
  title: string;
  description: string | null;
  subtasks: string[];
}): Task {
  const db = demoDb();
  const existing = db.tasks.find((t) => t.date === input.date);
  if (existing) {
    Object.assign(existing, {
      title: input.title,
      description: input.description,
      subtasks: input.subtasks,
    });
    return existing;
  }
  const task: Task = {
    id: `task-${input.date}-${Date.now()}`,
    date: input.date,
    title: input.title,
    description: input.description,
    subtasks: input.subtasks,
    created_by: "admin",
    created_at: new Date().toISOString(),
  };
  db.tasks.push(task);
  return task;
}

export function demoUpsertSubmission(input: {
  taskId: string;
  date: string;
  imageUrls: string[];
  note: string | null;
}): Submission {
  const db = demoDb();
  const existing = db.submissions.find((s) => s.date === input.date);
  const submission: Submission = {
    id: existing?.id ?? `sub-${input.date}-${Date.now()}`,
    task_id: input.taskId,
    date: input.date,
    image_urls: input.imageUrls,
    note: input.note,
    submitted_at: new Date().toISOString(),
  };
  if (existing) {
    Object.assign(existing, submission);
  } else {
    db.submissions.push(submission);
  }
  return submission;
}

export function demoLatestUnreadReminder(): Reminder | null {
  const list = demoDb()
    .reminders.filter((r) => !r.read_at)
    .sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  return list[0] ?? null;
}

export function demoLatestReminder(): Reminder | null {
  const list = [...demoDb().reminders].sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  return list[0] ?? null;
}

export function demoCreateReminder(): Reminder {
  const db = demoDb();
  const reminder: Reminder = {
    id: `reminder-${Date.now()}`,
    date: todayISO(),
    sent_at: new Date().toISOString(),
    read_at: null,
  };
  db.reminders.push(reminder);
  return reminder;
}

export function demoMarkReminderRead(id: string): void {
  const target = demoDb().reminders.find((r) => r.id === id);
  if (target && !target.read_at) target.read_at = new Date().toISOString();
}
