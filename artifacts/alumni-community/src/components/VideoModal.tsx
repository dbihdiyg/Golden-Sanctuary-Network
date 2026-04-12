import { useEffect } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  url: string;
  onClose: () => void;
}

function toEmbedUrl(url: string): string {
  const match = url.match(/(?:watch\?v=|embed\/)([A-Za-z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
  return url;
}

export default function VideoModal({ url, onClose }: VideoModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 left-0 flex items-center gap-2 text-white/70 hover:text-white transition"
        >
          <X className="h-5 w-5" />
          <span className="text-sm">סגור</span>
        </button>
        <div className="relative overflow-hidden rounded-[1.5rem] shadow-[0_0_120px_rgba(0,0,0,0.8)]" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={toEmbedUrl(url)}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="סרטון"
          />
        </div>
      </div>
    </div>
  );
}
