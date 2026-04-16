import { Mail, MapPin, MessageCircle, Phone, ShieldCheck, Youtube, Heart } from "lucide-react";
import { Link } from "wouter";
import { contact, navLinks } from "@/content/community";

const logoUrl = "/logo-new.png";

const quickLinks = navLinks.slice(0, Math.ceil(navLinks.length / 2));
const moreLinks = navLinks.slice(Math.ceil(navLinks.length / 2));

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 pt-16 pb-8 px-6">
      <div className="gold-divider-strong absolute inset-x-0 top-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(245,192,55,0.07),transparent_55%),radial-gradient(circle_at_10%_60%,rgba(0,19,164,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="space-y-5">
            <div className="relative inline-block">
              <div className="absolute -inset-4 rounded-3xl bg-primary/6 blur-2xl" />
              <img
                src={logoUrl}
                alt="מאירים"
                className="relative h-auto w-64 max-w-full object-contain drop-shadow-[0_0_24px_rgba(245,192,55,0.35)]"
              />
            </div>
            <p className="max-w-xs leading-relaxed text-muted-foreground text-sm">
              בית דיגיטלי לבוגרים — עדכונים, זיכרונות, חיבורים ותוכן שממשיך את הדרך המשותפת.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={contact.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="group grid h-10 w-10 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-all duration-300 hover:bg-primary hover:border-primary hover:text-primary-foreground hover:shadow-[0_0_24px_rgba(245,192,55,0.3)]"
              >
                <MessageCircle className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://www.youtube.com/@%D7%91%D7%95%D7%92%D7%A8%D7%99-%D7%9E%D7%90%D7%99%D7%A8%D7%99%D7%9D"
                target="_blank"
                rel="noreferrer"
                className="group grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                <Youtube className="h-4.5 w-4.5" />
              </a>
              <a
                href={contact.email}
                className="group grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          <nav className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.25em] text-primary uppercase">ניווט מהיר</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:pr-1 flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.25em] text-primary uppercase">עוד</h3>
            <ul className="space-y-2.5">
              {moreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-all duration-300 hover:text-primary flex items-center gap-1.5 group"
                  >
                    <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/forum" className="text-sm text-muted-foreground transition-all duration-300 hover:text-primary flex items-center gap-1.5 group">
                  <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-3" />
                  פורום
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.25em] text-primary uppercase">יצירת קשר</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={contact.email}
                  className="group flex items-center gap-3 text-sm text-muted-foreground transition-all duration-300 hover:text-primary"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  O462272103@GMAIL.COM
                </a>
              </li>
              <li>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-primary">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  03-306-5092
                </p>
              </li>
              <li>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-primary">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  מגדל העמק
                </p>
              </li>
              <li className="pt-1">
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_28px_rgba(245,192,55,0.25)]"
                >
                  <MessageCircle className="h-4 w-4" />
                  וואטסאפ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
              <span className="text-xs text-muted-foreground/70">
                © 2026 קהילת הבוגרים — כל הזכויות שמורות.
              </span>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground/60 transition-all duration-300 hover:border-primary/40 hover:text-primary"
              >
                <ShieldCheck className="h-3 w-3" />
                כניסת מנהל
              </Link>
            </div>
            <a
              href="https://wa.me/972555030580"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground/70 transition-all duration-300 hover:border-white/20 hover:text-white/90 group"
            >
              <Heart className="h-3 w-3 text-primary/60 group-hover:text-primary transition-colors" />
              <span>עיצוב ובנייה: <strong className="text-white/80">שימיפיקס</strong></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
