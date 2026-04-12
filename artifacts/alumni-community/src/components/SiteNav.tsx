import { useState } from "react";
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
          <Link href="/sign-in" className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 px-6 py-4 text-lg text-white">
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
        <Link href="/sign-in" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:border-primary/40 hover:text-primary inline-flex items-center gap-1.5">
          <LogIn className="h-3.5 w-3.5" />
          כניסה
        </Link>
      </Show>
      <Show when="signed-in">
        <Link href="/portal" className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground transition">
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
  const [location] = useLocation();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-background/62 px-3 py-3 shadow-[0_22px_90px_rgba(0,0,0,0.52)] backdrop-blur-2xl md:px-5">
          <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
            <img src={logoUrl} alt="מאירים" className="h-11 w-auto max-w-[160px] object-contain" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={contact.email} className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:border-primary/40 hover:text-primary md:inline-flex">
              אימייל
              <Mail className="mr-2 h-4 w-4" />
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="hidden rounded-full border border-primary/35 bg-primary/12 px-4 py-2 text-sm font-bold text-primary shadow-[0_0_24px_rgba(245,192,55,0.14)] transition hover:bg-primary hover:text-primary-foreground sm:inline-flex">
              וואטסאפ
              <MessageCircle className="mr-2 h-4 w-4" />
            </a>
            <AuthButtons />
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10 lg:hidden"
              aria-label="תפריט"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background/95 backdrop-blur-2xl pt-24 px-6 pb-10 lg:hidden" onClick={() => setOpen(false)}>
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-5 py-4 text-xl font-bold transition ${location === link.href ? "bg-primary/15 text-primary" : "text-white hover:bg-white/[0.06]"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 pt-8 border-t border-white/10">
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground">
              <MessageCircle className="h-5 w-5" />
              וואטסאפ
            </a>
            <a href={contact.email} className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 px-6 py-4 text-lg text-white">
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
