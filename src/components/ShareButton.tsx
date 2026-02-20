import { useState, useCallback, useEffect } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "../lib/utils";

interface ShareButtonProps {
  /** Extra classes applied to the outer button. */
  className?: string;
}

/**
 * Copies the current page URL (including hash) to the clipboard
 * and shows brief "Copied!" feedback.
 */
export default function ShareButton({ className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Fallback for older browsers / insecure contexts
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
    }
  }, []);

  // Reset the "copied" state after a short delay
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
          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:shadow-sm",
        className
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