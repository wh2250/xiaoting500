import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { getUnreadReminder } from "@/lib/data";
import { BottomTabs } from "@/components/bottom-tabs";
import { ReminderBanner } from "@/components/reminder-banner";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole("student");
  const unread = await getUnreadReminder();

  return (
    <div className="safe-top min-h-dvh pb-[104px]">
      <ReminderBanner initial={unread} />
      {children}
      <BottomTabs role="student" />
    </div>
  );
}
