import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "wouter";
import { contact, navLinks } from "@/content/community";

const logoUrl = "/logo-new.png";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 px-6 py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/60 to-transparent" />
      <div className="absolute bottom-[-35%] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-2xl bg-primary/12 blur-xl" />
            <img src={logoUrl} alt="מאירים" className="relative h-auto w-72 max-w-full object-contain drop-shadow-[0_0_28px_rgba(245,192,55,0.4)] drop-shadow-[0_10px_22px_rgba(0,0,0,0.6)]" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">קהילת הבוגרים</h2>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            בית דיגיטלי לבוגרים: עדכונים, זיכרונות, חיבורים ותוכן שממשיך את הדרך המשותפת.
          </p>
        </div>

        <nav className="space-y-4">
          <h3 className="text-sm font-medium tracking-[0.2em] text-primary">ניווט</h3>
          <div className="flex flex-wrap gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-muted-foreground transition hover:text-primary">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          <h3 className="text-sm font-medium tracking-[0.2em] text-primary">יצירת קשר</h3>
          <div className="space-y-3 text-muted-foreground">
            <a href={contact.email} className="flex items-center gap-3 transition hover:text-primary"><Mail className="h-4 w-4 text-primary" /> O462272103@GMAIL.COM</a>
            <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> 02-000-0000</p>
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> ירושלים</p>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary/35 px-5 py-2 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground">
              וואטסאפ
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <span>© 2026 קהילת הבוגרים. כל הזכויות שמורות.</span>
          <a
            href="https://wa.me/972555030580"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 transition hover:border-primary/40 hover:text-primary"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            <span>עיצוב ובנייה: <strong className="text-white">שימיפיקס</strong> — גרפיקאי ועורך וידאו</span>
          </a>
        </div>
      </div>
    </footer>
  );
}