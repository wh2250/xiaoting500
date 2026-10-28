import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "done" | "pending" | "empty";

/** 状态小胶囊：已完成 / 待提交 / 未布置 */
export function StatusPill({ tone }: { tone: Tone }) {
  const map = {
    done: { label: "已完成", className: "bg-sage-soft text-sage-deep", dot: "bg-sage" },
    pending: { label: "待提交", className: "bg-butter-soft text-butter-deep", dot: "bg-butter" },
    empty: { label: "未布置", className: "bg-background text-muted", dot: "bg-line" },
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-2xs font-medium",
        map.className,
      )}
    >
      {tone === "done" ? (
        <Check className="h-3 w-3" strokeWidth={2.5} />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} />
      )}
      {map.label}
    </span>
  );
}
