import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { BottomTabs } from "@/components/bottom-tabs";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");

  return (
    <div className="safe-top min-h-dvh pb-[104px]">
      {children}
      <BottomTabs role="admin" />
    </div>
  );
}
