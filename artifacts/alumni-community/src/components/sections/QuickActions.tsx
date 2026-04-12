import { Link } from "wouter";
import { quickActions } from "@/content/community";

export default function QuickActions() {
  const visibleActions = quickActions.filter((action) => action.title !== "שלחו תמונה או עדכון");

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-0">
      <div className="absolute inset-0 bg-gradient-to-l from-blue-brand/20 via-transparent to-primary/12" />
      <div className="relative mx-auto max-w-7xl rounded-[2.8rem] border border-primary/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(0,19,164,0.12),rgba(245,192,55,0.06))] p-6 shadow-[0_45px_130px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-10">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black tracking-[0.3em] text-primary">הפעולות החשובות ביותר</p>
            <h2 className="mt-3 text-4xl font-black text-white md:text-6xl">להתחבר לקהילה עכשיו</h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            ארבע דרכי קשר מרכזיות, בולטות ונגישות — כדי שכל בוגר יוכל לפנות, לשאול, להצטרף ולהישאר מחובר.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            const isExternal = action.href.startsWith("http") || action.href.startsWith("mailto:");
            const className = `group relative flex min-h-[220px] overflow-hidden rounded-[2rem] border p-6 shadow-[0_25px_80px_rgba(0,0,0,0.36)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_0_80px_rgba(245,192,55,0.18)] ${index === 0 ? "border-primary/45 bg-primary/14" : "border-white/10 bg-background/62 hover:border-primary/45 hover:bg-blue-brand/18"}`;
            const content = (
              <>
                <span className="absolute -left-14 -top-14 h-36 w-36 rounded-full bg-primary/14 blur-2xl transition group-hover:scale-150" />
                <span className="relative flex h-full flex-col justify-between">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl border border-primary/40 bg-primary/15 text-primary shadow-[0_0_32px_rgba(245,192,55,0.2)] transition group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-8 w-8" />
                  </span>
                  <span>
                    <span className="block font-serif text-3xl font-black text-white">{action.title}</span>
                    <span className="mt-3 block text-base leading-relaxed text-muted-foreground">{action.text}</span>
                  </span>
                </span>
              </>
            );

            return isExternal ? (
              <a key={action.title} href={action.href} target={action.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={className}>
                {content}
              </a>
            ) : (
              <Link key={action.title} href={action.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}