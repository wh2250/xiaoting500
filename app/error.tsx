"use client";

import { useEffect } from "react";
import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-shell flex min-h-dvh flex-col items-center justify-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-coral-soft text-coral-deep">
        <CloudOff className="h-6 w-6" strokeWidth={1.6} />
      </div>
      <h1 className="mt-5 text-[20px]">页面加载失败了</h1>
      <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-muted">
        可能是 Supabase 环境变量还没配置好，或者网络有点抖。检查一下再试试吧。
      </p>
      <Button className="mt-6" onClick={reset}>
        再试一次
      </Button>
    </main>
  );
}
