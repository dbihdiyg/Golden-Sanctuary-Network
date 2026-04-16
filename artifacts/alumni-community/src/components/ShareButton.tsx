import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  sectionId: string;
  label?: string;
  className?: string;
}

export default function ShareButton({ sectionId, label, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${sectionId}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url, title: label ?? document.title });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      title={label ? `שתף: ${label}` : "שתף קישור"}
      className={`group relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
        copied
          ? "border-green-500/40 bg-green-500/10 text-green-400"
          : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          הועתק!
        </>
      ) : (
        <>
          {typeof navigator.share === "function" ? <Share2 className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
          שיתוף
        </>
      )}
    </button>
  );
}
