import { useEffect, useRef } from "react";
import ShareButton from "@/components/ShareButton";
import { Clock } from "lucide-react";

const feed = [
  {
    date: "היום",
    title: "נפתחה ההרשמה למפגש החורף",
    text: "בוגרים מוזמנים להירשם לערב לימוד, שיח וחיבור שיתקיים בבית המדרש המרכזי.",
  },
  {
    date: "לפני 3 ימים",
    title: "ברכת מזל טוב לבוגרי המחזור",
    text: "הקהילה שולחת ברכות חמות לבוגרים שחגגו שמחות משפחתיות בשבוע האחרון.",
  },
  {
    date: "שבוע שעבר",
    title: "בקשה לעדכון פרטי קשר",
    text: "כדי לשמור על קשר רציף, אנא ודאו שכתובת הדוא״ל ומספר הטלפון מעודכנים.",
  },
  {
    date: "חודש שעבר",
    title: "יוזמת חסד חדשה יצאה לדרך",
    text: "קבוצת בוגרים מובילה מערך תמיכה למשפחות בקהילה בתקופות עומס ואתגר.",
  },
];

function FeedCard({ item, index }: { item: typeof feed[0]; index: number }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("sr-visible"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <article
      ref={ref as any}
      className={`sr relative pr-20 sr-delay-${Math.min(index + 1, 6)}`}
    >
      <div className="absolute right-3 top-6 flex flex-col items-center">
        <div
          className="h-8 w-8 rounded-full border-2 border-primary/60 bg-background shadow-[0_0_20px_rgba(245,192,55,0.35)] flex items-center justify-center"
          style={{ animation: `timeline-pulse 3s ease-in-out ${index * 0.5}s infinite` }}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
        {index < feed.length - 1 && (
          <div className="mt-1 w-px flex-1 h-24 bg-gradient-to-b from-primary/40 via-blue-brand/25 to-transparent" />
        )}
      </div>

      <div className="group rounded-[1.75rem] border border-white/10 bg-card/70 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-400 hover:border-primary/30 hover:bg-card hover:shadow-[0_0_40px_rgba(245,192,55,0.1),0_20px_60px_rgba(0,0,0,0.35)] hover:-translate-y-1">
        <div className="mb-3 flex items-center gap-2 text-xs text-primary/80 font-medium">
          <Clock className="h-3 w-3" />
          {item.date}
        </div>
        <h3 className="font-serif text-2xl font-bold text-white mb-3 leading-snug">{item.title}</h3>
        <p className="leading-relaxed text-muted-foreground">{item.text}</p>
      </div>
    </article>
  );
}

export default function CommunityFeed() {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28" id="feed">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,19,164,0.14),transparent_65%)]" />

      <div className="relative mx-auto max-w-4xl space-y-14">
        <div className="space-y-4 text-center">
          <div className="section-ornament">
            <p className="text-xs font-black tracking-[0.3em] text-blue-brand uppercase">לוח הקהילה</p>
          </div>
          <h2 className="text-4xl font-black text-white md:text-5xl leading-tight">חדשות ועדכונים</h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">
            זרם עדכונים חי שמחזיק את כולם מחוברים למה שקורה עכשיו.
          </p>
          <div className="flex justify-center pt-1">
            <ShareButton sectionId="feed" label="חדשות ועדכונים" />
          </div>
        </div>

        <div className="relative space-y-5">
          {feed.map((item, index) => (
            <FeedCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
