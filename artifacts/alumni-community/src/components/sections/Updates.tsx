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
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    category: "יוזמות",
    title: "מיזם חונכות חדש",
    date: "05 אוגוסט 2024",
    excerpt: "בוגרים ותיקים חונכים בוגרים צעירים. הזדמנות מצוינת לתרום מהניסיון ולהשפיע על הדור הבא.",
    image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 3,
    category: "תוכן",
    title: "פתיחת סדרת שיעורים בנושא מנהיגות",
    date: "22 יולי 2024",
    excerpt: "סדרת שיעורים חדשה מפי ראשי הקהילה, המתמקדת במנהיגות מתוך ערכים ואמונה בסביבה המודרנית.",
    image: "https://images.unsplash.com/photo-1507676184212-d0c30a5991c0?q=80&w=2069&auto=format&fit=crop"
  }
];

export default function Updates() {
  return (
    <section className="py-24 px-6 bg-background relative" id="updates">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text inline-block">עדכונים אחרונים</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">חדשות, אירועים והתפתחויות בקהילת הבוגרים שלנו</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {updates.map((update) => (
            <Card key={update.id} className="bg-card border-card-border overflow-hidden group hover:border-primary/30 hover:shadow-[0_0_35px_rgba(202,138,4,0.16)] transition-all duration-500 cursor-pointer">
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <span className="absolute top-4 right-4 z-20 rounded-full border border-primary/30 bg-background/70 px-4 py-1 text-xs font-medium text-primary backdrop-blur-md">
                  {update.category}
                </span>
                <img 
                  src={update.image} 
                  alt={update.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <CardContent className="p-6 space-y-4 relative">
                <div className="text-primary/80 text-sm font-medium">{update.date}</div>
                <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">{update.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {update.excerpt}
                </p>
                <div className="pt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
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
