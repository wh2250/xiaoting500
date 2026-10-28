import Link from "next/link";
import { ChevronRight, History as HistoryIcon } from "lucide-react";
import { getRecentRecords } from "@/lib/data";
import { parseISO, WEEKDAYS, weekdayOf } from "@/lib/date";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";

export default async function AdminHistoryPage() {
  const records = (await getRecentRecords(30)).filter((record) => record.task);
  const completedCount = records.filter((record) => record.submission).length;

  return (
    <main className="page-shell space-y-4 pb-6 pt-5">
      <PageHeader
        eyebrow="最近 30 天"
        title="历史记录"
        subtitle={`${records.length} 天有任务 · 完成 ${completedCount} 天`}
      />

      {records.length === 0 ? (
        <Card className="animate-fade-up">
          <EmptyState
            icon={<HistoryIcon className="h-6 w-6" strokeWidth={1.6} />}
            title="还没有历史记录"
            description="从今天开始布置第一份任务吧。"
          />
        </Card>
      ) : (
        <Card className="animate-fade-up divide-y divide-line/60 overflow-hidden p-0">
          {records.map((record) => {
            const { d, m } = parseISO(record.date);
            const submission = record.submission;
            return (
              <Link
                key={record.date}
                href={`/admin/day/${record.date}`}
                className="tap flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-background/60"
              >
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[13px] bg-background">
                  <span className="tabular text-[15px] font-semibold leading-none">{d}</span>
                  <span className="mt-0.5 text-[10px] text-muted">{m}月</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-foreground">
                    {record.task?.title}
                  </p>
                  <p className="mt-0.5 text-2xs text-muted">
                    {WEEKDAYS[weekdayOf(record.date)]} · {record.task?.subtasks.length} 项 ·{" "}
                    {submission ? `${submission.image_urls.length} 张照片` : "未提交"}
                  </p>
                </div>

                <StatusPill tone={submission ? "done" : "pending"} />
                <ChevronRight className="h-4 w-4 shrink-0 text-line" strokeWidth={2} />
              </Link>
            );
          })}
        </Card>
      )}

      <p className="pt-1 text-center text-2xs text-muted/70">
        再往前的时间线，就先留在日历里吧。
      </p>
    </main>
  );
}
