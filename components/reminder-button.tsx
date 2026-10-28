"use client";

import { useState, useTransition } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";
import { sendReminderAction, type ReminderState } from "@/actions/reminders";
import { timeLabel } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ReminderButtonProps {
  lastSentAt: string | null;
}

/** 管理端：一键催作业（写入 reminders 表） */
export function ReminderButton({ lastSentAt }: ReminderButtonProps) {
  const [state, setState] = useState<ReminderState | null>(null);
  const [pending, startTransition] = useTransition();

  const send = () => {
    startTransition(async () => {
      const result = await sendReminderAction();
      setState(result);
    });
  };

  return (
    <Card className="animate-fade-up">
      <p className="text-2xs font-medium uppercase tracking-[0.18em] text-muted">提醒</p>
      <h2 className="mt-1 text-[17px] font-semibold">轻轻推她一下</h2>
      <p className="mt-1 text-2xs leading-relaxed text-muted">
        她在线时页面顶部会弹出提醒条；开了系统通知的话，还会收到一条通知。
      </p>

      <Button size="lg" className="mt-4 w-full" onClick={send} disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            正在提醒…
          </>
        ) : (
          <>
            <BellRing className="h-4 w-4" strokeWidth={1.9} />
            提醒她交作业
          </>
        )}
      </Button>

      {state?.error ? (
        <p className="mt-3 text-center text-2xs text-coral-deep">{state.error}</p>
      ) : state?.ok && state.sentAt ? (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-2xs text-sage-deep">
          <Check className="h-3 w-3" strokeWidth={2.5} />
          已在 {timeLabel(state.sentAt)} 提醒，她那边收到啦
        </p>
      ) : lastSentAt ? (
        <p className="mt-3 text-center text-2xs text-muted">
          上次提醒：{timeLabel(lastSentAt)}
        </p>
      ) : (
        <p className="mt-3 text-center text-2xs text-muted">今天还没催过她</p>
      )}
    </Card>
  );
}
