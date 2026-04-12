import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { categories } from "@/content/community";

export default function CategoryHub() {
  return (
    <section className="relative overflow-hidden px-6 py-24" id="categories">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(0,19,164,0.22),transparent_30%),radial-gradient(circle_at_12%_76%,rgba(245,192,55,0.12),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">כל מה שקורה בקהילה</p>
          <h2 className="mt-4 gold-gradient-text text-4xl font-black md:text-6xl">המרכז הדיגיטלי של הבוגרים</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            תמונות, וידאו, עלונים, עדכונים, שאלות לרב ויצירת קשר — הכל מופיע כבר בתחילת האתר כדי שכל בוגר יבין מיד לאן להיכנס.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                href={category.href}
                className="group relative min-h-[255px] overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_0_70px_rgba(245,192,55,0.18)] reveal-up"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <img src={category.image} alt={category.title} className="absolute inset-0 h-full w-full object-cover opacity-34 transition duration-700 group-hover:scale-110 group-hover:opacity-48" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-blue-brand/10" />
                <div className="relative flex h-full min-h-[255px] flex-col justify-between p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/35 bg-primary/12 text-primary shadow-[0_0_30px_rgba(245,192,55,0.15)] backdrop-blur-md transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </span>
                    <ArrowLeft className="h-5 w-5 text-primary opacity-0 transition group-hover:-translate-x-1 group-hover:opacity-100" />
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-black text-white">{category.title}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}