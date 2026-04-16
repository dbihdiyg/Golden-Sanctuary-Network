import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Menu, MessageCircle, X, LogIn, LayoutDashboard } from "lucide-react";
import { contact, navLinks } from "@/content/community";
import { useUser, Show } from "@clerk/react";

const logoUrl = "/logo-new.png";

function AuthButtons({ mobile = false }: { mobile?: boolean }) {
  const { user } = useUser();

  if (mobile) {
    return (
      <>
        <Show when="signed-out">
          <Link href="/sign-in" className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 px-6 py-4 text-lg text-white transition hover:border-primary/40 hover:text-primary">
            <LogIn className="h-5 w-5" />
            כניסה לאזור האישי
          </Link>
        </Show>
        <Show when="signed-in">
          <Link href="/portal" className="flex items-center justify-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-6 py-4 text-lg font-bold text-primary">
            <LayoutDashboard className="h-5 w-5" />
            {user?.firstName || "האזור האישי שלי"}
          </Link>
        </Show>
      </>
    );
  }

  return (
    <>
      <Show when="signed-out">
        <Link href="/sign-in" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition hover:border-primary/40 hover:text-primary inline-flex items-center gap-1.5">
          <LogIn className="h-3.5 w-3.5" />
          כניסה
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href="/portal" className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
          {user?.imageUrl
            ? <img src={user.imageUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
            : <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">{user?.firstName?.[0] || "א"}</span>
          }
          {user?.firstName || "האזור שלי"}
        </Link>
      </Show>
    </>
  );
}

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) => location === href || (href !== "/" && location.startsWith(href));

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-5 transition-all duration-500`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-3 py-2.5 transition-all duration-500 md:px-5 ${
          scrolled
            ? "border border-white/14 bg-background/90 shadow-[0_24px_100px_rgba(0,0,0,0.65)] backdrop-blur-3xl"
            : "border border-white/8 bg-background/55 shadow-[0_16px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
        }`}>
          <Link href="/" className="flex min-w-0 items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
            <img src={logoUrl} alt="מאירים" className="h-10 w-auto max-w-[150px] object-contain transition-all duration-300" />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3.5 py-2 text-sm transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive(link.href) && (
                  <span className="absolute inset-0 rounded-full bg-primary/10 border border-primary/20" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={contact.email}
              className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-all duration-300 hover:border-primary/40 hover:text-primary md:inline-flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              אימייל
            </a>
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-sm font-bold text-primary shadow-[0_0_20px_rgba(245,192,55,0.12)] transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_32px_rgba(245,192,55,0.28)] sm:inline-flex items-center gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              וואטסאפ
            </a>
            <AuthButtons />
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition-all duration-300 hover:bg-white/10 hover:border-primary/30 lg:hidden"
              aria-label="תפריט"
            >
              {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col bg-background/97 backdrop-blur-3xl pt-24 px-5 pb-10 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,192,55,0.07),transparent_55%)]" />
          <div className="absolute inset-x-0 top-[5.5rem] h-px gold-divider" />

          <nav className="relative flex flex-col gap-1.5 pt-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-5 py-4 text-xl font-bold transition-all duration-300 ${
                  isActive(link.href)
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "text-white/85 hover:bg-white/[0.06] hover:text-white border border-transparent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="relative mt-auto flex flex-col gap-3 pt-8 border-t border-white/10">
            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-lg font-black text-primary-foreground shadow-[0_0_40px_rgba(245,192,55,0.25)] transition hover:shadow-[0_0_60px_rgba(245,192,55,0.4)] active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              וואטסאפ
            </a>
            <a
              href={contact.email}
              className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-lg text-white/80 transition hover:border-white/30 hover:text-white"
            >
              <Mail className="h-5 w-5" />
              אימייל
            </a>
            <AuthButtons mobile />
          </div>
        </div>
      )}
    </>
  );
}
