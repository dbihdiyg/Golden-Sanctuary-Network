import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, Camera, X, ZoomIn } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const PHOTOS = [
  "/pesach2025/DSC_0145_1_1776003094842.JPG",
  "/pesach2025/DSC_0145_1_(1)_1776003094841.JPG",
  "/pesach2025/DSC_0193_1776003094841.JPG",
  "/pesach2025/DSC_0240_1776003094841.JPG",
  "/pesach2025/DSC_0248_2_1776003094841.JPG",
  "/pesach2025/DSC_0261_1776003094840.JPG",
  "/pesach2025/DSC_0355_1_1776003094840.JPG",
  "/pesach2025/DSC_0358_1776003094841.JPG",
  "/pesach2025/DSC_0363_1_1776003094840.JPG",
  "/pesach2025/DSC_0686_1776003094840.JPG",
  "/pesach2025/DSC_0770_1_1776003094839.JPG",
  "/pesach2025/DSC_0973_1776003094840.JPG",
  "/pesach2025/DSC_0983_1_1776003094839.JPG",
  "/pesach2025/IMG-20250411-WA0003_1776003094839.jpg",
  "/pesach2025/IMG-20260331-WA0062_1776003094839.jpg",
].map(p => BASE + p);

export default function PesachExclusive() {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive(a => (a + 1) % PHOTOS.length), []);
  const prev = useCallback(() => setActive(a => (a - 1 + PHOTOS.length) % PHOTOS.length), []);

  useEffect(() => {
    if (paused || lightbox !== null) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next, paused, lightbox]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "ArrowLeft") setLightbox(l => l !== null ? (l + 1) % PHOTOS.length : null);
      if (e.key === "ArrowRight") setLightbox(l => l !== null ? (l - 1 + PHOTOS.length) % PHOTOS.length : null);
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <section className="relative overflow-hidden px-4 py-14 sm:px-6" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,192,55,0.07),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <span className="animate-pulse rounded-full bg-primary px-3 py-1 text-[11px] font-black tracking-widest text-primary-foreground uppercase">
              ◆ בלעדי לאתר הבוגרים ◆
            </span>
          </div>
          <h2 className="font-serif text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            תיעוד מסכם חג הפסח
          </h2>
          <p className="text-xl font-bold text-primary sm:text-2xl">
            במחיצת הגרי"ד גרוסמן שליט"א
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Camera className="h-4 w-4 text-primary/60" />
            <span>קרדיט: י.ש.חיימסון</span>
            <span className="opacity-30">·</span>
            <span>{PHOTOS.length} תמונות</span>
          </div>
          <div className="mt-1 h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        {/* Main Stage */}
        <div
          className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_32px_80px_rgba(0,0,0,0.6)] cursor-pointer"
          style={{ aspectRatio: "16/9" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onClick={() => setLightbox(active)}
        >
          {PHOTOS.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`תמונה ${i + 1}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
            />
          ))}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

          {/* Zoom hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="rounded-full bg-black/40 border border-white/20 backdrop-blur-sm p-4">
              <ZoomIn className="h-7 w-7 text-white" />
            </div>
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 right-5 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm px-3 py-1 text-xs text-white/70">
            {active + 1} / {PHOTOS.length}
          </div>

          {/* Prev/Next */}
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 border border-white/10 p-2.5 text-white/70 backdrop-blur-sm transition hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 border border-white/10 p-2.5 text-white/70 backdrop-blur-sm transition hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {PHOTOS.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setActive(i); }}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-primary" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {PHOTOS.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all ${
                i === active ? "border-primary scale-105 shadow-[0_0_16px_rgba(245,192,55,0.4)]" : "border-transparent opacity-60 hover:opacity-100 hover:border-white/20"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 border border-white/20 p-2.5 text-white hover:bg-white/20 transition"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 border border-white/20 p-3 text-white hover:bg-primary hover:border-primary transition"
            onClick={e => { e.stopPropagation(); setLightbox(l => l !== null ? (l - 1 + PHOTOS.length) % PHOTOS.length : null); }}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 border border-white/20 p-3 text-white hover:bg-primary hover:border-primary transition"
            onClick={e => { e.stopPropagation(); setLightbox(l => l !== null ? (l + 1) % PHOTOS.length : null); }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={PHOTOS[lightbox]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 border border-white/10 px-4 py-1.5 text-sm text-white/70">
            {lightbox + 1} / {PHOTOS.length} · קרדיט: י.ש.חיימסון
          </div>
        </div>
      )}
    </section>
  );
}
