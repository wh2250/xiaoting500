"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubtaskListProps {
  subtasks: string[];
  /** 已提交时全部显示为已完成 */
  submitted?: boolean;
}

export function SubtaskList({ subtasks, submitted = false }: SubtaskListProps) {
  const [checked, setChecked] = useState<boolean[]>(() => subtasks.map(() => false));

  useEffect(() => {
    setChecked(subtasks.map(() => false));
  }, [subtasks.join("|")]);

  return (
    <ul className="mt-1 divide-y divide-line/70">
      {subtasks.map((text, index) => {
        const isChecked = submitted || checked[index];
        return (
          <li key={`${index}-${text}`}>
            <button
              type="button"
              disabled={submitted}
              aria-pressed={isChecked}
              onClick={() =>
                setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)))
              }
              className="flex w-full items-start gap-3 py-3 text-left disabled:cursor-default"
            >
              <span
                className={cn(
                  "mt-[3px] grid h-[21px] w-[21px] shrink-0 place-items-center rounded-full border transition-all duration-200 ease-out",
                  isChecked
                    ? "border-sage bg-sage text-white"
                    : "border-line bg-white text-transparent",
                )}
              >
                <Check className="h-3 w-3" strokeWidth={3.2} />
              </span>
              <span
                className={cn(
                  "text-[14.5px] leading-relaxed transition-colors duration-200",
                  isChecked ? "text-muted line-through decoration-line" : "text-foreground",
                )}
              >
                {text}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
