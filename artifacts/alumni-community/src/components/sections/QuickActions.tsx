import { Link } from "wouter";
import { quickActions } from "@/content/community";

export default function QuickActions() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="absolute inset-0 bg-gradient-to-l from-blue-brand/18 via-transparent to-primary/10" />
      <div className="relative mx-auto max-w-6xl rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_35px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl md:p-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-primary">פעולות מהירות</p>
          <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">איך תרצו להתחבר?</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isExternal = action.href.startsWith("http") || action.href.startsWith("mailto:");
            const className = "group flex min-h-[170px] flex-col justify-between rounded-[1.5rem] border border-white/10 bg-background/55 p-5 transition hover:-translate-y-1 hover:border-primary/45 hover:bg-blue-brand/18";
            const content = (
              <>
                <Icon className="h-7 w-7 text-primary transition group-hover:scale-110" />
                <span>
                  <span className="block font-serif text-xl font-bold text-white">{action.title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{action.text}</span>
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