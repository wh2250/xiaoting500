import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { calendarCells, dateLabel, monthTitle, parseISO, shiftMonth } from "@/lib/date";
import type { DayRecord, Stats } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { StatsRow } from "@/components/stats-row";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  monthKey: string;
  records: DayRecord[];
  stats: Stats;
  /** /student 或 /admin */
  basePath: string;
  today: string;
  /** 是否允许翻到未来的月份 */
  allowFuture?: boolean;
}

const WEEKDAY_HEADER = ["一", "二", "三", "四", "五", "六", "日"];

export function CalendarView({
  monthKey,
  records,
  stats,
  basePath,
  today,
  allowFuture = true,
}: CalendarViewProps) {
  const cells = calendarCells(monthKey);
  const recordMap = new Map(records.map((record) => [record.date, record]));
  const currentMonth = today.slice(0, 7);

  return (
    <div className="space-y-4">
      <StatsRow stats={stats} />

      <Card className="animate-fade-up">
        <div className="flex items-center justify-between">
          <Link
            href={`${basePath}/calendar?m=${shiftMonth(monthKey, -1)}`}
            aria-label="上个月"
            className="tap grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-background hover:text-foreground"
          >
            <ChevronLeft className="h-[18px] w-[18px]" />
          </Link>

          <p className="text-[15px] font-semibold tracking-wide">{monthTitle(monthKey)}</p>

          {allowFuture || monthKey < currentMonth ? (
            <Link
              href={`${basePath}/calendar?m=${shiftMonth(monthKey, 1)}`}
              aria-label="下个月"
              className="tap grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-background hover:text-foreground"
            >
              <ChevronRight className="h-[18px] w-[18px]" />
            </Link>
          ) : (
            <span className="grid h-9 w-9 place-items-center text-line">
              <ChevronRight className="h-[18px] w-[18px]" />
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {WEEKDAY_HEADER.map((day) => (
            <div key={day} className="pb-1 text-center text-2xs text-muted/70">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date, index) => {
            if (!date) return <div key={`blank-${index}`} className="aspect-square" />;

            const record = recordMap.get(date);
            const status = record?.submission
              ? "done"
              : record?.task
                ? "pending"
                : "empty";
            const isToday = date === today;
            const { d } = parseISO(date);

            const content = (
              <div
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[13px] text-[13px] transition-colors duration-200",
                  status === "done" && "bg-[#E7F2EA] text-sage-deep",
                  status === "pending" && "bg-butter-soft text-butter-deep",
                  status === "empty" && "text-muted/45",
                  isToday && "ring-1 ring-coral/45",
                  record?.task && "hover:brightness-[0.98]",
                )}
              >
                <span className={cn("tabular leading-none", isToday && "font-semibold")}>
                  {d}
                </span>
                {status === "done" && <Check className="h-3 w-3" strokeWidth={3} />}
                {status === "pending" && (
                  <span className="h-1 w-1 rounded-full bg-butter" />
                )}
              </div>
            );

            return record?.task ? (
              <Link
                key={date}
                href={`${basePath}/day/${date}`}
                aria-label={`${dateLabel(date)} ${
                  status === "done" ? "已完成" : "待提交"
                }`}
                className="tap block"
              >
                {content}
              </Link>
            ) : (
              <div key={date} aria-label={`${dateLabel(date)} 未布置`}>
                {content}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-line/60 pt-3.5">
          <Legend className="bg-background" label="未布置" />
          <Legend className="bg-butter-soft" label="待提交" />
          <Legend className="bg-[#E7F2EA]" label="已完成" />
        </div>
      </Card>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-2xs text-muted">
      <span className={cn("h-2.5 w-2.5 rounded-[4px] border border-line/60", className)} />
      {label}
    </span>
  );
}
