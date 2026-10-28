import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[88px] w-full resize-none rounded-btn border border-line bg-white px-4 py-3 text-[15px] leading-relaxed text-foreground outline-none transition-all duration-200 ease-out placeholder:text-muted/60 focus:border-coral/40 focus:ring-2 focus:ring-coral/15 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
