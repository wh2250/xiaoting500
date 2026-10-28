"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, History, Sun } from "lucide-react";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabs = {
  student: [
    { href: "/student", label: "今日", icon: Sun },
    { href: "/student/calendar", label: "日历", icon: CalendarDays },
  ],
  admin: [
    { href: "/admin", label: "今日", icon: Sun },
    { href: "/admin/calendar", label: "日历", icon: CalendarDays },
    { href: "/admin/history", label: "历史", icon: History },
  ],
} as const;

export function BottomTabs({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-white/85 backdrop-blur-xl">
      <div className="safe-bottom mx-auto flex w-full max-w-md items-center px-4 pt-1.5">
        {tabs[role].map(({ href, label, icon: Icon }) => {
          const isHome = href === "/student" || href === "/admin";
          const active = isHome
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5"
            >
              <span
                className={cn(
                  "grid h-7 w-11 place-items-center rounded-full transition-all duration-200 ease-out",
                  active ? "bg-coral-soft text-coral-deep" : "text-muted",
                )}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.1 : 1.8} />
              </span>
              <span
                className={cn(
                  "text-[11px] leading-none tracking-wide transition-colors duration-200",
                  active ? "font-medium text-coral-deep" : "text-muted",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
