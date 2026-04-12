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

export default function CommunityFeed() {
  return (
    <section className="relative overflow-hidden px-6 py-28" id="feed">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="relative mx-auto max-w-4xl space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">לוח הקהילה</p>
          <h2 className="text-4xl font-black text-white md:text-6xl">חדשות ועדכונים</h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">
            זרם עדכונים חי שמחזיק את כולם מחוברים למה שקורה עכשיו.
          </p>
        </div>

        <div className="relative space-y-6 before:absolute before:right-6 before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-primary before:via-blue-brand/60 before:to-transparent">
          {feed.map((item, index) => (
            <article
              key={item.title}
              className="relative pr-20 reveal-up"
              style={{ animationDelay: `${index * 95}ms` }}
            >
              <div className="absolute right-3 top-5 h-7 w-7 rounded-full border border-primary/50 bg-background shadow-[0_0_30px_rgba(245,192,55,0.25)]">
                <div className="absolute inset-2 rounded-full bg-primary" />
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-card/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card">
                <span className="text-sm font-medium text-primary">{item.date}</span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}