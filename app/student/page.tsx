import { Coffee } from "lucide-react";
import { getDay, getStats } from "@/lib/data";
import { dateLabel, greetingCN, monthKeyOf, todayISO } from "@/lib/date";
import { PageHeader } from "@/components/page-header";
import { TaskCard } from "@/components/task-card";
import { SubmissionSection } from "@/components/submission-section";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";

export default async function StudentTodayPage() {
  const today = todayISO();
  const [day, stats] = await Promise.all([getDay(today), getStats(monthKeyOf(today))]);

  return (
    <main className="page-shell space-y-4 pb-6 pt-5">
      <PageHeader
        eyebrow={dateLabel(today)}
        title={`${greetingCN()}，小婷`}
        subtitle="今天也慢慢来，不用急。"
      />

      {/* 连续打卡 + 500 分目标 */}
      <section className="animate-fade-up rounded-card border border-coral-tint/70 bg-coral-soft/80 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-2xs uppercase tracking-[0.22em] text-[#B2544A]/75">STREAK</p>
            <div className="mt-2 flex items-end gap-1.5">
              <span className="tabular text-[44px] font-semibold leading-none text-[#8E4438]">
                {stats.streak}
              </span>
              <span className="pb-1 text-[13px] text-[#8E4438]/80">天连续打卡</span>
            </div>
            <p className="mt-2 text-[12.5px] text-[#8E4438]/70">
              累计 {stats.totalCompleted} 天 · 本月完成 {stats.monthCompleted} 天
            </p>
          </div>

          <div className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full border border-coral-tint bg-white/70 text-center">
            <div>
              <p className="text-[19px] font-semibold leading-none text-coral-deep">500</p>
              <p className="mt-1 text-2xs text-muted">分目标</p>
            </div>
          </div>
        </div>
      </section>

      {day.task ? (
        <>
          <TaskCard task={day.task} submitted={Boolean(day.submission)} />
          <SubmissionSection existing={day.submission} />
        </>
      ) : (
        <Card className="animate-fade-up">
          <EmptyState
            icon={<Coffee className="h-6 w-6" strokeWidth={1.6} />}
            title="今天还没有任务哦～"
            description="等男朋友布置好，这里就会出现今天的小目标。先喝口水休息一下吧。"
          />
        </Card>
      )}

      <p className="pt-1 text-center text-2xs leading-relaxed text-muted/70">
        500 分是目标，开心才是前提。
      </p>
    </main>
  );
}
