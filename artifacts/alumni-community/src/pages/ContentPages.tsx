import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CalendarDays, Download, FileText, Mail, MessageCircle, Play, Send, X } from "lucide-react";
import Footer from "@/components/sections/Footer";
import { contact, events, faqs, pdfs, photos, stories, updates, videos } from "@/content/community";

function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(245,192,55,0.16),transparent_28%),radial-gradient(circle_at_10%_18%,rgba(0,19,164,0.2),transparent_34%)]" />
      <section className="relative px-6 pb-14 pt-20 md:pt-28">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">{eyebrow}</p>
          <h1 className="mt-5 gold-gradient-text text-5xl font-black md:text-7xl">{title}</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">{description}</p>
        </div>
      </section>
      <div className="relative">{children}</div>
      <Footer />
    </main>
  );
}

export function PhotosPage() {
  const [selected, setSelected] = useState<(typeof photos)[number] | null>(null);
  const filters = ["הכל", "2026", "2025", "אירועים", "תורה", "קהילה"];

  return (
    <PageShell eyebrow="גלריית תמונות" title="רגעים, מחזורים וזיכרונות" description="גלריה מהירה ונוחה לצפייה באירועים, מפגשים ורגעים מהקהילה. לחיצה על תמונה פותחת תצוגה מלאה.">
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <button key={filter} className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-primary">{filter}</button>
            ))}
          </div>
          <div className="grid auto-rows-[230px] grid-cols-1 gap-5 md:grid-cols-3">
            {photos.map((photo, index) => (
              <button key={photo.src} onClick={() => setSelected(photo)} className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-card text-right shadow-2xl transition hover:-translate-y-1 hover:border-primary/40 ${index % 3 === 0 ? "md:row-span-2" : ""}`}>
                <img src={photo.src} alt={photo.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-6">
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">{photo.tag} · {photo.year}</span>
                  <h3 className="mt-3 font-serif text-2xl font-black text-white">{photo.title}</h3>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center">
            <button className="rounded-full border border-primary/35 px-8 py-4 font-bold text-primary transition hover:bg-primary hover:text-primary-foreground">טען עוד תמונות</button>
          </div>
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/92 p-5 backdrop-blur-xl" onClick={() => setSelected(null)}>
          <button aria-label="סגירה" onClick={() => setSelected(null)} className="absolute left-6 top-6 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-primary hover:text-primary-foreground"><X /></button>
          <figure className="overflow-hidden rounded-[2rem] border border-primary/30 bg-card shadow-[0_0_100px_rgba(245,192,55,0.25)]" onClick={(event) => event.stopPropagation()}>
            <img src={selected.src} alt={selected.title} className="max-h-[78vh] max-w-[90vw] object-contain" />
            <figcaption className="border-t border-white/10 p-5 text-center font-serif text-2xl text-primary">{selected.title}</figcaption>
          </figure>
        </div>
      )}
    </PageShell>
  );
}

export function VideosPage() {
  return (
    <PageShell eyebrow="ספריית וידאו" title="שיעורים, ברכות וסיפורים" description="מרכז צפייה מסודר עם סרטונים, תקצירים, תאריכים וסינון לפי קטגוריות תוכן.">

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-primary/20 bg-card shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
          <div className="grid md:grid-cols-[1fr_1.4fr_1fr]">

            {/* תמונה שמאל — יוסף זריהן ז״ל */}
            <div className="relative hidden min-h-[420px] overflow-hidden md:block">
              <img
                src="/yosef-zarihan.jpg"
                alt="יוסף זריהן ז״ל"
                className="h-full w-full object-cover object-top grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-card via-card/20 to-transparent" />
              <div className="absolute bottom-6 right-6 text-right">
                <p className="text-xs font-black tracking-widest text-white/50">ברוך דיין האמת</p>
                <p className="font-serif text-lg font-black text-white/80">יוסף זריהן ז״ל</p>
              </div>
            </div>

            {/* טקסט מרכזי */}
            <div className="flex flex-col justify-center gap-6 p-8 text-right md:p-12">
              <div>
                <p className="text-sm font-black tracking-[0.28em] text-blue-brand">פתח דבר</p>
                <h2 className="mt-3 font-serif text-4xl font-black text-white md:text-5xl">
                  מורנו הרב שליט״א
                </h2>
                <div className="mt-2 h-px w-24 bg-gradient-to-l from-primary to-transparent" />
              </div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                ספריית הווידאו של קהילת הבוגרים מרכזת שיעורים, ברכות, דברי עידוד וחיזוק מפי מורנו הרב שליט״א — לחיזוק הקשר, האמונה והחיבור המתמשך לבית המדרש.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground/80">
                כל סרטון הוא הזדמנות לחוות שוב את אותה אווירה מיוחדת, ולהמשיך לשאוב כוח מדברי הרב גם מרחוק.
              </p>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                <span className="text-sm font-bold tracking-widest text-primary">לצפייה בסרטונים</span>
                <ArrowLeft className="h-4 w-4 text-primary" />
              </div>
            </div>

            {/* תמונה ימין — הרב שליט״א */}
            <div className="relative min-h-[340px] overflow-hidden md:min-h-[420px]">
              <img
                src="/rabbi-intro.jpg"
                alt="מורנו הרב שליט״א"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-card/20 to-card" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:hidden" />
            </div>

          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-3">
          {videos.map((video) => (
            <a key={video.title} href={video.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl transition hover:-translate-y-2 hover:border-primary/45">
              <div className="relative h-56 overflow-hidden">
                <img src={video.image} alt={video.title} className="h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 grid place-items-center bg-background/20"><span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_40px_rgba(245,192,55,0.35)]"><Play className="h-7 w-7 fill-current" /></span></div>
              </div>
              <div className="space-y-3 p-6">
                <span className="text-sm font-bold text-primary">{video.category} · {video.date}</span>
                <h3 className="font-serif text-2xl font-black text-white">{video.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{video.summary}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function LibraryPage() {
  return (
    <PageShell eyebrow="ספריית PDF" title="עלונים ופרסומים להורדה" description="מסמכי קהילה, עלונים, סיכומי אירועים ותכניות — מאורגנים בצורה נקייה ונגישה.">
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {pdfs.map((pdf) => (
            <article key={pdf.title} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-primary/40">
              <div className="flex gap-5">
                <div className="grid h-24 w-20 shrink-0 place-items-center rounded-2xl border border-primary/35 bg-primary/12 text-primary"><FileText className="h-10 w-10" /></div>
                <div className="space-y-3">
                  <span className="text-sm font-bold text-primary">{pdf.date} · {pdf.size}</span>
                  <h3 className="font-serif text-2xl font-black text-white">{pdf.title}</h3>
                  <p className="text-muted-foreground">{pdf.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {pdf.url ? (
                      <>
                        <a href={pdf.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-5 py-2 text-sm text-white transition hover:border-primary/40 hover:text-primary">צפייה</a>
                        <a href={pdf.url} download className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:shadow-[0_0_32px_rgba(245,192,55,0.25)]">הורדה <Download className="mr-2 h-4 w-4" /></a>
                      </>
                    ) : (
                      <span className="rounded-full border border-white/10 px-5 py-2 text-sm text-muted-foreground">בקרוב</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function UpdatesPage() {
  return (
    <PageShell eyebrow="עדכוני קהילה" title="מה חדש אצל הבוגרים" description="חדשות, אירועים, שמחות, יוזמות והודעות חשובות במקום אחד.">
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl space-y-6">
          {updates.map((update) =>
            (update as any).mourning ? (
              <article key={update.id} className="overflow-hidden rounded-[2rem] border border-white/20 bg-[#0e0e0e] shadow-2xl md:flex">
                <div className="relative md:w-72 md:shrink-0">
                  <img src={update.image} alt={update.title} className="h-64 w-full object-cover object-top grayscale md:h-full" />
                  <div className="absolute inset-0 bg-gradient-to-l from-[#0e0e0e] via-[#0e0e0e]/30 to-transparent md:bg-gradient-to-l" />
                </div>
                <div className="flex flex-col justify-center gap-4 p-7">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-2 w-2 rounded-full bg-white/50" />
                    <span className="text-sm font-black tracking-[0.2em] text-white/70">{update.category} · {update.date}</span>
                  </div>
                  <h3 className="font-serif text-3xl font-black text-white md:text-4xl">{update.title}</h3>
                  <p className="leading-relaxed text-white/62">{update.excerpt}</p>
                  <p className="text-sm font-bold tracking-widest text-white/40">תהא נשמתו צרורה בצרור החיים</p>
                </div>
              </article>
            ) : (
              <article key={update.id} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl transition hover:-translate-y-2 hover:border-primary/40 md:flex">
                <img src={update.image} alt={update.title} className="h-56 w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 md:h-auto md:w-72 md:shrink-0" />
                <div className="flex flex-col justify-center space-y-3 p-6">
                  <span className="text-sm font-bold text-primary">{update.category} · {update.date}</span>
                  <h3 className="font-serif text-3xl font-black text-white">{update.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{update.excerpt}</p>
                  <button className="inline-flex items-center text-sm font-bold text-primary">קרא עוד <ArrowLeft className="mr-2 h-4 w-4" /></button>
                </div>
              </article>
            )
          )}
        </div>
      </section>
    </PageShell>
  );
}

function Field({ label, type = "text", textarea = false }: { label: string; type?: string; textarea?: boolean }) {
  return (
    <label className="block space-y-2 text-right">
      <span className="text-sm font-bold text-primary">{label}</span>
      {textarea ? <textarea rows={6} className="w-full rounded-2xl border border-white/10 bg-background/70 p-4 text-white outline-none transition focus:border-primary/60" /> : <input type={type} className="w-full rounded-2xl border border-white/10 bg-background/70 p-4 text-white outline-none transition focus:border-primary/60" />}
    </label>
  );
}

export function AskRabbiPage() {
  return (
    <PageShell eyebrow="שאל את הרב" title="שליחת שאלה בצורה מכבדת ודיסקרטית" description="ניתן לשלוח שאלה אישית, לבחור נושא, ולסמן אם תרצו שהפנייה תהיה אנונימית.">
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-5 md:grid-cols-2"><Field label="שם" /><Field label="אימייל או טלפון" /></div>
            <Field label="נושא השאלה" />
            <Field label="השאלה" textarea />
            <label className="flex items-center gap-3 text-muted-foreground"><input type="checkbox" className="h-5 w-5 accent-primary" /> שליחה אנונימית</label>
            <button type="button" className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:shadow-[0_0_40px_rgba(245,192,55,0.3)]">שליחת שאלה <Send className="mr-2 h-5 w-5" /></button>
          </form>
          <aside className="space-y-5">
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[2rem] border border-primary/30 bg-primary/12 p-6 text-primary transition hover:bg-primary hover:text-primary-foreground"><span className="font-serif text-2xl font-black">שאלה ישירה בוואטסאפ</span><MessageCircle /></a>
            <div className="rounded-[2rem] border border-white/10 bg-card p-6">
              <h3 className="font-serif text-2xl font-black text-white">שאלות נפוצות</h3>
              <div className="mt-4 space-y-3">{faqs.map((faq) => <p key={faq} className="rounded-2xl bg-white/[0.04] p-4 text-muted-foreground">{faq}</p>)}</div>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

export function ContactPage() {
  return (
    <PageShell eyebrow="צור קשר" title="אנחנו כאן בשבילכם" description="וואטסאפ, אימייל וטופס פנייה במקום אחד — כדי שהחיבור לקהילה יהיה תמיד קרוב.">
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="rounded-[2rem] border border-primary/30 bg-primary/12 p-7 text-primary shadow-2xl transition hover:bg-primary hover:text-primary-foreground"><MessageCircle className="h-9 w-9" /><h3 className="mt-5 font-serif text-3xl font-black">וואטסאפ</h3><p className="mt-3">מענה מהיר וישיר לצוות הקהילה.</p></a>
          <a href={contact.email} className="rounded-[2rem] border border-white/10 bg-card p-7 text-white shadow-2xl transition hover:border-primary/40"><Mail className="h-9 w-9 text-primary" /><h3 className="mt-5 font-serif text-3xl font-black">אימייל</h3><p className="mt-3 text-muted-foreground">לפניות, עדכונים, תמונות ומסמכים.</p></a>
          <div className="rounded-[2rem] border border-white/10 bg-card p-7 shadow-2xl"><CalendarDays className="h-9 w-9 text-primary" /><h3 className="mt-5 font-serif text-3xl font-black text-white">זמן מענה</h3><p className="mt-3 text-muted-foreground">בדרך כלל בתוך יום עסקים אחד.</p></div>
        </div>
        <form className="mx-auto mt-8 max-w-4xl space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <div className="grid gap-5 md:grid-cols-2"><Field label="שם מלא" /><Field label="טלפון או אימייל" /></div>
          <Field label="מה תרצו לשלוח לנו?" textarea />
          <button type="button" className="rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground">שליחה</button>
        </form>
      </section>
    </PageShell>
  );
}

export function JoinPage() {
  const options = ["עדכוני קהילה", "עלונים", "אירועים", "וידאו ותמונות חדשים"];
  return (
    <PageShell eyebrow="הצטרפות לעדכונים" title="לא מפספסים שום דבר" description="הצטרפו לרשימת התפוצה ובחרו אילו עדכונים תרצו לקבל.">
      <section className="px-6 pb-24">
        <form className="mx-auto max-w-3xl space-y-5 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl">
          <div className="grid gap-5 md:grid-cols-2"><Field label="שם" /><Field label="טלפון" /></div>
          <Field label="אימייל" type="email" />
          <div className="grid gap-3 md:grid-cols-2">{options.map((option) => <label key={option} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-background/60 p-4 text-muted-foreground"><input type="checkbox" className="h-5 w-5 accent-primary" defaultChecked /> {option}</label>)}</div>
          <button type="button" className="inline-flex w-full items-center justify-center rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground transition hover:shadow-[0_0_40px_rgba(245,192,55,0.3)]">הצטרפות לרשימה <Send className="mr-2 h-5 w-5" /></button>
        </form>
      </section>
    </PageShell>
  );
}

export function StoriesPage() {
  return (
    <PageShell eyebrow="סיפורי בוגרים" title="אנשים שממשיכים להאיר" description="סיפורים אישיים שמראים איך הקשר למוסד ממשיך ללוות את הבוגרים בחיים.">
      <section className="px-6 pb-24"><div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">{stories.map((story) => <article key={story.title} className="overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-2xl"><img src={story.image} alt={story.title} className="h-56 w-full object-cover" /><div className="p-6"><h3 className="font-serif text-2xl font-black text-white">{story.title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{story.text}</p></div></article>)}</div></section>
    </PageShell>
  );
}

export function EventsPage() {
  return (
    <PageShell eyebrow="אירועים קרובים" title="נפגשים, לומדים ומתחברים" description="לוח אירועים ברור ומעודכן לקהילה.">
      <section className="px-6 pb-24"><div className="mx-auto max-w-4xl space-y-5">{events.map((event) => <article key={event.title} className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-card p-6 shadow-2xl md:flex-row md:items-center md:justify-between"><div><span className="font-bold text-primary">{event.date}</span><h3 className="mt-2 font-serif text-3xl font-black text-white">{event.title}</h3><p className="mt-2 text-muted-foreground">{event.text}</p></div><Link href="/join" className="rounded-full border border-primary/35 px-6 py-3 text-center font-bold text-primary transition hover:bg-primary hover:text-primary-foreground">עדכנו אותי</Link></article>)}</div></section>
    </PageShell>
  );
}