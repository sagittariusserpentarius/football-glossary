import { useState, useCallback, useEffect } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "../lib/utils";

interface ShareButtonProps {
  className?: string;
}

export default function ShareButton({ className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Link copied" : "Share link"}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition-all duration-200",
        copied
          ? "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:text-slate-100",
        className,
      )}
    >
      {copied ? (
        <>
          <Check size={14} className="shrink-0" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={14} className="shrink-0" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}