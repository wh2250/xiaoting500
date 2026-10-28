import { redirect } from "next/navigation";
import { demoPasscodes, getRole } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "登录 · 小婷500分之路" };

export default async function LoginPage() {
  const role = await getRole();
  if (role === "admin") redirect("/admin");
  if (role === "student") redirect("/student");

  const hints = demoPasscodes();

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* 装饰：扁平的奶油色圆形，不用渐变和重阴影 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-12 h-52 w-52 rounded-full bg-coral-soft/80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-16 h-44 w-44 rounded-full bg-mist-soft/70"
      />

      <div className="page-shell safe-top relative flex w-full flex-1 flex-col justify-center py-12">
        <div className="animate-fade-up">
          <p className="text-2xs uppercase tracking-[0.28em] text-muted">
            FOR XIAOTING · 2026
          </p>
          <h1 className="mt-5 text-[35px] leading-[1.3] tracking-tight">
            小婷<span className="text-coral-deep">500分</span>之路
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            每天一点点，
            <br />
            离想要的分数更近一点。
          </p>
        </div>

        <div className="mt-9 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="rounded-card border border-line/80 bg-white/90 p-5 shadow-soft">
            <LoginForm />
            <p className="mt-4 text-center text-2xs text-muted/80">
              两个口令，分别通向管理端和小婷的页面
            </p>
          </div>
        </div>

        {hints && (
          <div className="mt-4 rounded-btn border border-line bg-white/60 px-4 py-3 text-center text-2xs leading-relaxed text-muted">
            演示模式 · 管理员 <span className="font-medium text-foreground">{hints.admin}</span>
            {" · "}
            小婷 <span className="font-medium text-foreground">{hints.student}</span>
          </div>
        )}

        <p className="mt-8 text-center text-2xs text-muted/60">
          只有我们两个人的小空间
        </p>
      </div>
    </main>
  );
}
