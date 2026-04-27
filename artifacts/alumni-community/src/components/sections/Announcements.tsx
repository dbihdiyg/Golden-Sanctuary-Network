import { useEffect, useState } from "react";
import { X, ExternalLink, Play, Volume2, Info, AlertTriangle, CheckCircle, Star } from "lucide-react";

interface Announcement {
  id: number;
  title: string | null;
  body: string;
  linkUrl: string | null;
  linkType: string | null;
  linkLabel: string | null;
  variant: string;
  isPinned: boolean;
  expiresAt: string | null;
}

const VARIANTS: Record<string, { bg: string; border: string; text: string; icon: typeof Info }> = {
  info:    { bg: "from-blue-950/80 to-slate-900/80",    border: "#3b82f6", text: "#93c5fd", icon: Info },
  gold:    { bg: "from-amber-950/80 to-yellow-900/60",  border: "#c9a028", text: "#fde68a", icon: Star },
  warning: { bg: "from-orange-950/80 to-amber-900/60",  border: "#f97316", text: "#fed7aa", icon: AlertTriangle },
  success: { bg: "from-green-950/80 to-emerald-900/60", border: "#22c55e", text: "#86efac", icon: CheckCircle },
};

function AnnouncementBar({ item, onDismiss }: { item: Announcement; onDismiss: (id: number) => void }) {
  const v = VARIANTS[item.variant] ?? VARIANTS.info;
  const Icon = v.icon;

  const linkIcon =
    item.linkType === "youtube" ? <Play size={13} className="shrink-0" /> :
    item.linkType === "audio"   ? <Volume2 size={13} className="shrink-0" /> :
    <ExternalLink size={13} className="shrink-0" />;

  return (
    <div
      dir="rtl"
      className={`relative w-full bg-gradient-to-r ${v.bg} px-4 py-3 flex items-center gap-3 border-b`}
      style={{ borderColor: v.border + "50" }}
    >
      <div
        className="absolute inset-y-0 right-0 w-1 rounded-l-full"
        style={{ background: v.border }}
      />

      <Icon size={16} className="shrink-0" style={{ color: v.text }} />

      <div className="flex-1 min-w-0">
        {item.title && (
          <span className="font-bold text-sm ml-2" style={{ color: v.text }}>
            {item.title}
          </span>
        )}
        <span className="text-sm text-white/80">{item.body}</span>

        {item.linkUrl && (
          <a
            href={item.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold mr-2 px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
            style={{ color: v.border, background: v.border + "20", border: `1px solid ${v.border}40` }}
          >
            {linkIcon}
            {item.linkLabel ?? "לחצו כאן"}
          </a>
        )}
      </div>

      <button
        onClick={() => onDismiss(item.id)}
        aria-label="סגור"
        className="shrink-0 p-1 rounded-full opacity-50 hover:opacity-90 transition-opacity"
        style={{ color: v.text }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/cms/announcements")
      .then(r => r.ok ? r.json() : [])
      .then(setItems)
      .catch(() => {});
  }, []);

  const dismiss = (id: number) => setDismissed(prev => new Set([...prev, id]));

  const visible = items.filter(i => !dismissed.has(i.id));
  if (visible.length === 0) return null;

  return (
    <div className="w-full">
      {visible.map(item => (
        <AnnouncementBar key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </div>
  );
}
