import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { categories } from "@/content/community";
import { ArrowLeft } from "lucide-react";

function CategoryCard({ category, index }: { category: typeof categories[0]; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("sr-visible"); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Icon = category.icon;
  const isLarge = index < 2;

  return (
    <Link
      ref={ref as any}
      href={category.href}
      className={`sr group relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-card shadow-[0_30px_95px_rgba(0,0,0,0.42)] transition-all duration-600 hover:-translate-y-3 hover:border-primary/45 hover:shadow-[0_0_80px_rgba(245,192,55,0.2),0_40px_100px_rgba(0,0,0,0.55)] ${
        isLarge ? "min-h-[360px] xl:min-h-[420px]" : "min-h-[285px]"
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <img
        src={category.image}
        alt={category.title}
        className="absolute inset-0 h-full w-full object-cover opacity-40 transition-all duration-1000 group-hover:scale-108 group-hover:opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/62 to-blue-brand/14" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-primary/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full min-h-inherit flex-col justify-between p-7 md:p-8">
        <div className="flex items-center justify-between">
          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-primary/40 bg-primary/12 text-primary shadow-[0_0_36px_rgba(245,192,55,0.18)] backdrop-blur-md transition-all duration-400 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_50px_rgba(245,192,55,0.35)]">
            <Icon className="h-8 w-8" />
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/30 backdrop-blur-md transition-all duration-400 group-hover:border-primary/40 group-hover:text-primary group-hover:bg-primary/10 group-hover:-translate-x-1">
            <ArrowLeft className="h-4 w-4" />
          </span>
        </div>
        <div>
          <h3 className="font-serif text-4xl font-black text-white md:text-5xl leading-tight">{category.title}</h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">{category.description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryHub() {
  return (
    <section className="relative overflow-hidden px-4 py-16 md:py-28" id="categories">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(0,19,164,0.28),transparent_32%),radial-gradient(circle_at_12%_72%,rgba(245,192,55,0.14),transparent_30%)]" />
      <div className="gold-divider absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-7xl space-y-10 md:space-y-16">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <div className="section-ornament">
            <p className="text-xs font-black tracking-[0.34em] text-blue-brand uppercase">מיד אחרי הכניסה</p>
          </div>
          <h2 className="gold-gradient-text text-3xl font-black leading-tight md:text-7xl">כל שערי הקהילה</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:hidden">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                href={category.href}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center transition-all duration-300 active:scale-95 hover:border-primary/30 hover:bg-primary/8"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-primary/35 bg-primary/12 text-primary transition-all duration-300 group-active:bg-primary group-active:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-bold leading-tight text-white">{category.title}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => (
            <CategoryCard key={category.title} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
