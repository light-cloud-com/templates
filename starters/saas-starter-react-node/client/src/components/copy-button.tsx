import { useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Copies a value and confirms with a toast. Without children it is an icon button. */
export function CopyButton({ value, label = "Copy", toastMessage = "Copied", children, ...props }: Omit<ComponentProps<typeof Button>, "value" | "onClick"> & { value: string; label?: string; toastMessage?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success(toastMessage);
    } catch {
      toast.error("Could not copy. Select the text and copy it yourself.");
    }
  }
  const Icon = copied ? Check : Copy;
  return (
    <Button type="button" variant="outline" size={children ? "sm" : "icon-sm"} aria-label={children ? undefined : label} onClick={copy} {...props}>
      <Icon aria-hidden />
      {children}
    </Button>
  );
}

/** A read-only value (key, link, command) with a copy button beside it. */
export function CopyField({ value, label, toastMessage }: { value: string; label: string; toastMessage?: string }) {
  return (
    <div className="bg-surface flex items-start gap-2 rounded-lg border p-2 pl-3">
      <code className="min-w-0 flex-1 self-center font-mono text-[0.8125rem] break-all whitespace-pre-wrap">{value}</code>
      <CopyButton value={value} label={label} toastMessage={toastMessage} />
    </div>
  );
}
