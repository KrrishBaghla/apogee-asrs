import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <h1 className="font-display text-5xl font-light tracking-tight">Welcome aboard.</h1>
      <p className="mt-3 mb-8 text-muted">Log in to tick off steps and keep your progress on any device.</p>
      <LoginForm />
    </div>
  );
}
