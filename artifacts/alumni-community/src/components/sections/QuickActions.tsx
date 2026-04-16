import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { quickActions } from "@/content/community";

function ActionCard({ action, index, total }: { action: typeof quickActions[0]; index: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("sr-visible"); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Icon = action.icon;
  const isFirst = index === 0;
  const isExternal = action.href.startsWith("http") || action.href.startsWith("mailto:");
  const desktopClass = `sr sr-delay-${Math.min(index + 1, 6)} group relative flex min-h-[220px] overflow-hidden rounded-[2rem] border p-7 shadow-[0_25px_80px_rgba(0,0,0,0.36)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_70px_rgba(245,192,55,0.2),0_30px_80px_rgba(0,0,0,0.45)] ${
    isFirst
      ? "border-primary/40 bg-gradient-to-br from-primary/14 via-primary/8 to-transparent"
      : "border-white/10 bg-white/[0.04] hover:border-primary/35 hover:bg-blue-brand/12"
  }`;

  const content = (
    <>
      <span className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/20" />
      <span className="relative flex h-full flex-col justify-between">
        <span className={`grid h-16 w-16 place-items-center rounded-2xl border border-primary/40 bg-primary/12 text-primary shadow-[0_0_32px_rgba(245,192,55,0.18)] transition-all duration-400 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_48px_rgba(245,192,55,0.35)]`}>
          <Icon className="h-8 w-8" />
        </span>
        <span>
          <span className="block font-serif text-3xl font-black text-white leading-tight">{action.title}</span>
          <span className="mt-3 block text-base leading-relaxed text-muted-foreground">{action.text}</span>
        </span>
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        ref={ref as any}
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        className={desktopClass}
      >
        {content}
      </a>
    );
  }
  return (
    <Link ref={ref as any} href={action.href} className={desktopClass}>
      {content}
    </Link>
  );
}

export default function QuickActions() {
  const visibleActions = quickActions.filter((action) => action.title !== "שלחו תמונה או עדכון");

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-0 md:px-6 md:pb-24">
      <div className="absolute inset-0 bg-gradient-to-l from-blue-brand/18 via-transparent to-primary/10" />

      <div className="relative mx-auto max-w-7xl rounded-[2.4rem] border border-primary/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(0,19,164,0.10),rgba(245,192,55,0.05))] p-5 shadow-[0_45px_130px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:rounded-[2.8rem] md:p-10">
        <div className="mb-8 md:mb-10">
          <p className="text-xs font-black tracking-[0.3em] text-primary md:text-sm uppercase">הפעולות החשובות ביותר</p>
          <h2 className="mt-2 text-2xl font-black text-white md:mt-3 md:text-5xl">להתחבר לקהילה</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:hidden">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            const isExternal = action.href.startsWith("http") || action.href.startsWith("mailto:");
            const mobileClass = `group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 transition-all duration-300 active:scale-95 ${index === 0 ? "border-primary/45 bg-primary/14" : "border-white/10 bg-background/62"}`;
            const mobileContent = (
              <>
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/40 bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold leading-tight text-white">{action.title}</span>
              </>
            );
            return isExternal ? (
              <a key={action.title} href={action.href} target={action.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={mobileClass}>{mobileContent}</a>
            ) : (
              <Link key={action.title} href={action.href} className={mobileClass}>{mobileContent}</Link>
            );
          })}
        </div>

        <div className="hidden md:grid gap-5 md:grid-cols-4">
          {visibleActions.map((action, index) => (
            <ActionCard key={action.title} action={action} index={index} total={visibleActions.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
