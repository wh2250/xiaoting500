import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  className?: string;
}

/** 可爱空状态 */
export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-9 text-center", className)}>
      <div className="grid h-14 w-14 place-items-center rounded-full bg-coral-soft text-coral-deep">
        {icon}
      </div>
      <p className="mt-3.5 text-[14.5px] font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-[240px] text-2xs leading-relaxed text-muted">{description}</p>
      )}
    </div>
  );
}
