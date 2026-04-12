import { ArrowLeft, Camera, FileText, Newspaper, Play } from "lucide-react";
import { Link } from "wouter";
import { pdfs, photos, updates, videos } from "@/content/community";

const items = [
  { label: "גלריה חדשה", title: photos[0].title, image: photos[0].src, href: "/photos", icon: Camera },
  { label: "וידאו נבחר", title: videos[0].title, image: videos[0].image, href: "/videos", icon: Play },
  { label: "עלון אחרון", title: pdfs[0].title, image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop", href: "/library", icon: FileText },
  { label: "עדכון חם", title: updates[0].title, image: updates[0].image, href: "/updates", icon: Newspaper },
];

export default function MediaSpotlight() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">זרקור מדיה</p>
            <h2 className="mt-3 text-4xl font-black text-white md:text-6xl">הדברים החדשים ביותר</h2>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            טעימה מהתוכן החי באתר: תמונה, וידאו, עלון ועדכון — כדי שהבית הדיגיטלי ירגיש פעיל ומתעדכן.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl transition duration-500 hover:-translate-y-2 hover:border-primary/40 ${index === 0 ? "lg:col-span-2 lg:row-span-2 min-h-[420px]" : "min-h-[260px]"}`}>
                <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="relative flex h-full min-h-inherit flex-col justify-end p-6">
                  <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/35 bg-background/65 px-4 py-2 text-sm font-bold text-primary backdrop-blur-md">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <h3 className="font-serif text-3xl font-black text-white">{item.title}</h3>
                  <span className="mt-5 inline-flex items-center text-sm font-bold text-primary opacity-0 transition group-hover:opacity-100">
                    לפתיחה
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}