"use client";

import { useEffect, useState, useTransition } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";
import { markReminderReadAction } from "@/actions/reminders";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { todayISO } from "@/lib/date";
import type { Reminder } from "@/lib/types";

interface ReminderBannerProps {
  initial: Reminder | null;
}

/**
 * 催作业提醒条：
 * 1. 进入页面时如果有未读提醒，直接展示；
 * 2. 在线时通过 Supabase Realtime 订阅 reminders 的 INSERT 事件；
 * 3. 有系统通知权限时，同时弹一条浏览器通知。
 */
export function ReminderBanner({ initial }: ReminderBannerProps) {
  const [reminder, setReminder] = useState<Reminder | null>(initial);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const client = supabaseBrowser();
    if (!client) return;

    const channel = client
      .channel("xt-reminders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reminders" },
        (payload) => {
          const row = payload.new as Reminder;
          if (row.date !== todayISO()) return;
          setReminder(row);

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("小婷，男朋友在催你啦～", {
              body: "今天的作业还在等你，交完就轻松啦。",
              icon: "/icon.svg",
              tag: "xt-reminder",
            });
          }
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  if (!reminder) return null;

  const dismiss = () => {
    const id = reminder.id;
    startTransition(async () => {
      await markReminderReadAction(id);
      setReminder(null);
    });
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <div className="sticky top-[env(safe-area-inset-top)] z-40">
      <div className="page-shell pt-2">
        <div className="animate-fade-up flex items-center gap-3 rounded-card border border-coral-tint/80 bg-coral-soft/95 px-3.5 py-3 shadow-soft backdrop-blur">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/80 text-coral-deep">
            <BellRing className="h-4 w-4" strokeWidth={2} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold leading-snug text-[#B2544A]">
              男朋友在催你啦～
            </p>
            {permission === "default" ? (
              <button
                type="button"
                onClick={requestPermission}
                className="text-left text-2xs text-[#B2544A]/75 underline decoration-[#B2544A]/30 underline-offset-2"
              >
                点这里开启系统通知提醒
              </button>
            ) : (
              <p className="truncate text-2xs text-[#B2544A]/70">
                今天的作业还在等你，交完就轻松啦
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={dismiss}
            disabled={pending}
            className="tap flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-2xs font-medium text-coral-deep shadow-soft disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" strokeWidth={2.4} />
            )}
            知道啦
          </button>
        </div>
      </div>
    </div>
  );
}
