import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}

/** 页面顶部标题 + 退出登录 */
export function PageHeader({ eyebrow, title, subtitle, right, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-3 pt-1", className)}>
      <div className="min-w-0">
        <p className="text-2xs font-medium uppercase tracking-[0.22em] text-muted">{eyebrow}</p>
        <h1 className="mt-1.5 text-[24px] leading-snug text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-muted">{subtitle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1 pt-0.5">
        {right}
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="退出登录"
            className="tap grid h-9 w-9 place-items-center rounded-full text-muted/70 transition-colors hover:bg-white hover:text-foreground"
          >
            <LogOut className="h-[17px] w-[17px]" strokeWidth={1.8} />
          </button>
        </form>
      </div>
    </header>
  );
}
