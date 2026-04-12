import { Download, FileText } from "lucide-react";

const files = [
  { title: "עלון קהילת הבוגרים", date: "תשרי תשפ״ה", size: "2.4MB" },
  { title: "סיכום מפגש שנתי", date: "אלול תשפ״ד", size: "1.8MB" },
  { title: "תכנית חונכות בוגרים", date: "אב תשפ״ד", size: "1.1MB" },
  { title: "לוח אירועים ועדכונים", date: "תמוז תשפ״ד", size: "980KB" },
];

export default function PDFLibrary() {
  return (
    <section className="px-4 py-12 md:px-6 md:py-24" id="library">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">ספריית מסמכים</p>
          <h2 className="inline-block gold-gradient-text text-4xl font-black md:text-6xl">קבצים להורדה</h2>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.025] shadow-[0_35px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          {files.map((file, index) => (
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
                  <h3 className="font-serif text-2xl font-bold text-white">{file.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{file.date} · PDF · {file.size}</p>
                </div>
              </div>
              <a
                href={`data:application/pdf,%25PDF-1.4%0A%25 Alumni Community ${encodeURIComponent(file.title)}`}
                download={`${file.title}.pdf`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_32px_rgba(245,192,55,0.25)]"
              >
                הורדה
                <Download className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}