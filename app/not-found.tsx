import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="page-shell flex min-h-dvh flex-col items-center justify-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-coral-soft text-coral-deep">
        <Compass className="h-6 w-6" strokeWidth={1.6} />
      </div>
      <h1 className="mt-5 text-[20px]">走到没有路的地方啦</h1>
      <p className="mt-2 text-[13px] text-muted">这一天不在我们的日历里，回去看看吧。</p>
      <Link
        href="/"
        className="tap mt-6 inline-flex h-12 items-center justify-center rounded-btn bg-coral px-5 text-[15px] font-medium text-white shadow-soft"
      >
        回到首页
      </Link>
    </main>
  );
}
