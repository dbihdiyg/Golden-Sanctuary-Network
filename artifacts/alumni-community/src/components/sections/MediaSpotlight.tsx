import { Camera, FileText, Play } from "lucide-react";
import { Link } from "wouter";
import { pdfs, photos, videos } from "@/content/community";

const items = [
  { label: "גלריה חדשה", title: photos[0].title, image: photos[0].src, href: "/photos", icon: Camera },
  { label: "וידאו נבחר", title: videos[0].title, image: videos[0].image, href: "/videos", icon: Play },
  { label: "עלון אחרון", title: pdfs[0].title, image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop", href: "/library", icon: FileText },
];

export default function MediaSpotlight() {
  return (
    <section className="px-4 py-12 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-10">
        <div>
          <p className="text-xs font-bold tracking-[0.28em] text-blue-brand md:text-sm">זרקור מדיה</p>
          <h2 className="mt-2 text-2xl font-black text-white md:mt-3 md:text-6xl">הדברים החדשים ביותר</h2>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:hidden" style={{ scrollbarWidth: "none" }}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative flex-shrink-0 w-52 h-44 overflow-hidden rounded-2xl border border-white/10 snap-start"
              >
                <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-4">
                  <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/35 bg-background/65 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md">
                    <Icon className="h-3 w-3" />
                    {item.label}
                  </span>
                  <h3 className="font-serif text-base font-black text-white leading-snug line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid gap-5 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl transition duration-500 hover:-translate-y-2 hover:border-primary/40 ${index === 0 ? "lg:col-span-1 min-h-[420px]" : "min-h-[260px]"}`}>
                <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="relative flex h-full min-h-inherit flex-col justify-end p-6">
                  <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-background/65 px-4 py-2 text-sm font-bold text-primary backdrop-blur-md">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <h3 className="font-serif text-3xl font-black text-white">{item.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
