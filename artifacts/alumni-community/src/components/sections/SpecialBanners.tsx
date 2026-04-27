import { useState, useRef, useEffect } from "react";
import { X, Flame, Play, Pause, Volume2, Star, Bell, Heart, BookOpen, AlertTriangle } from "lucide-react";

interface SpecialBanner {
  id: number;
  label: string;
  labelIcon: string;
  dateLabel: string;
  headline: string;
  subtitle: string;
  bodyText: string;
  footerText: string;
  youtubeId: string | null;
  audioUrl: string | null;
  audioLabel: string;
  audioSublabel: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  flame:    Flame,
  star:     Star,
  bell:     Bell,
  heart:    Heart,
  book:     BookOpen,
  warning:  AlertTriangle,
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

function AudioPlayer({ src, label, sublabel }: { src: string; label: string; sublabel: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => { if (!dragging) setCurrent(el.currentTime); };
    const onDur = () => setDuration(el.duration);
    const onEnd = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onDur);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onDur);
      el.removeEventListener("ended", onEnd);
    };
  }, [dragging]);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { await el.play(); setPlaying(true); }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setCurrent(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(181,154,106,0.2)",
        backdropFilter: "blur(8px)",
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-2" dir="rtl">
        <Volume2 size={14} style={{ color: "#c9a96e", flexShrink: 0 }} />
        <div>
          {label && (
            <p className="text-xs font-bold" style={{ color: "#c9a96e" }}>{label}</p>
          )}
          {sublabel && (
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>{sublabel}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3" dir="ltr">
        <button
          onClick={toggle}
          className="shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{
            width: 38, height: 38,
            background: playing ? "rgba(201,169,110,0.25)" : "rgba(201,169,110,0.9)",
            color: playing ? "#c9a96e" : "#1a0d00",
            border: "1px solid rgba(201,169,110,0.5)",
          }}
          aria-label={playing ? "השהה" : "נגן"}
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div
              className="absolute inset-y-0 rounded-full transition-all"
              style={{ width: `${pct}%`, left: 0, background: "linear-gradient(90deg, #c9a028, #ffe4a0)" }}
            />
            <input
              type="range" min={0} max={duration || 100} value={current} step={0.1}
              onChange={seek}
              onMouseDown={() => setDragging(true)} onMouseUp={() => setDragging(false)}
              onTouchStart={() => setDragging(true)} onTouchEnd={() => setDragging(false)}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ height: "100%" }}
            />
          </div>
          <div className="flex justify-between text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span>{fmt(current)}</span>
            <span>{duration ? fmt(duration) : "--:--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleBanner({ banner, onDismiss }: { banner: SpecialBanner; onDismiss: (id: number) => void }) {
  const [animOut, setAnimOut] = useState(false);
  const LabelIcon = ICON_MAP[banner.labelIcon] ?? Flame;

  const handleDismiss = () => {
    setAnimOut(true);
    setTimeout(() => onDismiss(banner.id), 400);
  };

  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #2d1a00 0%, #3b2000 40%, #1a0d00 100%)",
        borderTop: "4px solid #c9a028",
        borderBottom: "4px solid #c9a028",
        transition: "opacity 0.4s, transform 0.4s",
        opacity: animOut ? 0 : 1,
        transform: animOut ? "translateY(-8px)" : "translateY(0)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, transparent, #c9a028, #ffe4a0, #c9a028, transparent)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
              style={{
                background: "rgba(181,154,106,0.12)",
                color: "#c9a96e",
                border: "1px solid rgba(181,154,106,0.3)",
              }}
            >
              <LabelIcon size={12} className="shrink-0" style={{ color: "#d4a843" } as any} />
              {banner.label}
            </span>
            {banner.dateLabel && (
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {banner.dateLabel}
              </span>
            )}
          </div>
          <button
            onClick={handleDismiss}
            aria-label="סגור"
            className="p-1.5 rounded-full transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{
            border: "1px solid rgba(181,154,106,0.18)",
            background: "rgba(255,255,255,0.025)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 0 60px rgba(181,154,106,0.03)",
          }}
        >
          <div className={`flex flex-col ${banner.youtubeId ? "lg:flex-row-reverse" : ""} gap-0`}>
            {/* Video side */}
            {banner.youtubeId && (
              <div className="lg:w-[45%] relative bg-black" style={{ minHeight: "240px" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${banner.youtubeId}?rel=0&modestbranding=1`}
                  title={banner.headline}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: "none", minHeight: "240px" }}
                />
              </div>
            )}

            {/* Text side */}
            <div className={`${banner.youtubeId ? "lg:w-[55%]" : "w-full"} p-5 md:p-7 flex flex-col justify-center gap-4`}>
              <div>
                <h2
                  className="text-xl md:text-2xl font-bold leading-snug mb-1"
                  style={{ color: "#c9a96e" }}
                >
                  {banner.headline}
                </h2>
                {banner.subtitle && (
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {banner.subtitle}
                  </p>
                )}
              </div>

              {banner.bodyText && (
                <>
                  <div
                    className="h-px w-16"
                    style={{ background: "linear-gradient(90deg, rgba(181,154,106,0.6), transparent)" }}
                  />
                  <div
                    className="text-sm leading-[1.95] overflow-y-auto max-h-44 pr-1"
                    style={{
                      color: "rgba(255,255,255,0.72)",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(181,154,106,0.3) transparent",
                      fontFamily: "'Frank Ruhl Libre', serif",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {banner.bodyText}
                  </div>
                </>
              )}

              {banner.footerText && (
                <div
                  className="pt-3 border-t text-xs flex items-center gap-2"
                  style={{
                    borderColor: "rgba(181,154,106,0.15)",
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  <LabelIcon size={11} style={{ color: "#c9a96e", flexShrink: 0 } as any} />
                  <span>{banner.footerText}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio player */}
        {banner.audioUrl && (
          <AudioPlayer
            src={banner.audioUrl}
            label={banner.audioLabel}
            sublabel={banner.audioSublabel}
          />
        )}

        <div
          className="h-px mt-4 opacity-25"
          style={{ background: "linear-gradient(90deg, transparent, #b59a6a, transparent)" }}
        />
      </div>
    </section>
  );
}

export default function SpecialBanners() {
  const [banners, setBanners] = useState<SpecialBanner[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/cms/special-banners")
      .then(r => r.ok ? r.json() : [])
      .then(setBanners)
      .catch(() => {});
  }, []);

  const dismiss = (id: number) => setDismissed(prev => new Set([...prev, id]));

  const visible = banners.filter(b => !dismissed.has(b.id));
  if (visible.length === 0) return null;

  return (
    <>
      {visible.map(b => (
        <SingleBanner key={b.id} banner={b} onDismiss={dismiss} />
      ))}
    </>
  );
}
