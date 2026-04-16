import { useEffect, useRef } from "react";
import { Download, FileText, Eye, BookOpen } from "lucide-react";
import { pdfs } from "@/content/community";
import ShareButton from "@/components/ShareButton";

function PDFRow({ file, index }: { file: typeof pdfs[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("sr-visible"); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sr sr-delay-${Math.min(index + 1, 6)} group flex flex-col gap-4 border-b border-white/8 p-5 md:p-6 transition-all duration-400 last:border-b-0 md:flex-row md:items-center md:justify-between hover:bg-white/[0.04]`}
    >
      <div className="flex items-center gap-4">
        <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary/30 bg-primary/8 text-primary shadow-[0_0_20px_rgba(245,192,55,0.08)] transition-all duration-400 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_32px_rgba(245,192,55,0.2)]">
          <FileText className="h-6 w-6" />
          <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-background border border-white/15 px-1.5 py-0.5 text-[9px] font-black text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-white leading-snug">{file.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>{file.date}</span>
            <span className="opacity-40">·</span>
            <span className="uppercase font-bold tracking-wider text-primary/60">PDF</span>
          </div>
          {file.description && (
            <p className="mt-1.5 text-xs text-muted-foreground/65 max-w-md line-clamp-1">{file.description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 shrink-0 mr-18 md:mr-0">
        {file.url ? (
          <>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-muted-foreground transition-all duration-300 hover:text-white hover:border-white/35 hover:bg-white/[0.08]"
            >
              <Eye className="h-4 w-4" />
              צפייה
            </a>
            <a
              href={file.url}
              download
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/8 px-4 py-2.5 text-sm font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_28px_rgba(245,192,55,0.25)]"
            >
              <Download className="h-4 w-4" />
              הורדה
            </a>
          </>
        ) : (
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/8 px-4 py-2.5 text-sm font-bold text-muted-foreground/40 cursor-not-allowed">
            בקרוב
          </span>
        )}
      </div>
    </div>
  );
}

export default function PDFLibrary() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28" id="library">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="space-y-4 text-center">
          <div className="section-ornament">
            <p className="text-xs font-black tracking-[0.3em] text-blue-brand uppercase">ספריית מסמכים</p>
          </div>
          <h2 className="gold-gradient-text text-4xl font-black md:text-5xl leading-tight">קבצים להורדה</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            גליונות, עלונים ומסמכים קהילתיים לקריאה ולשמירה
          </p>
          <div className="flex justify-center pt-1">
            <ShareButton sectionId="library" label="ספריית גליונות" />
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_35px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          {pdfs.map((file, index) => (
            <PDFRow key={file.title} file={file} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
