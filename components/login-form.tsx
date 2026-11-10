"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useProgress } from "@/lib/progress-store";
import { getSupabase } from "@/lib/supabase";

type Mode = "log-in" | "sign-up";

const field =
  "mt-1.5 w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none";

// Only sends people back to pages on this site.
function nextPage() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : null;
}

function friendly(code: string | undefined, message: string) {
  if (code === "invalid_credentials") return "That email and password don't match. Check them and try again.";
  if (code === "email_not_confirmed") return "Confirm your email first. Open the link we sent you, then log in.";
  if (code === "user_already_exists") return "There's already an account with this email. Log in instead.";
  if (code === "signup_disabled" || code === "email_provider_disabled")
    return "New accounts are switched off right now. Ask a club organiser to turn sign-ups on.";
  if (code === "weak_password") return "Choose a longer password, with at least 8 characters.";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit")
    return "Too many tries in a short time. Wait a few minutes and try again.";
  return message;
}

export function LoginForm() {
  const router = useRouter();
  const { status, name, progress } = useProgress();
  const [mode, setMode] = useState<Mode>("log-in");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (status === "browser") {
    return (
      <p className="panel p-5 text-muted">
        Accounts aren&apos;t switched on yet, so your progress is saved in this browser.{" "}
        <Link href="/domains" className="text-accent underline underline-offset-4">
          Choose a domain
        </Link>
      </p>
    );
  }

  if (status === "signed-in") {
    return (
      <div className="panel p-5">
        <p>You&apos;re logged in{name ? ` as ${name}` : ""}.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Link
            href={progress.domain ? `/domains/${progress.domain}` : "/domains"}
            className="rounded-full bg-accent px-5 py-2.5 font-medium text-background transition-opacity hover:opacity-90"
          >
            Go to my path
          </Link>
          <button type="button" onClick={() => void signOut()} className="text-muted hover:text-foreground">
            Log out
          </button>
        </div>
      </div>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    setPending(true);
    setError(null);
    setNotice(null);

    if (mode === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: String(form.get("name")).trim() },
          emailRedirectTo: `${window.location.origin}/domains`,
        },
      });
      setPending(false);
      if (error) return setError(friendly(error.code, error.message));
      if (data.session) return router.push(nextPage() ?? "/domains");
      setMode("log-in");
      return setNotice(`Nearly there. We sent a link to ${email}. Open it to confirm your account, then log in here.`);
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) return setError(friendly(error.code, error.message));
    router.push(nextPage() ?? "/domains");
  };

  const signingUp = mode === "sign-up";

  return (
    <div className="panel p-6 sm:p-8">
      <div className="flex gap-6 border-b border-line" role="tablist" aria-label="Log in or create an account">
        {(["log-in", "sign-up"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={mode === option}
            onClick={() => {
              setMode(option);
              setError(null);
            }}
            className={`-mb-px border-b-2 pb-3 transition-colors ${
              mode === option ? "border-accent text-foreground" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {option === "log-in" ? "Log in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {signingUp && (
          <label className="block">
            <span className="text-sm">Your name</span>
            <input name="name" required maxLength={80} autoComplete="name" className={field} />
          </label>
        )}
        <label className="block">
          <span className="text-sm">Email</span>
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={signingUp ? 8 : undefined}
            autoComplete={signingUp ? "new-password" : "current-password"}
            className={field}
          />
          {signingUp && <span className="mt-1 block text-xs text-muted">At least 8 characters.</span>}
        </label>

        {error && (
          <p role="alert" className="text-sm text-[#ff9a8a]">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-accent">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || status === "loading"}
          className="w-full rounded-full bg-accent px-6 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "One moment" : signingUp ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  );
}
