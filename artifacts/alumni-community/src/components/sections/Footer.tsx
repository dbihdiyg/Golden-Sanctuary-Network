import { Mail, MapPin, Phone } from "lucide-react";

const links = ["עדכונים", "גלריה", "וידאו", "ספריית PDF", "קהילה"];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-6 py-14">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl font-bold text-white">קהילת הבוגרים</h2>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            בית דיגיטלי לבוגרים: עדכונים, זיכרונות, חיבורים ותוכן שממשיך את הדרך המשותפת.
          </p>
        </div>

        <nav className="space-y-4">
          <h3 className="text-sm font-medium tracking-[0.2em] text-primary">ניווט</h3>
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <a key={link} href="#updates" className="text-muted-foreground transition hover:text-primary">
                {link}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          <h3 className="text-sm font-medium tracking-[0.2em] text-primary">יצירת קשר</h3>
          <div className="space-y-3 text-muted-foreground">
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> alumni@example.org</p>
            <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> 02-000-0000</p>
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> ירושלים</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-center text-sm text-muted-foreground">
        © 2026 קהילת הבוגרים. כל הזכויות שמורות.
      </div>
    </footer>
  );
}