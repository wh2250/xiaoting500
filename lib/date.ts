/**
 * 日期工具：全部按「北京时间」计算，避免 Vercel（UTC）和手机端日期不一致。
 */

const TZ = "Asia/Shanghai";

export const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/** 今天的 YYYY-MM-DD（北京时间） */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseISO(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { y, m, d } = parseISO(value);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function weekdayOf(date: string): number {
  const { y, m, d } = parseISO(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** 10月28日 · 周二 */
export function dateLabel(date: string): string {
  const { m, d } = parseISO(date);
  return `${m}月${d}日 · ${WEEKDAYS[weekdayOf(date)]}`;
}

/** 10/28 */
export function shortDate(date: string): string {
  const { m, d } = parseISO(date);
  return `${m}/${d}`;
}

export function addDays(date: string, days: number): string {
  const { y, m, d } = parseISO(date);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** 月份 key：2026-10 */
export function monthKeyOf(date: string): string {
  return date.slice(0, 7);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
  return dt.toISOString().slice(0, 7);
}

/** 某月的第一天 / 最后一天 */
export function monthRange(monthKey: string): { start: string; end: string } {
  const [y, m] = monthKey.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { start: `${monthKey}-01`, end: `${monthKey}-${String(last).padStart(2, "0")}` };
}

export function monthTitle(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${y} 年 ${m} 月`;
}

export function currentMonthKey(): string {
  return monthKeyOf(todayISO());
}

/** 校验 URL 里的 ?m=2026-10，不合法就回到本月 */
export function normalizeMonthKey(value?: string | null): string {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const month = Number(value.slice(5));
    if (month >= 1 && month <= 12) return value;
  }
  return currentMonthKey();
}

/**
 * 月视图格子：以周一为每行第一天，前面补 null 占位。
 * 返回的数组长度是 7 的整数倍。
 */
export function calendarCells(monthKey: string): (string | null)[] {
  const { start } = monthRange(monthKey);
  const { y, m } = parseISO(start);
  const firstWeekday = weekdayOf(start); // 周日 = 0
  const lead = (firstWeekday + 6) % 7; // 转成周一为 0
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${monthKey}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** 按北京时间打招呼 */
export function greetingCN(now: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );
  if (hour < 6) return "夜深了";
  if (hour < 11) return "早上好";
  if (hour < 13) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

/** 提交时间显示：21:35 */
export function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** 距离今天的天数文案 */
export function friendlyDate(date: string): string {
  const today = todayISO();
  if (date === today) return "今天";
  if (date === addDays(today, -1)) return "昨天";
  return dateLabel(date);
}
