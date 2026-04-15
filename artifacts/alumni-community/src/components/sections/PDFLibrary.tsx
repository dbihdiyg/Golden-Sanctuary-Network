import { Download, FileText, Eye } from "lucide-react";
import { pdfs } from "@/content/community";

export default function PDFLibrary() {
  return (
    <section className="px-4 py-12 md:px-6 md:py-24" id="library">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">ספריית מסמכים</p>
          <h2 className="inline-block gold-gradient-text text-4xl font-black md:text-6xl">קבצים להורדה</h2>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.025] shadow-[0_35px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          {pdfs.map((file, index) => (
            <div
              key={file.title}
              className="group flex flex-col gap-5 border-b border-white/10 p-6 transition duration-300 last:border-b-0 hover:bg-blue-brand/[0.16] md:flex-row md:items-center md:justify-between reveal-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center gap-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary/35 bg-primary/10 text-primary shadow-[0_0_28px_rgba(245,192,55,0.12)] transition group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">{file.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{file.date} · PDF</p>
                  {file.description && (
                    <p className="mt-1 text-xs text-muted-foreground/70 max-w-md line-clamp-1">{file.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {file.url ? (
                  <>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:text-white hover:border-white/40"
                    >
                      צפייה
                      <Eye className="h-4 w-4" />
                    </a>
                    <a
                      href={file.url}
                      download
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_32px_rgba(245,192,55,0.25)]"
                    >
                      הורדה
                      <Download className="h-4 w-4" />
                    </a>
                  </>
                ) : (
                  <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-bold text-muted-foreground/40 cursor-not-allowed">
                    בקרוב
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
