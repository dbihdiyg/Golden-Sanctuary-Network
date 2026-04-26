import { Link } from "wouter";
import hadarLogo from "@/assets/logo-hadar.png";
import { Crown, Sun, Moon, ArrowRight, MessageSquare, Palette, FileImage, Clock, RefreshCw, Zap } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function Help() {
  const { theme, toggle } = useTheme();
  const { lang, toggleLang } = useLang();

  const guides = [
    {
      title: "איך שולחים נוסח נכון?",
      desc: "הקפידו על שמות מדויקים, תאריכים ברורים (עברי ולועזי אם צריך), ומיקום האירוע. מומלץ לשלוח טקסט מוקלד ולא תמונה.",
      icon: <MessageSquare className="w-6 h-6 text-primary" />
    },
    {
      title: "בחירת סגנון עיצוב",
      desc: "סגנון יוקרתי מתאים לחתונות ושמחות גדולות. סגנון מודרני מיועד לאירועים קלילים, וסגנון חסידי משלב אלמנטים מסורתיים.",
      icon: <Palette className="w-6 h-6 text-primary" />
    },
    {
      title: "פורמטים להורדה",
      desc: "תקבלו קובץ PDF להדפסה באיכות גבוהה, וקובץ PNG לשליחה נוחה בוואטסאפ. סרטונים יסופקו בפורמט MP4.",
      icon: <FileImage className="w-6 h-6 text-primary" />
    },
    {
      title: "זמני אספקה",
      desc: "סקיצה ראשונה תשלח אליכם לאישור תוך 24 שעות מרגע קבלת כל הפרטים. קליפי וידאו עשויים לקחת עד 48 שעות.",
      icon: <Clock className="w-6 h-6 text-primary" />
    },
    {
      title: "שינויים לאחר קבלה",
      desc: "המחיר כולל סבב תיקונים אחד (שינויי טקסט או צבע קלים). שינויים מהותיים או החלפת תבנית כרוכים בתשלום נוסף.",
      icon: <RefreshCw className="w-6 h-6 text-primary" />
    },
    {
      title: "הזמנה דחופה",
      desc: "צריכים את העיצוב מעכשיו לעכשיו? ניתן לבקש שירות אקספרס לקבלת סקיצה תוך 6 שעות בתוספת של 50 שקלים.",
      icon: <Zap className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
    >
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium hidden sm:inline">חזרה לראשי</span>
            </Link>
            <button onClick={toggleLang} className="rounded border border-primary/30 text-primary px-2 py-1 text-xs font-bold hover:bg-primary/10 transition-colors">
              {lang === "he" ? "EN" : "עב"}
            </button>
            <button onClick={toggle} className="rounded-full p-2 border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          <Link href="/">
            <img src={hadarLogo} alt="הדר" style={{ height: 42, width: "auto", objectFit: "contain", cursor: "pointer" }} />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">מדריכים וטיפים</h1>
          <p className="text-xl text-muted-foreground">כל מה שצריך לדעת לפני שמזמינים</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-secondary/50 border border-primary/20 rounded-2xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {guide.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{guide.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{guide.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </motion.div>
  );
}