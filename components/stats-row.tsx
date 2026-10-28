import type { Stats } from "@/lib/types";
import { Card } from "@/components/ui/card";

/** 三宫格统计：本月完成 / 连续打卡 / 累计打卡 */
export function StatsRow({ stats }: { stats: Stats }) {
  const items = [
    { label: "本月完成", value: stats.monthCompleted, accent: false },
    { label: "连续打卡", value: stats.streak, accent: true },
    { label: "累计打卡", value: stats.totalCompleted, accent: false },
  ];

  return (
    <Card className="grid grid-cols-3 divide-x divide-line/70 px-0 py-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1">
          <p
            className={`tabular text-[23px] font-semibold leading-none ${
              item.accent ? "text-coral-deep" : "text-foreground"
            }`}
          >
            {item.value}
            <span className="ml-0.5 text-2xs font-normal text-muted">天</span>
          </p>
          <p className="text-2xs text-muted">{item.label}</p>
        </div>
      ))}
    </Card>
  );
}
