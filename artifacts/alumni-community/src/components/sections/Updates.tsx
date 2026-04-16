import { useEffect, useRef } from "react";
import { updates } from "@/content/community";
import ShareButton from "@/components/ShareButton";
import { Calendar, Tag } from "lucide-react";

function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("sr-visible"); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
}

function UpdateCard({ update, index }: { update: typeof updates[0]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref as React.RefObject<HTMLElement>);
  const mourning = (update as any).mourning;

  return (
    <article
      ref={ref as any}
      className={`sr sr-delay-${Math.min(index + 1, 6)} group relative overflow-hidden rounded-[1.8rem] border p-7 transition-all duration-500 ${
        mourning
          ? "border-zinc-700/50 bg-zinc-900/60 grayscale"
          : "border-white/10 bg-white/[0.04] hover:border-primary/30 hover:bg-white/[0.07] hover:shadow-[0_0_50px_rgba(245,192,55,0.1),0_20px_60px_rgba(0,0,0,0.3)]"
      }`}
    >
      {!mourning && (
        <div className="absolute right-0 top-0 bottom-0 w-0.5 rounded-r-full bg-gradient-to-b from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border ${
          mourning
            ? "border-zinc-600/60 text-zinc-400 bg-zinc-800/50"
            : "border-primary/30 text-primary bg-primary/8"
        }`}>
          <Tag className="h-3 w-3" />
          {update.category}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {update.date}
        </span>
      </div>
      <h3 className={`font-serif text-2xl font-black mb-3 leading-snug ${
        mourning ? "text-zinc-300" : "text-white"
      }`}>{update.title}</h3>
      <p className={`leading-relaxed text-base ${
        mourning ? "text-zinc-400" : "text-muted-foreground"
      }`}>{update.excerpt}</p>
    </article>
  );
}

export default function Updates() {
  if (!updates || updates.length === 0) return null;

  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-28" id="updates">
      <div className="gold-divider absolute inset-x-0 top-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,192,55,0.06),transparent_55%)]" />

      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="section-ornament">
            <p className="text-xs font-black tracking-[0.3em] text-primary uppercase">מה חדש</p>
          </div>
          <h2 className="gold-gradient-text text-4xl font-black md:text-5xl leading-tight">עדכוני קהילה</h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            הישארו מחוברים לכל מה שקורה בקהילה שלנו
          </p>
          <div className="flex justify-center pt-1">
            <ShareButton sectionId="updates" label="עדכוני קהילה" />
          </div>
        </div>

        <div className="space-y-4">
          {updates.map((update, index) => (
            <UpdateCard key={update.id} update={update} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
