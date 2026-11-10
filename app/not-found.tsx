import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <h1 className="font-display text-5xl font-light sm:text-7xl">This page isn&apos;t in orbit.</h1>
      <p className="mt-4 text-lg text-muted">The link may be old or mistyped.</p>
      <Link href="/domains" className="mt-7 inline-block rounded-full bg-accent px-6 py-3 font-medium text-background">
        See all domains
      </Link>
    </div>
  );
}
