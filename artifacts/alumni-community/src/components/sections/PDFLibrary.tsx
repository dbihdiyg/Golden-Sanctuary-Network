import { Download, FileText } from "lucide-react";

const files = [
  { title: "עלון קהילת הבוגרים", date: "תשרי תשפ״ה", size: "2.4MB" },
  { title: "סיכום מפגש שנתי", date: "אלול תשפ״ד", size: "1.8MB" },
  { title: "תכנית חונכות בוגרים", date: "אב תשפ״ד", size: "1.1MB" },
  { title: "לוח אירועים ועדכונים", date: "תמוז תשפ״ד", size: "980KB" },
];

export default function PDFLibrary() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-medium tracking-[0.25em] text-primary">ספריית מסמכים</p>
          <h2 className="inline-block gold-gradient-text text-4xl font-bold md:text-5xl">קבצים להורדה</h2>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl">
          {files.map((file, index) => (
            <div
              key={file.title}
              className="group flex flex-col gap-5 border-b border-white/10 p-6 transition duration-300 last:border-b-0 hover:bg-primary/[0.06] md:flex-row md:items-center md:justify-between reveal-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center gap-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary transition group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
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
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 px-5 py-3 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
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