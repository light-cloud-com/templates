"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({ value, label = "Copy", className, ...props }: { value: string; label?: string } & React.ComponentProps<typeof Button>) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={label}
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Could not copy. Select the text and copy it yourself.");
        }
      }}
      {...props}
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
    </Button>
  );
}

/** A read-only value (key, link) with a copy button beside it. */
export function CopyField({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        readOnly
        value={value}
        aria-label={label}
        onFocus={(e) => e.currentTarget.select()}
        className="h-8 min-w-0 flex-1 rounded-lg border bg-background px-2 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
      <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
    </div>
  );
}

/** A code block (curl example) with a copy button in its corner. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border bg-surface p-3 pr-12 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <CopyButton value={code} label="Copy command" className="absolute top-2 right-2" />
    </div>
  );
}
