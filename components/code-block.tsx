"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-[#070707]">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-2 right-2 rounded-lg p-2 text-muted transition-colors hover:bg-white/10 hover:text-foreground"
      >
        {copied ? <Check className="size-4 text-domain" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      </button>
      <pre className="overflow-x-auto p-4 pr-12 text-[0.8125rem] leading-6" tabIndex={0} aria-label={`${language} code`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
