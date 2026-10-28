"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PhotoGridProps {
  images: string[];
  columns?: 2 | 3;
  className?: string;
}

/** 照片九宫格 + 点开看大图 */
export function PhotoGrid({ images, columns = 3, className }: PhotoGridProps) {
  const [active, setActive] = useState<number | null>(null);
  const valid = images.filter(Boolean);

  if (valid.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-btn border border-dashed border-line bg-background/60 py-8 text-muted/70">
        <ImageIcon className="h-5 w-5" strokeWidth={1.6} />
        <p className="text-2xs">还没有照片</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid gap-2",
          columns === 2 ? "grid-cols-2" : "grid-cols-3",
          className,
        )}
      >
        {valid.map((src, index) => (
          <button
            key={`${index}-${src.slice(-16)}`}
            type="button"
            onClick={() => setActive(index)}
            className="tap aspect-square overflow-hidden rounded-[14px] border border-line/60 bg-background"
          >
            {/* 签名 URL 域名不固定，这里用原生 img */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`作业照片 ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-lg border-0 bg-card p-3">
          <DialogTitle className="sr-only">作业照片</DialogTitle>
          {active !== null && (
            <div className="animate-fade-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={valid[active]}
                alt={`作业照片 ${active + 1}`}
                className="max-h-[68vh] w-full rounded-[14px] object-contain"
              />
              <p className="pt-2 text-center text-2xs text-muted">
                第 {active + 1} / {valid.length} 张
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
