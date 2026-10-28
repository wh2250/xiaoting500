import { getMonthRecords, getStats } from "@/lib/data";
import { normalizeMonthKey, todayISO } from "@/lib/date";
import { PageHeader } from "@/components/page-header";
import { CalendarView } from "@/components/calendar-view";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const params = await searchParams;
  const monthKey = normalizeMonthKey(params.m);
  const today = todayISO();

  const [records, stats] = await Promise.all([
    getMonthRecords(monthKey),
    getStats(monthKey),
  ]);

  return (
    <main className="page-shell space-y-4 pb-6 pt-5">
      <PageHeader
        eyebrow="打卡日历"
        title="一起走过的每一天"
        subtitle="点开任意一天，翻到那天的任务和照片。"
      />

      <CalendarView
        monthKey={monthKey}
        records={records}
        stats={stats}
        basePath="/admin"
        today={today}
      />
    </main>
  );
}
