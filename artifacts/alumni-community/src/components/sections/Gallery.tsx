import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import ShareButton from "@/components/ShareButton";

const photos = [
  {
    src: "/event-gathering2.jpg",
    title: "ערב מפגש הבוגרים — רגעים של קהילה",
    className: "md:row-span-2",
  },
  {
    src: "/event-invite.jpg",
    title: "הזמנה לערב בוגרים",
    className: "",
  },
  {
    src: "/event-table-set.jpg",
    title: "השולחן ערוך לכבוד מפגש הבוגרים",
    className: "md:row-span-2",
  },
  {
    src: "/event-gathering1.jpg",
    title: "בוגרים מסביב לשולחן — חיבור וחברותא",
    className: "",
  },
  {
    src: "/event-food.jpg",
    title: "השולחן הגדוש — ליל הסעודה",
    className: "",
  },
];

export default function Gallery() {
  const [selected, setSelected] = useState<(typeof photos)[number] | null>(null);

  return (
    <section className="relative overflow-hidden px-4 py-12 md:px-6 md:py-24" id="gallery">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">גלריית זיכרונות</p>
          <h2 className="inline-block gold-gradient-text text-4xl font-black md:text-6xl">רגעים שנשארים בלב</h2>
          <p className="leading-relaxed text-muted-foreground">
            מבט אל המפגשים, החיבורים והרגעים הקטנים שמספרים את הסיפור הגדול של הקהילה.
          </p>
          <div className="flex justify-center pt-1">
            <ShareButton sectionId="gallery" label="גלריית זיכרונות" />
          </div>
        </div>

        <div className="grid auto-rows-[160px] md:auto-rows-[220px] grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
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
