import { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ShareButton from "@/components/ShareButton";

interface Photo {
  id?: number;
  src?: string;
  url?: string;
  title: string;
  className?: string;
  tag?: string;
}

const FALLBACK_PHOTOS: Photo[] = [
  { src: "/event-gathering2.jpg", title: "ערב מפגש הבוגרים — רגעים של קהילה", className: "md:row-span-2" },
  { src: "/event-invite.jpg", title: "הזמנה לערב בוגרים", className: "" },
  { src: "/event-table-set.jpg", title: "השולחן ערוך לכבוד מפגש הבוגרים", className: "md:row-span-2" },
  { src: "/event-gathering1.jpg", title: "בוגרים מסביב לשולחן — חיבור וחברותא", className: "" },
  { src: "/event-food.jpg", title: "השולחן הגדוש — ליל הסעודה", className: "" },
];

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/cms/gallery")
      .then(r => r.ok ? r.json() : null)
      .then((data: { id: number; url: string; title: string; tag?: string }[] | null) => {
        if (data && data.length > 0) {
          setPhotos(data.map((d, i) => ({
            id: d.id,
            src: d.url,
            url: d.url,
            title: d.title,
            tag: d.tag,
            className: i % 5 === 0 || i % 5 === 2 ? "md:row-span-2" : "",
          })));
        } else {
          setPhotos(FALLBACK_PHOTOS);
        }
      })
      .catch(() => setPhotos(FALLBACK_PHOTOS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("sr-visible"); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected === null) return;
      if (e.key === "ArrowLeft") setSelected((s) => s !== null ? (s + 1) % photos.length : null);
      if (e.key === "ArrowRight") setSelected((s) => s !== null ? (s - 1 + photos.length) % photos.length : null);
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, photos.length]);

  return (
    <section ref={sectionRef as any} className="sr relative overflow-hidden px-4 py-20 md:px-6 md:py-28" id="gallery">
      <div className="gold-divider absolute inset-x-0 top-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(0,19,164,0.14),transparent_55%),radial-gradient(ellipse_at_80%_50%,rgba(245,192,55,0.06),transparent_45%)]" />

      <div className="mx-auto max-w-6xl space-y-14">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <div className="section-ornament">
            <p className="text-xs font-black tracking-[0.3em] text-blue-brand uppercase">גלריית זיכרונות</p>
          </div>
          <h2 className="gold-gradient-text text-4xl font-black md:text-5xl leading-tight">רגעים שנשארים בלב</h2>
          <p className="leading-relaxed text-muted-foreground">
            מבט אל המפגשים, החיבורים והרגעים הקטנים שמספרים את הסיפור הגדול של הקהילה.
          </p>
          <div className="flex justify-center pt-1">
            <ShareButton sectionId="gallery" label="גלריית זיכרונות" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid auto-rows-[160px] md:auto-rows-[230px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {photos.map((photo, index) => (
              <button
                key={photo.id ?? photo.src ?? index}
                onClick={() => setSelected(index)}
                className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-card text-right shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_0_60px_rgba(245,192,55,0.18),0_30px_80px_rgba(0,0,0,0.5)] reveal-up ${photo.className ?? ""}`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <img
                  src={photo.src ?? photo.url}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-all duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent transition-all duration-400 group-hover:via-blue-brand/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20" />
                <div className="absolute bottom-0 right-0 left-0 flex items-end justify-between gap-4 p-5 md:p-6">
                  <span className="font-serif text-lg font-bold text-white leading-snug line-clamp-2">{photo.title}</span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-black/30 text-primary backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(245,192,55,0.4)]">
                    <ZoomIn className="h-4.5 w-4.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected !== null && photos[selected] && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4 backdrop-blur-2xl animate-in fade-in duration-250"
          onClick={() => setSelected(null)}
        >
          <button
            aria-label="סגור"
            onClick={() => setSelected(null)}
            className="absolute left-4 top-4 md:left-6 md:top-6 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/8 text-white transition-all duration-300 hover:bg-primary hover:border-primary hover:text-primary-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            aria-label="הקודם"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/8 text-white transition-all duration-300 hover:bg-primary hover:border-primary hover:text-primary-foreground"
            onClick={(e) => { e.stopPropagation(); setSelected((s) => s !== null ? (s - 1 + photos.length) % photos.length : null); }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            aria-label="הבא"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/8 text-white transition-all duration-300 hover:bg-primary hover:border-primary hover:text-primary-foreground"
            onClick={(e) => { e.stopPropagation(); setSelected((s) => s !== null ? (s + 1) % photos.length : null); }}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <figure
            className="max-h-[88vh] max-w-5xl overflow-hidden rounded-[2rem] border border-primary/25 bg-card shadow-[0_0_100px_rgba(245,192,55,0.2)] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selected].src ?? photos[selected].url}
              alt={photos[selected].title}
              className="max-h-[78vh] w-full object-contain"
            />
            <figcaption className="border-t border-white/10 p-5 text-center font-serif text-xl text-primary">
              {photos[selected].title}
            </figcaption>
          </figure>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelected(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === selected ? "w-6 bg-primary" : "w-1.5 bg-white/25 hover:bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
