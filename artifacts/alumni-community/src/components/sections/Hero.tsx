import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, Sparkles } from "lucide-react";
import logoUrl from "@assets/מאירים_לוגו_1775980957378.png";

const navLinks = [
  { label: "עדכונים", href: "#updates" },
  { label: "גלריה", href: "#gallery" },
  { label: "וידאו", href: "#video" },
  { label: "מסמכים", href: "#library" },
  { label: "קהילה", href: "#feed" },
];

const stats = [
  { value: "1,200+", label: "בוגרים מחוברים" },
  { value: "38", label: "מחזורים" },
  { value: "24/7", label: "עדכונים וקהילה" },
];

export default function Hero() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_28%,rgba(252,224,119,0.22),transparent_24%),radial-gradient(circle_at_18%_62%,rgba(0,19,164,0.28),transparent_30%),linear-gradient(to_bottom,rgba(4,5,10,0.38),hsl(var(--background))_86%)]" />
        <div className="absolute inset-x-[-20%] top-[6%] h-44 rotate-[-8deg] bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-3xl" />
        <div className="absolute inset-x-[-20%] top-[26%] h-32 rotate-[7deg] bg-gradient-to-r from-transparent via-blue-700/25 to-transparent blur-3xl" />
        <img
          src="https://images.unsplash.com/photo-1548625361-ec853f66c986?q=80&w=2070&auto=format&fit=crop"
          alt="אולם מכובד ומואר"
          className="h-full w-full scale-110 object-cover opacity-30 saturate-125 animate-[pulse_18s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.06)_38%,transparent_48%)] opacity-40" />
      </div>

      <header className="absolute inset-x-0 top-0 z-30 px-5 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/30 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:px-6">
          <a href="#" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-primary/30 bg-gradient-to-b from-white/10 to-primary/10 shadow-[0_0_30px_rgba(245,192,55,0.18)]">
              <img src={logoUrl} alt="מאירים" className="h-10 w-10 object-contain" />
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-serif text-xl font-bold text-white">מאירים</span>
              <span className="text-xs text-muted-foreground">קהילת הבוגרים</span>
            </span>
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-primary">
                {link.label}
              </a>
            ))}
          </nav>
          <a href="#updates" className="rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary shadow-[0_0_24px_rgba(245,192,55,0.14)] transition hover:bg-primary hover:text-primary-foreground">
            כניסה
          </a>
        </div>
      </header>

      <div className="relative z-20 mx-auto flex min-h-[100dvh] max-w-7xl flex-col items-center justify-center px-6 pb-24 pt-36 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="mx-auto mb-8 max-w-2xl rounded-[2rem] border border-white/10 bg-black/25 p-4 shadow-[0_0_80px_rgba(245,192,55,0.12)] backdrop-blur-xl md:p-5">
            <img src={logoUrl} alt="לוגו מאירים" className="mx-auto h-auto w-full max-w-[520px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)]" />
          </div>

          <div className="mx-auto mb-6 inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/10 px-5 py-2 text-sm font-medium tracking-[0.22em] text-primary shadow-[0_0_30px_rgba(245,192,55,0.12)]">
            <Sparkles className="h-4 w-4" />
            היכל הזיכרון והחיבור
          </div>

          <h1 className="brand-title text-6xl font-black leading-tight text-white md:text-8xl lg:text-9xl">
            קהילת הבוגרים
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
            חיבור לדורות, צמיחה מתוך שורשים, וזיכרונות שנשארים לתמיד. המקום שלכם בקהילה שלנו.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={scrollToContent}
              className="group rounded-full border border-primary/40 bg-gradient-to-l from-primary via-gold-light to-primary px-9 py-7 text-lg font-bold text-primary-foreground shadow-[0_0_44px_rgba(245,192,55,0.32)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_70px_rgba(245,192,55,0.48)]"
            >
              לכניסה לעדכונים
              <ArrowLeft className="mr-2 h-5 w-5 transition group-hover:-translate-x-1" />
            </Button>
            <a href="#gallery" className="rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-lg text-white backdrop-blur-xl transition hover:border-blue-brand/60 hover:bg-blue-brand/20 hover:text-primary">
              לצפייה בגלריה
            </a>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-xl">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l border-white/10 p-4 last:border-l-0 md:p-6">
                <div className="gold-gradient-text font-serif text-2xl font-black md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 cursor-pointer animate-bounce" onClick={scrollToContent}>
        <ChevronDown className="h-8 w-8 text-primary/70" />
      </div>
    </section>
  );
}
