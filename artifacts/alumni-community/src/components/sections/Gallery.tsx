import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1600&auto=format&fit=crop",
    title: "ערב איחוד בבית המדרש",
    className: "md:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1600&auto=format&fit=crop",
    title: "רגעים של לימוד וזיכרון",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
    title: "מפגש דורות בחצר",
    className: "md:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1600&auto=format&fit=crop",
    title: "חברות שנמשכת שנים",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1600&auto=format&fit=crop",
    title: "שמחת הקהילה",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1600&auto=format&fit=crop",
    title: "שולחנות של זיכרונות",
    className: "",
  },
];

export default function Gallery() {
  const [selected, setSelected] = useState<(typeof photos)[number] | null>(null);

  return (
    <section className="relative overflow-hidden px-6 py-28" id="gallery">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">גלריית זיכרונות</p>
          <h2 className="inline-block gold-gradient-text text-4xl font-black md:text-6xl">רגעים שנשארים בלב</h2>
          <p className="leading-relaxed text-muted-foreground">
            מבט אל המפגשים, החיבורים והרגעים הקטנים שמספרים את הסיפור הגדול של הקהילה.
          </p>
        </div>

        <div className="grid auto-rows-[220px] grid-cols-1 gap-5 md:grid-cols-3">
          {photos.map((photo, index) => (
            <button
              key={photo.src}
              onClick={() => setSelected(photo)}
              className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-card text-right shadow-2xl ring-1 ring-primary/0 transition duration-500 hover:-translate-y-1 hover:ring-primary/40 reveal-up ${photo.className}`}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <img src={photo.src} alt={photo.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-blue-brand/10 to-transparent opacity-85 transition group-hover:opacity-95" />
              <div className="absolute bottom-0 right-0 left-0 flex items-end justify-between gap-4 p-6">
                <span className="font-serif text-xl font-bold text-white">{photo.title}</span>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-[0_0_25px_rgba(245,192,55,0.16)] backdrop-blur-md transition group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <ZoomIn className="h-5 w-5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/92 p-5 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelected(null)}
        >
          <button
            aria-label="סגירה"
            onClick={() => setSelected(null)}
            className="absolute left-6 top-6 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-primary hover:text-primary-foreground"
          >
            <X className="h-6 w-6" />
          </button>
          <figure className="max-h-[86vh] max-w-6xl overflow-hidden rounded-[2rem] border border-primary/30 bg-card shadow-[0_0_100px_rgba(245,192,55,0.25)]" onClick={(event) => event.stopPropagation()}>
            <img src={selected.src} alt={selected.title} className="max-h-[78vh] w-full object-contain" />
            <figcaption className="border-t border-white/10 p-5 text-center font-serif text-2xl text-primary">{selected.title}</figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}