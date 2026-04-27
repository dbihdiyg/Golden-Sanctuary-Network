import { useEffect, useState } from "react";
import { X, ExternalLink, Play, Volume2, Info, AlertTriangle, CheckCircle, Star, MapPin, Calendar, ArrowLeft } from "lucide-react";

interface Announcement {
  id: number;
  title: string | null;
  body: string;
  linkUrl: string | null;
  linkType: string | null;
  linkLabel: string | null;
  variant: string;
  isPinned: boolean;
  type: string;
  eventDate: string | null;
  locationText: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
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
      <div className="absolute inset-y-0 right-0 w-1 rounded-l-full" style={{ background: v.border }} />
      <Icon size={16} className="shrink-0" style={{ color: v.text }} />
      <div className="flex-1 min-w-0">
        {item.title && <span className="font-bold text-sm ml-2" style={{ color: v.text }}>{item.title}</span>}
        <span className="text-sm text-white/80">{item.body}</span>
        {item.linkUrl && (
          <a href={item.linkUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold mr-2 px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
            style={{ color: v.border, background: v.border + "20", border: `1px solid ${v.border}40` }}>
            {linkIcon}{item.linkLabel ?? "לחצו כאן"}
          </a>
        )}
      </div>
      <button onClick={() => onDismiss(item.id)} aria-label="סגור"
        className="shrink-0 p-1 rounded-full opacity-50 hover:opacity-90 transition-opacity" style={{ color: v.text }}>
        <X size={13} />
      </button>
    </div>
  );
}

function EventCard({ item, onDismiss }: { item: Announcement; onDismiss: (id: number) => void }) {
  const v = VARIANTS[item.variant] ?? VARIANTS.gold;

  return (
    <section dir="rtl" className="relative w-full py-5 px-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(232,30%,9%) 0%, hsl(232,30%,6%) 60%, hsl(40,60%,8%) 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${v.border}, transparent)` }} />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: v.border + "22", color: v.text, border: `1px solid ${v.border}55` }}>
              <v.icon size={11} className="inline ml-1" />{item.title ?? "אירוע מיוחד"}
            </span>
            {item.eventDate && (
              <span className="flex items-center gap-1 text-xs text-white/50">
                <Calendar size={11} />{item.eventDate}
              </span>
            )}
            {item.locationText && (
              <span className="flex items-center gap-1 text-xs text-white/50">
                <MapPin size={11} />{item.locationText}
              </span>
            )}
          </div>
          <button onClick={() => onDismiss(item.id)} aria-label="סגור"
            className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition">
            <X size={14} />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: `1px solid ${v.border}30`, background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)" }}>
          <div className={`flex flex-col ${item.imageUrl ? "md:flex-row-reverse" : ""}`}>
            {item.imageUrl && (
              <div className="md:w-2/5 relative overflow-hidden" style={{ minHeight: "220px" }}>
                <img src={item.imageUrl} alt={item.title ?? "אירוע"}
                  className="w-full h-full object-cover object-top" style={{ maxHeight: "300px" }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to right, hsl(232,30%,8%) 0%, transparent 30%)" }} />
              </div>
            )}
            <div className={`${item.imageUrl ? "md:w-3/5" : "w-full"} p-5 md:p-6 flex flex-col justify-center gap-3`}>
              <p className="text-sm md:text-base leading-relaxed text-white/85 whitespace-pre-line">{item.body}</p>
              {(item.ctaUrl || item.linkUrl) && (
                <div className="pt-2 border-t" style={{ borderColor: v.border + "25" }}>
                  <a href={item.ctaUrl || item.linkUrl!} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                    style={{ background: v.border + "22", color: v.text, border: `1px solid ${v.border}44` }}>
                    {item.ctaText || item.linkLabel || "לפרטים נוספים"}
                    <ArrowLeft size={14} className="rotate-180" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-0 h-px opacity-20"
          style={{ background: `linear-gradient(90deg, transparent, ${v.border}, transparent)` }} />
      </div>
    </section>
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
      {visible.map(item =>
        item.type === "event"
          ? <EventCard key={item.id} item={item} onDismiss={dismiss} />
          : <AnnouncementBar key={item.id} item={item} onDismiss={dismiss} />
      )}
    </div>
  );
}
