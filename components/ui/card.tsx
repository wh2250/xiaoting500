import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-card border border-line/80 bg-card p-5 shadow-soft",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export { Card };
