"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { loginAction, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="mt-8">
      <label
        htmlFor="passcode"
        className="mb-2 flex items-center gap-1.5 text-[13px] text-muted"
      >
        <LockKeyhole className="h-3.5 w-3.5" strokeWidth={1.8} />
        输入我们的口令
      </label>

      <Input
        id="passcode"
        name="passcode"
        type="password"
        placeholder="只有我们两个人知道"
        autoComplete="current-password"
        className="h-[52px] bg-white text-center tracking-[0.2em]"
        required
      />

      {state.error && <p className="mt-2 text-[13px] text-coral-deep">{state.error}</p>}

      <Button type="submit" size="lg" className="mt-3 w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            正在进入…
          </>
        ) : (
          <>
            进入我们的小空间
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </>
        )}
      </Button>
    </form>
  );
}
