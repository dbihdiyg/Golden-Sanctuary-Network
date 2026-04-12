import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { categories } from "@/content/community";

export default function CategoryHub() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-28" id="categories">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(0,19,164,0.3),transparent_32%),radial-gradient(circle_at_12%_72%,rgba(245,192,55,0.16),transparent_30%),linear-gradient(to_bottom,hsl(var(--background)),rgba(0,19,164,0.08),hsl(var(--background)))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/55 to-transparent" />
      <div className="absolute left-[-10%] top-[20%] h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
      <div className="relative mx-auto max-w-7xl space-y-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black tracking-[0.34em] text-blue-brand">מיד אחרי הכניסה</p>
          <h2 className="mt-4 gold-gradient-text text-5xl font-black leading-tight md:text-7xl">כל שערי הקהילה במקום אחד</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
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
                className={`group relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-card shadow-[0_30px_95px_rgba(0,0,0,0.42)] transition duration-700 hover:-translate-y-3 hover:border-primary/55 hover:shadow-[0_0_85px_rgba(245,192,55,0.22)] reveal-up ${index < 2 ? "min-h-[360px] xl:min-h-[420px]" : "min-h-[285px]"}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <img src={category.image} alt={category.title} className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-1000 group-hover:scale-112 group-hover:opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/66 to-blue-brand/16" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-primary/14 blur-2xl transition duration-700 group-hover:scale-150" />
                <div className="relative flex h-full min-h-inherit flex-col justify-between p-7 md:p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid h-16 w-16 place-items-center rounded-2xl border border-primary/40 bg-primary/14 text-primary shadow-[0_0_36px_rgba(245,192,55,0.18)] backdrop-blur-md transition group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-8 w-8" />
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-background/50 text-primary opacity-0 transition group-hover:-translate-x-1 group-hover:opacity-100">
                      <ArrowLeft className="h-5 w-5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-4xl font-black text-white md:text-5xl">{category.title}</h3>
                    <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">{category.description}</p>
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