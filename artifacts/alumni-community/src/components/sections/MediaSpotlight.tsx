import { useEffect, useRef } from "react";
import { Camera, FileText, Play, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { pdfs, photos, videos } from "@/content/community";

const items = [
  { label: "גלריה חדשה", title: photos[0].title, image: photos[0].src, href: "/photos", icon: Camera },
  { label: "וידאו נבחר", title: videos[0].title, image: videos[0].image, href: "/videos", icon: Play },
  { label: "עלון אחרון", title: pdfs[0].title, image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop", href: "/library", icon: FileText },
];

function SpotlightCard({ item, index, large }: { item: typeof items[0]; index: number; large?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
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

  const Icon = item.icon;
  return (
    <Link
      ref={ref as any}
      href={item.href}
      className={`sr sr-delay-${index + 1} group relative overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-[0_25px_70px_rgba(0,0,0,0.42)] transition-all duration-500 hover:-translate-y-2 hover:border-primary/35 hover:shadow-[0_0_60px_rgba(245,192,55,0.16),0_35px_90px_rgba(0,0,0,0.55)] ${large ? "min-h-[420px]" : "min-h-[240px]"}`}
    >
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover opacity-55 transition-all duration-700 group-hover:scale-108 group-hover:opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/45 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

      <div className="relative flex h-full min-h-inherit flex-col justify-end p-6 md:p-7">
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-black/50 px-4 py-2 text-sm font-bold text-primary backdrop-blur-md transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
          <Icon className="h-4 w-4" />
          {item.label}
        </span>
        <h3 className="font-serif text-2xl font-black text-white md:text-3xl leading-snug line-clamp-2">{item.title}</h3>
        <div className="mt-3 flex items-center gap-1.5 text-sm text-white/50 transition-all duration-300 group-hover:text-primary">
          <span>לצפייה</span>
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function MediaSpotlight() {
  return (
    <section className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl space-y-8 md:space-y-12">
        <div>
          <p className="text-xs font-black tracking-[0.28em] text-blue-brand md:text-sm uppercase">זרקור מדיה</p>
          <h2 className="mt-2 text-3xl font-black text-white md:mt-3 md:text-5xl leading-tight">הדברים החדשים ביותר</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:hidden" style={{ scrollbarWidth: "none" }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative flex-shrink-0 w-56 h-48 overflow-hidden rounded-2xl border border-white/10 snap-start transition-all active:scale-95"
              >
                <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-4">
                  <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/35 bg-black/55 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md">
                    <Icon className="h-3 w-3" />
                    {item.label}
                  </span>
                  <h3 className="font-serif text-base font-black text-white leading-snug line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <SpotlightCard key={item.title} item={item} index={index} large={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
