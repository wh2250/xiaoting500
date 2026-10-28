import Link from "next/link";
import { Camera, CalendarOff, ChevronLeft } from "lucide-react";
import { dateLabel, timeLabel, todayISO } from "@/lib/date";
import type { DayRecord, Role } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PhotoGrid } from "@/components/photo-grid";
import { StatusPill } from "@/components/status-pill";

interface DayDetailViewProps {
  record: DayRecord;
  role: Role;
  /** 管理端时返回日历的路径 */
  backHref: string;
}

/** 共用：某一天的任务 + 照片详情 */
export function DayDetailView({ record, role, backHref }: DayDetailViewProps) {
  const { date, task, submission } = record;
  const isToday = date === todayISO();

  return (
    <main className="page-shell space-y-4 pb-6 pt-3">
      <Link
        href={backHref}
        className="tap inline-flex items-center gap-0.5 text-2xs text-muted hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
        返回日历
      </Link>

      <header>
        <p className="text-2xs font-medium uppercase tracking-[0.22em] text-muted">
          {isToday ? "TODAY" : "ONE DAY"}
        </p>
        <h1 className="mt-1.5 text-[24px] leading-snug">{dateLabel(date)}</h1>
      </header>

      {task ? (
        <TaskCard task={task} submitted={Boolean(submission)} eyebrow="那天的任务" />
      ) : (
        <Card className="animate-fade-up">
          <EmptyState
            icon={<CalendarOff className="h-6 w-6" strokeWidth={1.6} />}
            title="这天没有布置任务"
            description="空白的一天，也算好好休息啦。"
          />
        </Card>
      )}

      {task && (
        <Card className="animate-fade-up">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xs font-medium uppercase tracking-[0.18em] text-muted">
                {role === "admin" ? "她的作业" : "我的提交"}
              </p>
              <h2 className="mt-1.5 text-[17px] font-semibold">作业照片</h2>
            </div>
            <div className="pt-3.5">
              <StatusPill tone={submission ? "done" : "pending"} />
            </div>
          </div>

          {submission ? (
            <>
              <p className="mt-1 text-2xs text-muted">
                {timeLabel(submission.submitted_at)} 提交 · 共 {submission.image_urls.length} 张
              </p>
              <div className="mt-4">
                <PhotoGrid images={submission.image_urls} columns={2} />
              </div>
              {submission.note && (
                <p className="mt-3 rounded-[14px] bg-background px-4 py-3 text-[13px] leading-relaxed text-muted">
                  “{submission.note}”
                </p>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Camera className="h-6 w-6" strokeWidth={1.6} />}
              title={role === "admin" ? "她那天没有交作业" : "那天没有交作业"}
              description="过去的就先过去，今天重新开始就好。"
            />
          )}
        </Card>
      )}
    </main>
  );
}
