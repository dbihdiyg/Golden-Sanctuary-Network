import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, HelpCircle, Mail, MessageCircle, Send, Sparkles } from "lucide-react";
import { contact } from "@/content/community";
import { useEffect, useRef, useState } from "react";

const logoUrl = "/logo-new.png";

const stats = [
  { target: 1200, formatted: (n: number) => n >= 1200 ? "1,200+" : n.toLocaleString(), label: "בוגרים מחוברים" },
  { target: 38, formatted: (n: number) => String(n), label: "מחזורים" },
  { target: 24, formatted: (n: number) => n >= 24 ? "24/6" : String(n), label: "עדכונים וקהילה" },
];

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function AnimatedStat({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const { count, ref } = useCountUp(stat.target);
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center p-5 md:p-7 ${
        index < stats.length - 1 ? "border-l border-white/10" : ""
      }`}
    >
      <div className="gold-gradient-text font-serif text-2xl font-black md:text-4xl tabular-nums">
        {stat.formatted(count)}
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground md:text-sm">{stat.label}</div>
    </div>
  );
}

const heroActions = [
  { label: "וואטסאפ", text: "מענה מהיר", href: contact.whatsapp, icon: MessageCircle, external: true },
  { label: "אימייל", text: "פנייה מסודרת", href: contact.email, icon: Mail },
  { label: "שאל את הרב", text: "שאלה אישית", href: "/ask-rabbi", icon: HelpCircle },
  { label: "הצטרפות לעדכונים", text: "להישאר מחוברים", href: "/join", icon: Send },
];

export default function Hero() {
  const scrollToContent = () => {
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_24%,rgba(255,231,145,0.30),transparent_22%),radial-gradient(circle_at_18%_62%,rgba(0,19,164,0.38),transparent_32%),radial-gradient(circle_at_86%_46%,rgba(245,192,55,0.14),transparent_25%),linear-gradient(to_bottom,rgba(4,5,10,0.22),hsl(var(--background))_88%)]" />
        <div className="premium-sweep absolute inset-y-0 right-[-35%] z-20 w-[42%] rotate-[12deg] bg-gradient-to-l from-transparent via-white/14 to-transparent blur-xl" />
        <div className="absolute inset-x-[-20%] top-[4%] h-52 rotate-[-8deg] bg-gradient-to-r from-transparent via-primary/26 to-transparent blur-3xl" />
        <div className="absolute inset-x-[-20%] top-[27%] h-40 rotate-[7deg] bg-gradient-to-r from-transparent via-blue-brand/32 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-[48%] h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/8 shadow-[inset_0_0_100px_rgba(245,192,55,0.08),0_0_120px_rgba(0,19,164,0.1)]" style={{ animation: "breathe 10s ease-in-out infinite" }} />
        <div className="absolute left-1/2 top-[48%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
        <img
          src="https://images.unsplash.com/photo-1548625361-ec853f66c986?q=80&w=2070&auto=format&fit=crop"
          alt="אולם מכובד ומואר"
          className="h-full w-full scale-110 object-cover opacity-32 saturate-125 motion-safe:animate-[cinematic-pan_24s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.06)_38%,transparent_48%)] opacity-45" />
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto flex min-h-[100dvh] max-w-7xl flex-col items-center justify-center px-6 pb-12 pt-28 text-center md:pb-16">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">

          {/* Logo */}
          <div className="mx-auto mb-6 max-w-4xl px-4">
            <img
              src={logoUrl}
              alt="לוגו מאירים"
              className="mx-auto h-auto w-full max-w-[700px] object-contain drop-shadow-[0_0_60px_rgba(245,192,55,0.25)]"
            />
          </div>

          {/* Badge */}
          <div className="mx-auto mb-5 inline-flex items-center gap-2.5 rounded-full border border-primary/35 bg-primary/10 px-6 py-3 text-sm font-bold tracking-[0.28em] text-primary shadow-[0_0_42px_rgba(245,192,55,0.18)] backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            היכל הזיכרון והחיבור
          </div>

          {/* Subtitle */}
          <p className="mx-auto mt-2 max-w-3xl text-xl leading-relaxed text-white/75 md:text-2xl">
            בית דיגיטלי יוקרתי וחי לבוגרים — זיכרונות, שיעורים, עדכונים וחיבורים שממשיכים להאיר את הדרך.
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={scrollToContent}
              className="group rounded-full border border-primary/50 bg-gradient-to-l from-[#bb7c05] via-gold-light to-primary px-10 py-7 text-lg font-black text-primary-foreground shadow-[0_0_54px_rgba(245,192,55,0.40)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_80px_rgba(245,192,55,0.60)]"
            >
              כניסה למרכז הקהילה
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </Button>
            <a
              href="/photos"
              className="rounded-full border border-white/16 bg-white/[0.05] px-9 py-4 text-lg font-bold text-white shadow-[0_18px_70px_rgba(0,19,164,0.20)] backdrop-blur-xl transition-all duration-400 hover:border-blue-brand/60 hover:bg-blue-brand/22 hover:text-primary"
            >
              לצפייה בתוכן החדש
            </a>
          </div>

          {/* Action Grid */}
          <div className="mx-auto mt-9 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {heroActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noreferrer" : undefined}
                  className="group rounded-[1.4rem] border border-white/10 bg-background/45 p-4 text-right shadow-[0_16px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_40px_rgba(245,192,55,0.15),0_20px_60px_rgba(0,0,0,0.4)] motion-safe:animate-[float-card_7s_ease-in-out_infinite]"
                  style={{ animationDelay: `${index * 220}ms` }}
                >
                  <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-primary/35 bg-primary/12 text-primary shadow-[0_0_24px_rgba(245,192,55,0.14)] transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="block font-serif text-lg font-black text-white">{action.label}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{action.text}</span>
                </a>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mx-auto mt-9 grid max-w-3xl grid-cols-3 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-[0_22px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            {stats.map((stat, i) => (
              <AnimatedStat key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Arrow */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-white/5 p-2 text-primary/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:text-primary animate-bounce"
        aria-label="גלול למטה"
      >
        <ChevronDown className="h-7 w-7" />
      </button>
    </section>
  );
}
