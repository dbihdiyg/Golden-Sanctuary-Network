import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const updates = [
  {
    id: 1,
    category: "אירועים",
    title: "מפגש בוגרים שנתי 2024",
    date: "12 ספטמבר 2024",
    excerpt: "התרגשות גדולה לקראת המפגש השנתי. השנה נתמקד בחיבור בין הדורות ובסיפורים האישיים שמלווים אותנו.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop",
    featured: "ערב מרכזי",
  },
  {
    id: 2,
    category: "יוזמות",
    title: "מיזם חונכות חדש",
    date: "05 אוגוסט 2024",
    excerpt: "בוגרים ותיקים חונכים בוגרים צעירים. הזדמנות מצוינת לתרום מהניסיון ולהשפיע על הדור הבא.",
    image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1974&auto=format&fit=crop",
    featured: "השפעה אישית",
  },
  {
    id: 3,
    category: "תוכן",
    title: "פתיחת סדרת שיעורים בנושא מנהיגות",
    date: "22 יולי 2024",
    excerpt: "סדרת שיעורים חדשה מפי ראשי הקהילה, המתמקדת במנהיגות מתוך ערכים ואמונה בסביבה המודרנית.",
    image: "https://images.unsplash.com/photo-1507676184212-d0c30a5991c0?q=80&w=2069&auto=format&fit=crop",
    featured: "לימוד והשראה",
  }
];

export default function Updates() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-28" id="updates">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/60 to-transparent" />
      <div className="absolute right-[-10%] top-10 h-72 w-72 rounded-full bg-blue-brand/15 blur-3xl" />
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">מה חדש במאירים</p>
          <h2 className="inline-block gold-gradient-text text-4xl font-black md:text-6xl">עדכונים אחרונים</h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">חדשות, אירועים והתפתחויות בקהילת הבוגרים שלנו — מוצגים כמו שער כניסה לקהילה חיה.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {updates.map((update) => (
            <Card key={update.id} className="group cursor-pointer overflow-hidden rounded-[2rem] border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.025] shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_0_60px_rgba(245,192,55,0.22)]">
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/20 to-transparent transition-colors duration-500" />
                <span className="absolute right-4 top-4 z-20 rounded-full border border-primary/40 bg-background/75 px-4 py-1 text-xs font-bold text-primary backdrop-blur-md">
                  {update.category}
                </span>
                <span className="absolute bottom-4 left-4 z-20 rounded-full border border-blue-brand/40 bg-blue-brand/25 px-4 py-1 text-xs font-bold text-white backdrop-blur-md">
                  {update.featured}
                </span>
                <img
                  src={update.image}
                  alt={update.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6 space-y-4 relative">
                <div className="text-primary/80 text-sm font-medium">{update.date}</div>
                <h3 className="text-2xl font-bold text-card-foreground transition-colors group-hover:text-primary">{update.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {update.excerpt}
                </p>
                <div className="flex translate-y-2 items-center pt-4 text-sm font-bold text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  קרא עוד
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
