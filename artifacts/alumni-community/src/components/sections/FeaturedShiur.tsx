import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Headphones, Radio, X } from "lucide-react";

const BARS = 28;

export default function FeaturedShiur() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [listeners] = useState(() => Math.floor(Math.random() * 40) + 18);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animFrame = useRef<number>(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onMeta = () => setDuration(el.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => { el.removeEventListener("loadedmetadata", onMeta); el.removeEventListener("ended", onEnd); };
  }, []);

  useEffect(() => {
    const tick = () => {
      const el = audioRef.current;
      if (el && el.duration) setProgress(el.currentTime / el.duration);
      animFrame.current = requestAnimationFrame(tick);
    };
    if (playing) { animFrame.current = requestAnimationFrame(tick); }
    else cancelAnimationFrame(animFrame.current);
    return () => cancelAnimationFrame(animFrame.current);
  }, [playing]);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    el.currentTime = pct * el.duration;
  };

  const fmt = (s: number) => isNaN(s) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  if (dismissed) return null;

  return (
    <section
      className={`relative overflow-hidden transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      ref={el => { if (el && !loaded) setTimeout(() => setLoaded(true), 80); }}
      dir="rtl"
    >
      <audio ref={audioRef} src="/shiur-tazria-metzora-tashpav.mp3" preload="metadata" />

      {/* ─── Background photo ─── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/rabbi-shiur-thumb.jpg"
          alt="הרב יצחק דוד גרוסמן"
          className="h-full w-full object-cover object-center scale-105"
          style={{ filter: "brightness(0.28) saturate(0.6)" }}
        />
        {/* Animated radial glow that pulses when playing */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
          style={{
            background: "radial-gradient(ellipse 60% 80% at 60% 50%, rgba(245,192,55,0.18) 0%, transparent 70%)",
            animation: playing ? "breathe 2.8s ease-in-out infinite" : "none",
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/70" />
      </div>

      {/* ─── Content ─── */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-14">

          {/* Left — photo frame */}
          <div className="shrink-0 relative hidden md:block">
            <div
              className="h-52 w-52 rounded-[2rem] overflow-hidden border-2 shadow-[0_0_60px_rgba(245,192,55,0.25),0_30px_80px_rgba(0,0,0,0.6)]"
              style={{ borderColor: "rgba(245,192,55,0.5)" }}
            >
              <img src="/rabbi-shiur-thumb.jpg" alt="הרב" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
            </div>
            {/* Pulsing ring when playing */}
            {playing && (
              <div className="absolute inset-0 rounded-[2rem] border-2 border-primary/60 animate-ping opacity-30 pointer-events-none" />
            )}
          </div>

          {/* Right — player content */}
          <div className="flex-1 flex flex-col justify-center gap-5 text-right">

            {/* Badges row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/12 px-3 py-1 text-xs font-black text-primary animate-pulse">
                <Radio className="h-3 w-3" />
                שיעור חדש
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-muted-foreground">
                <Headphones className="h-3 w-3" />
                {listeners} מאזינים כעת
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                תזריע–מצורע · תשפ״ו
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-black text-white leading-snug">
                הרב יצחק דוד גרוסמן
              </h2>
              <p className="mt-1 text-muted-foreground text-sm md:text-base">
                שיעור פרשת תזריע–מצורע · י״ט ניסן תשפ״ו
              </p>
            </div>

            {/* Waveform visualizer */}
            <div className="flex items-end gap-[3px] h-9" aria-hidden>
              {Array.from({ length: BARS }).map((_, i) => {
                const base = 0.25 + 0.65 * Math.abs(Math.sin(i * 0.55 + 1.3));
                const isActive = i / BARS < progress;
                return (
                  <div
                    key={i}
                    className="rounded-full transition-all"
                    style={{
                      width: 5,
                      height: `${base * 100}%`,
                      background: isActive
                        ? "hsl(var(--primary))"
                        : playing
                        ? `rgba(245,192,55,${0.3 + 0.5 * base})`
                        : `rgba(255,255,255,${0.12 + 0.2 * base})`,
                      transform: playing ? `scaleY(${0.6 + 0.4 * Math.abs(Math.sin(Date.now() * 0.004 + i * 0.4))})` : "scaleY(1)",
                      transition: playing ? "height 0.15s, background 0.3s" : "background 0.3s",
                      animation: playing ? `bar-bounce ${0.5 + (i % 5) * 0.08}s ease-in-out infinite alternate` : "none",
                    }}
                  />
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div
                className="h-1.5 w-full cursor-pointer rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.12)" }}
                onClick={seek}
              >
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progress * 100}%`,
                    background: "linear-gradient(to left, hsl(var(--primary)), rgba(245,192,55,0.6))",
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground" dir="ltr">
                <span>{fmt(duration * progress)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={toggle}
                className="flex items-center gap-2.5 rounded-2xl px-6 py-3 font-black text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(245,192,55,0.25)]"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)) 0%, rgba(245,164,0,0.85) 100%)",
                  color: "#0F1A2B",
                }}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? "השהה" : "הקשב עכשיו"}
              </button>

              <a
                href="/shiur-tazria-metzora-tashpav.mp3"
                download="הרב_גרוסמן_תזריע_מצורע_תשפו.mp3"
                className="flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                style={{ borderColor: "rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.05)" }}
              >
                <Download className="h-4 w-4" />
                הורד שיעור
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute left-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/30 text-white/50 backdrop-blur transition hover:text-white hover:border-white/30"
        title="סגור"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Bottom border glow */}
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(245,192,55,0.4), transparent)" }} />

      <style>{`
        @keyframes bar-bounce {
          from { transform: scaleY(0.55); }
          to   { transform: scaleY(1.15); }
        }
      `}</style>
    </section>
  );
}
