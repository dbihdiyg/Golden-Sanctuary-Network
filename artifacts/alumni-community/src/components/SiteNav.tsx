import { Link } from "wouter";
import { Mail, MessageCircle } from "lucide-react";
import { contact, navLinks } from "@/content/community";

const logoUrl = "/logo-new.png";

export default function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-background/62 px-3 py-3 shadow-[0_22px_90px_rgba(0,0,0,0.52)] backdrop-blur-2xl md:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-11 shrink-0 items-center overflow-hidden">
            <span className="absolute inset-0 rounded-xl bg-primary/10 blur-md" />
            <img src={logoUrl} alt="מאירים" className="relative h-11 w-auto max-w-[160px] object-contain drop-shadow-[0_0_14px_rgba(245,192,55,0.45)]" />
          </span>
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
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-primary/35 bg-primary/12 px-4 py-2 text-sm font-bold text-primary shadow-[0_0_24px_rgba(245,192,55,0.14)] transition hover:bg-primary hover:text-primary-foreground">
            וואטסאפ
            <MessageCircle className="mr-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}