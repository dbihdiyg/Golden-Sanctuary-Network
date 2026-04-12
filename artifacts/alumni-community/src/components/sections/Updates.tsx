import { updates } from "@/content/community";

export default function Updates() {
  if (!updates || updates.length === 0) return null;

  return (
    <section className="relative overflow-hidden px-6 py-20" id="updates">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">מה חדש</p>
          <h2 className="inline-block gold-gradient-text text-4xl font-black md:text-5xl">עדכוני קהילה</h2>
        </div>

        <div className="space-y-4">
          {updates.map((update) => (
            <article
              key={update.id}
              className={`rounded-[2rem] border p-6 md:p-8 shadow-xl transition ${
                (update as any).mourning
                  ? "border-zinc-700/60 bg-zinc-900/70 grayscale"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
                  (update as any).mourning
                    ? "border-zinc-600 text-zinc-400"
                    : "border-primary/30 text-primary"
                }`}>
                  {update.category}
                </span>
                <span className="text-xs text-muted-foreground">{update.date}</span>
              </div>
              <h3 className={`font-serif text-2xl font-black mb-2 ${
                (update as any).mourning ? "text-zinc-300" : "text-white"
              }`}>{update.title}</h3>
              <p className={`leading-relaxed ${
                (update as any).mourning ? "text-zinc-400" : "text-muted-foreground"
              }`}>{update.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
