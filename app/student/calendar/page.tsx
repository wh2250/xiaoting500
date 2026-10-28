import { getMonthRecords, getStats } from "@/lib/data";
import { normalizeMonthKey, todayISO } from "@/lib/date";
import { PageHeader } from "@/components/page-header";
import { CalendarView } from "@/components/calendar-view";

export default async function StudentCalendarPage({
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
        title="每一天都算数"
        subtitle="点开绿色的日子，看看那天的作业。"
      />

      <CalendarView
        monthKey={monthKey}
        records={records}
        stats={stats}
        basePath="/student"
        today={today}
        allowFuture={false}
      />
    </main>
  );
}
