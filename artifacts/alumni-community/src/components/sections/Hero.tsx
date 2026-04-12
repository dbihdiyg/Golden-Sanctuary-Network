import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, HelpCircle, Mail, MessageCircle, Send, Sparkles } from "lucide-react";
import { contact } from "@/content/community";

const logoUrl = "/logo-new.png";

const stats = [
  { value: "1,200+", label: "בוגרים מחוברים" },
  { value: "38", label: "מחזורים" },
  { value: "24/7", label: "עדכונים וקהילה" },
];

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
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_24%,rgba(255,231,145,0.28),transparent_22%),radial-gradient(circle_at_18%_62%,rgba(0,19,164,0.35),transparent_32%),radial-gradient(circle_at_86%_46%,rgba(245,192,55,0.13),transparent_25%),linear-gradient(to_bottom,rgba(4,5,10,0.26),hsl(var(--background))_88%)]" />
        <div className="premium-sweep absolute inset-y-0 right-[-35%] z-20 w-[42%] rotate-[12deg] bg-gradient-to-l from-transparent via-white/16 to-transparent blur-xl" />
        <div className="absolute inset-x-[-20%] top-[4%] h-52 rotate-[-8deg] bg-gradient-to-r from-transparent via-primary/28 to-transparent blur-3xl" />
        <div className="absolute inset-x-[-20%] top-[27%] h-40 rotate-[7deg] bg-gradient-to-r from-transparent via-blue-brand/35 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-[48%] h-[780px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 shadow-[inset_0_0_90px_rgba(245,192,55,0.09),0_0_110px_rgba(0,19,164,0.12)]" />
        <div className="absolute left-1/2 top-[48%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6" />
        <img
          src="https://images.unsplash.com/photo-1548625361-ec853f66c986?q=80&w=2070&auto=format&fit=crop"
          alt="אולם מכובד ומואר"
          className="h-full w-full scale-110 object-cover opacity-36 saturate-125 motion-safe:animate-[cinematic-pan_24s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_38%,transparent_48%)] opacity-45" />
      </div>

      <div className="relative z-20 mx-auto flex min-h-[100dvh] max-w-7xl flex-col items-center justify-center px-6 pb-12 pt-28 text-center md:pb-16">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mx-auto mb-7 max-w-4xl px-4">
            <img
              src={logoUrl}
              alt="לוגו מאירים"
              className="mx-auto h-auto w-full max-w-[700px] object-contain"
            />
          </div>

          <div className="mx-auto mb-5 inline-flex items-center gap-3 rounded-full border border-primary/35 bg-primary/12 px-6 py-3 text-sm font-bold tracking-[0.26em] text-primary shadow-[0_0_42px_rgba(245,192,55,0.2)] backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            היכל הזיכרון והחיבור
          </div>

          <p className="mx-auto mt-2 max-w-4xl text-xl leading-relaxed text-white/78 md:text-2xl">
            בית דיגיטלי יוקרתי וחי לבוגרים — זיכרונות, שיעורים, עדכונים וחיבורים שממשיכים להאיר את הדרך.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={scrollToContent}
              className="group rounded-full border border-primary/50 bg-gradient-to-l from-[#bb7c05] via-gold-light to-primary px-10 py-7 text-lg font-black text-primary-foreground shadow-[0_0_54px_rgba(245,192,55,0.42)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_86px_rgba(245,192,55,0.62)]"
            >
              כניסה למרכז הקהילה
              <ArrowLeft className="mr-2 h-5 w-5 transition group-hover:-translate-x-1" />
            </Button>
            <a href="/photos" className="rounded-full border border-white/18 bg-white/[0.055] px-9 py-4 text-lg font-bold text-white shadow-[0_18px_70px_rgba(0,19,164,0.22)] backdrop-blur-xl transition hover:border-blue-brand/70 hover:bg-blue-brand/28 hover:text-primary">
              לצפייה בתוכן החדש
            </a>
          </div>

          <div className="mx-auto mt-9 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {heroActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noreferrer" : undefined}
                  className="group rounded-[1.4rem] border border-white/12 bg-background/50 p-4 text-right shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-primary/55 hover:bg-primary/12 motion-safe:animate-[float-card_7s_ease-in-out_infinite]"
                  style={{ animationDelay: `${index * 220}ms` }}
                >
                  <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-primary/35 bg-primary/14 text-primary shadow-[0_0_28px_rgba(245,192,55,0.16)] transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="block font-serif text-lg font-black text-white">{action.label}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{action.text}</span>
                </a>
              );
            })}
          </div>

          <div className="mx-auto mt-9 grid max-w-3xl grid-cols-3 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-[0_22px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
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
