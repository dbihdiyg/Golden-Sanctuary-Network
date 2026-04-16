import { useEffect, useRef } from "react";

export default function Inspiration() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("sr-visible"); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,192,55,0.12),rgba(0,19,164,0.14),transparent_70%)]" />
      <div className="absolute inset-x-0 top-0 gold-divider-strong" />
      <div className="absolute inset-x-0 bottom-0 gold-divider-strong" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-primary/8 shadow-[inset_0_0_100px_rgba(245,192,55,0.06)]" style={{ animation: "breathe 8s ease-in-out infinite" }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full border border-white/5" />

      <section
        ref={ref}
        className="sr relative mx-auto max-w-4xl text-center"
      >
        <div className="relative">
          <div
            className="absolute -top-6 right-0 font-serif leading-none select-none pointer-events-none"
            style={{ fontSize: "9rem", lineHeight: 1, color: "rgba(245,192,55,0.15)", fontFamily: "Georgia, serif" }}
            aria-hidden
          >
            ❝
          </div>

          <div className="relative pt-8 px-6 md:px-12">
            <p className="font-serif text-2xl font-bold leading-relaxed text-white md:text-4xl lg:text-5xl md:leading-relaxed lg:leading-relaxed">
              <span className="gold-shimmer-text">
                הבוגר אינו עוזב את הבית
              </span>
              <span className="text-white/90">; הוא יוצא ממנו כדי להאיר במקום שבו הוא נמצא.</span>
            </p>
          </div>

          <div
            className="absolute -bottom-6 left-0 font-serif leading-none select-none pointer-events-none"
            style={{ fontSize: "9rem", lineHeight: 1, color: "rgba(245,192,55,0.15)", fontFamily: "Georgia, serif" }}
            aria-hidden
          >
            ❞
          </div>
        </div>

        <div className="relative mt-14 flex flex-col items-center gap-3">
          <div className="h-px w-20 bg-gradient-to-l from-transparent via-primary/60 to-transparent" />
          <p className="text-base font-bold text-primary tracking-wide">מורינו הרב יצחק דוד גרוסמן שליט"א</p>
          <p className="text-sm text-muted-foreground">ראש ישיבת מגדל-אור</p>
        </div>
      </section>
    </section>
  );
}
