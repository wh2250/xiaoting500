import type { Task } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill";
import { SubtaskList } from "@/components/subtask-list";

interface TaskCardProps {
  task: Task;
  submitted: boolean;
  eyebrow?: string;
}

/** 任务展示卡：标题 + 子任务清单 + 鼓励语 */
export function TaskCard({ task, submitted, eyebrow = "今日任务" }: TaskCardProps) {
  return (
    <Card className="animate-fade-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs font-medium uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-[19px] leading-snug text-foreground">{task.title}</h2>
        </div>
        <div className="pt-4">
          <StatusPill tone={submitted ? "done" : "pending"} />
        </div>
      </div>

      <SubtaskList subtasks={task.subtasks} submitted={submitted} />

      {task.description && (
        <p className="mt-3 rounded-[14px] bg-background px-4 py-3 text-[13px] leading-relaxed text-muted">
          {task.description}
        </p>
      )}
    </Card>
  );
}
