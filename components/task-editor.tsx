"use client";

import { useActionState, useRef, useState } from "react";
import { Check, Loader2, Plus, Send, X } from "lucide-react";
import { saveTaskAction, type TaskFormState } from "@/actions/tasks";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TaskEditorProps {
  date: string;
  dateText: string;
  task: Task | null;
}

interface Row {
  key: string;
  value: string;
}

/** 管理端：编辑并发布今天的一条任务（内部含多条子任务） */
export function TaskEditor({ date, dateText, task }: TaskEditorProps) {
  const [state, formAction, isPending] = useActionState<TaskFormState, FormData>(
    saveTaskAction,
    {},
  );

  const [rows, setRows] = useState<Row[]>(() => {
    const initial = task?.subtasks?.length ? task.subtasks : [""];
    return initial.map((value, index) => ({ key: `row-${index}`, value }));
  });
  const counter = useRef(rows.length);

  const updateRow = (key: string, value: string) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, value } : row)));
  };

  const addRow = () => {
    counter.current += 1;
    setRows((prev) => [...prev, { key: `row-${counter.current}`, value: "" }]);
  };

  const removeRow = (key: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.key !== key) : prev));
  };

  return (
    <Card className="animate-fade-up">
      <form action={formAction}>
        <input type="hidden" name="date" value={date} />

        <div className="flex items-center justify-between">
          <p className="text-2xs font-medium uppercase tracking-[0.18em] text-muted">
            今日任务 · {dateText}
          </p>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-2xs",
              task ? "bg-sage-soft text-sage-deep" : "bg-butter-soft text-butter-deep",
            )}
          >
            {task ? "已布置" : "未布置"}
          </span>
        </div>

        <Input
          name="title"
          defaultValue={task?.title ?? "今日英语 · 稳稳向前"}
          maxLength={60}
          aria-label="任务标题"
          className="mt-2 h-11 border-0 bg-transparent px-0 text-[19px] font-semibold shadow-none focus:ring-0"
        />

        <div className="mt-1 border-t border-line/70 pt-1">
          {rows.map((row, index) => (
            <div key={row.key} className="flex items-center gap-2.5 py-1.5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral-soft text-2xs font-medium text-coral-deep tabular">
                {index + 1}
              </span>
              <Input
                name="subtasks"
                value={row.value}
                onChange={(event) => updateRow(row.key, event.target.value)}
                placeholder={index === 0 ? "背单词 50 个" : "再加一条…"}
                maxLength={120}
                aria-label={`子任务 ${index + 1}`}
                className="h-11 border-line/70 bg-background/60 shadow-none"
              />
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                disabled={rows.length === 1}
                aria-label="删除这条子任务"
                className="tap grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted/60 hover:bg-background hover:text-coral-deep disabled:opacity-30"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="tap mt-1 flex h-11 w-full items-center justify-center gap-1.5 rounded-btn border border-dashed border-line text-[13px] text-coral-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          添加一条子任务
        </button>

        <div className="mt-4">
          <label htmlFor="task-description" className="mb-2 block text-[13px] text-muted">
            写一句鼓励她的话
          </label>
          <Textarea
            id="task-description"
            name="description"
            defaultValue={task?.description ?? ""}
            maxLength={200}
            placeholder="今天不用赶，把每一步走稳就好～"
            className="min-h-[72px] bg-background"
          />
        </div>

        <Button type="submit" size="lg" className="mt-4 w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              发布中…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" strokeWidth={1.9} />
              {task ? "更新今日任务" : "发布今日任务"}
            </>
          )}
        </Button>

        {state.error && <p className="mt-3 text-[13px] text-coral-deep">{state.error}</p>}
        {state.ok && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-sage-deep">
            <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
            已发布，小婷那边能看到啦
          </p>
        )}
      </form>
    </Card>
  );
}
