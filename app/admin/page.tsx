import { Camera } from "lucide-react";
import { getDay, getLatestReminderSentAt } from "@/lib/data";
import { dateLabel, timeLabel, todayISO } from "@/lib/date";
import { PageHeader } from "@/components/page-header";
import { TaskEditor } from "@/components/task-editor";
import { ReminderButton } from "@/components/reminder-button";
import { PhotoGrid } from "@/components/photo-grid";
import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
import { Card } from "@/components/ui/card";

export default async function AdminTodayPage() {
  const today = todayISO();
  const [day, lastReminder] = await Promise.all([
    getDay(today),
    getLatestReminderSentAt(),
  ]);

  const submission = day.submission;

  return (
    <main className="page-shell space-y-4 pb-6 pt-5">
      <PageHeader
        eyebrow={`ADMIN · ${dateLabel(today)}`}
        title="今天也要好好陪她"
        subtitle="布置好作业，剩下的交给小婷。"
      />

      <TaskEditor date={today} dateText={dateLabel(today)} task={day.task} />

      <Card className="animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xs font-medium uppercase tracking-[0.18em] text-muted">
              她的作业
            </p>
            <h2 className="mt-1.5 text-[17px] font-semibold">今天的照片</h2>
          </div>
          <div className="pt-3.5">
            <StatusPill tone={submission ? "done" : day.task ? "pending" : "empty"} />
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
            title={day.task ? "小婷还没有交作业" : "还没有布置今天的任务"}
            description={
              day.task
                ? "等她拍好照片上传，这里就会自动出现。"
                : "先把上面的任务发布出去，她那边就能看到啦。"
            }
          />
        )}
      </Card>

      <ReminderButton lastSentAt={lastReminder} />
    </main>
  );
}
