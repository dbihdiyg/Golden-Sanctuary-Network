import { useEffect, useState } from "react";
import { X, Images, MapPin, Calendar, Clock } from "lucide-react";

interface CommunityEvent {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  imageUrl: string | null;
  ctaText: string;
  ctaLink: string | null;
}

const FALLBACK: CommunityEvent = {
  id: 0,
  title: 'סנדקאות מורינו הרב גרוסמן שליט"א',
  subtitle: "שמחת הקהילה",
  description: `ה' באייר — סנדקאות של מורינו ורבינו הרב גרוסמן שליט"א לנכד אחיו הרב מרדכי גרוסמן. הברית התקיימה באולמי הדודאים בני ברק. ויקרא שמו בישראל יקותיאל יהודה — על שם האדמו"ר מצאנז זצ"ל. הרב אמר: "זה שם מיוחד וזו זכות גדולה להיקרא בשם קדוש זה". לאחר הסנדקאות הגיש הרב ברכות לשמות בוגרים הזקוקים לזיוג הגון וזרע של קיימא. אשרינו שזכינו.`,
  eventDate: "ה' באייר תשפ\"ה",
  eventTime: "",
  location: "אולמי הדודאים, בני ברק",
  imageUrl: "/brit-grossman.png",
  ctaText: "לכל תמונות הקהילה",
  ctaLink: "/gallery",
};

const EXPIRY_FALLBACK = new Date("2026-04-28T00:00:00");

export default function CommunityEventBanner() {
  const [events, setEvents] = useState<CommunityEvent[] | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackDismissed, setFallbackDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/cms/community-events")
      .then(r => r.ok ? r.json() : [])
      .then((data: CommunityEvent[]) => {
        setEvents(data);
        if (data.length === 0) {
          const now = new Date();
          if (now < EXPIRY_FALLBACK && !sessionStorage.getItem("brit_banner_dismissed")) {
            setUseFallback(true);
          }
        }
      })
      .catch(() => {
        const now = new Date();
        if (now < EXPIRY_FALLBACK && !sessionStorage.getItem("brit_banner_dismissed")) {
          setUseFallback(true);
        }
      });
  }, []);

  const dismiss = (id: number) => setDismissed(prev => new Set([...prev, id]));

  const dismissFallback = () => {
    sessionStorage.setItem("brit_banner_dismissed", "1");
    setFallbackDismissed(true);
  };

  const visibleEvents = events?.filter(e => !dismissed.has(e.id)) ?? [];
  const showFallback = useFallback && !fallbackDismissed && visibleEvents.length === 0;

  const renderCard = (event: CommunityEvent, onClose: () => void) => (
    <section key={event.id} className="relative w-full py-6 px-4 overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, hsl(232,30%,9%) 0%, hsl(232,30%,6%) 60%, hsl(40,60%,8%) 100%)" }} />
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
              style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.35)" }}>
              ✡ {event.subtitle || "שמחת הקהילה"}
            </span>
            {event.eventDate && (
              <span className="flex items-center gap-1 text-xs text-white/50"><Calendar size={11} />{event.eventDate}</span>
            )}
            {event.eventTime && (
              <span className="flex items-center gap-1 text-xs text-white/50"><Clock size={11} />{event.eventTime}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition" aria-label="סגור">
            <X size={15} />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ border: "1px solid hsl(var(--primary) / 0.25)", background: "hsl(232,30%,8% / 0.8)", backdropFilter: "blur(12px)" }}>
          <div className={`flex flex-col ${event.imageUrl ? "md:flex-row-reverse" : ""}`}>
            {event.imageUrl && (
              <div className="md:w-2/5 relative overflow-hidden" style={{ minHeight: "260px" }}>
                <img src={event.imageUrl} alt={event.title}
                  className="w-full h-full object-cover object-top" style={{ maxHeight: "340px" }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to right, hsl(232,30%,8%) 0%, transparent 35%)" }} />
              </div>
            )}
            <div className={`${event.imageUrl ? "md:w-3/5" : "w-full"} p-5 md:p-7 flex flex-col justify-center gap-4`}>
              <h2 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: "hsl(var(--primary))" }}>
                {event.title}
              </h2>
              {event.description && (
                <p className="text-sm md:text-base leading-relaxed text-foreground/85 whitespace-pre-line">
                  {event.description}
                </p>
              )}
              <div className="pt-3 border-t flex items-center justify-between flex-wrap gap-2"
                style={{ borderColor: "hsl(var(--primary) / 0.2)" }}>
                {event.ctaLink && (
                  <a href={event.ctaLink}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.4)" }}>
                    <Images size={15} />{event.ctaText || "לפרטים נוספים"}
                  </a>
                )}
                {event.location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={11} />{event.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-0 h-[1px] opacity-30"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }} />
      </div>
    </section>
  );

  return (
    <>
      {visibleEvents.map(e => renderCard(e, () => dismiss(e.id)))}
      {showFallback && renderCard(FALLBACK, dismissFallback)}
    </>
  );
}
