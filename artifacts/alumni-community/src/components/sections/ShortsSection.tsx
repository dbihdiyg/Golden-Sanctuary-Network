import { useState } from "react";
import { Play, X, Sparkles } from "lucide-react";

export const shortsData = [
  { id: "YyjYaoD_eeM", title: "רגע מהקהילה" },
];

function ShortsModal({ id, onClose }: { id: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/92 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="relative w-full max-w-[360px] mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
          סגור
        </button>
        <div
          className="relative overflow-hidden rounded-[2rem] shadow-[0_0_120px_rgba(0,0,0,0.9)]"
          style={{ paddingTop: "177.78%" }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="סרטון קצר"
          />
        </div>
      </div>
    </div>
  );
}

function ShortCard({ short, onClick }: { short: typeof shortsData[0]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex-shrink-0 w-[200px] md:w-[220px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-card shadow-[0_20px_70px_rgba(0,0,0,0.5)] transition duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_0_60px_rgba(245,192,55,0.2)]"
      style={{ aspectRatio: "9/16" }}
    >
      <img
        src={`https://img.youtube.com/vi/${short.id}/hqdefault.jpg`}
        alt={short.title}
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="relative grid h-16 w-16 place-items-center rounded-full border border-primary/60 bg-primary/20 text-primary shadow-[0_0_40px_rgba(245,192,55,0.35)] backdrop-blur-md transition duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
          <span className="absolute inset-[-8px] rounded-full border border-primary/20 animate-ping" />
          <Play className="mr-0.5 h-7 w-7 fill-current" />
        </span>
      </div>
      <div className="absolute bottom-0 right-0 left-0 p-4 text-right">
        <p className="font-serif text-base font-black text-white leading-snug drop-shadow-lg">{short.title}</p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary backdrop-blur">
          Shorts
        </span>
      </div>
    </button>
  );
}

export default function ShortsSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <>
      {activeId && <ShortsModal id={activeId} onClose={() => setActiveId(null)} />}

      <section className="relative overflow-hidden px-4 py-12 md:px-6 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,192,55,0.12),transparent_60%),radial-gradient(ellipse_at_20%_100%,rgba(0,19,164,0.18),transparent_50%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-primary backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                רגעים קצרים
              </div>
              <h2 className="font-serif text-4xl font-black text-white md:text-5xl">קליפים מהקהילה</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
              רגעים, קטעים ומסרים קצרים ישירות מלב הקהילה.
            </p>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 md:justify-start" style={{ scrollbarWidth: "none" }}>
            {shortsData.map((short) => (
              <ShortCard key={short.id} short={short} onClick={() => setActiveId(short.id)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
