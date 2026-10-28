export type Role = "admin" | "student";

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar_url: string | null;
}

export interface Task {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  /** 鼓励语 / 补充说明 */
  description: string | null;
  /** 子任务清单 */
  subtasks: string[];
  created_by: string | null;
  created_at: string;
}

export interface Submission {
  id: string;
  task_id: string;
  date: string;
  /** 读取时已换成可直接展示的签名 URL */
  image_urls: string[];
  note: string | null;
  submitted_at: string;
}

export interface Reminder {
  id: string;
  date: string;
  sent_at: string;
  read_at: string | null;
}

export interface DayRecord {
  date: string;
  task: Task | null;
  submission: Submission | null;
}

export interface Stats {
  /** 本月完成天数 */
  monthCompleted: number;
  /** 连续打卡天数 */
  streak: number;
  /** 累计完成天数 */
  totalCompleted: number;
}

export type DayStatus = "empty" | "pending" | "done";
