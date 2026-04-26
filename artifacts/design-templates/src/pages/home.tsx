import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Search, Crown, CheckCircle2, Clock, LayoutGrid, Image as ImageIcon, Video, Calendar, Palette, PenTool, Send, Menu, X, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/TemplateCard";
import { templates, categories, styles } from "@/lib/data";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence, useInView, useAnimation } from "framer-motion";

function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isIntersecting] as const;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("הכל");
  const [activeStyle, setActiveStyle] = useState<string>("הכל");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const [clockRef, clockIntersecting] = useIntersectionObserver({ threshold: 0.5 });
  const [stepsRef, stepsIntersecting] = useIntersectionObserver({ threshold: 0.2 });

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [count, setCount] = useState(0);
  useEffect(() => {
    if (clockIntersecting) {
      let start = 0;
      const end = 24;
      const duration = 1500;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [clockIntersecting]);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = activeCategory === "הכל" || t.category === activeCategory;
    const matchesStyle = activeStyle === "הכל" || t.style === activeStyle;
    const matchesSearch = t.title.includes(searchQuery) || t.subtitle.includes(searchQuery);
    return matchesCategory && matchesStyle && matchesSearch;
  });

  const sloganWords = "עיצוב ווידאו לאירועים — במהירות של תבנית, ברמה של סטודיו".split(" ");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary-foreground transition-colors duration-300"
    >
      
      {/* Header/Nav */}
      <motion.header 
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`border-b border-white/5 sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(214,168,79,0.3)] border-b-primary/20' : 'bg-background/90 backdrop-blur-md'}`}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex flex-col items-center justify-center text-primary cursor-pointer relative">
                <Crown className="w-5 h-5 absolute -top-4 text-primary" strokeWidth={2.5} />
                <span className="font-serif font-bold text-3xl text-foreground tracking-wide">הדר</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-base font-medium">
            <Link href="/"><span className="text-primary transition-colors cursor-pointer">ראשי</span></Link>
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">שירותים</a>
            <a href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors">גלריה</a>
            <Link href="/order"><span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">הזמנה</span></Link>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">צור קשר</a>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggle} className="rounded-full p-2 border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground p-2">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-white/5 py-4 px-4 flex flex-col gap-4 shadow-xl">
            <Link href="/"><span className="text-primary font-medium p-2 block" onClick={() => setIsMenuOpen(false)}>ראשי</span></Link>
            <a href="#services" className="text-foreground font-medium p-2 block" onClick={() => setIsMenuOpen(false)}>שירותים</a>
            <a href="#gallery" className="text-foreground font-medium p-2 block" onClick={() => setIsMenuOpen(false)}>גלריה</a>
            <Link href="/order"><span className="text-foreground font-medium p-2 block" onClick={() => setIsMenuOpen(false)}>הזמנה</span></Link>
            <a href="#contact" className="text-foreground font-medium p-2 block" onClick={() => setIsMenuOpen(false)}>צור קשר</a>
          </div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            סטודיו לעיצוב דיגיטלי
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-7xl md:text-9xl font-bold tracking-tight mb-6 text-primary"
            style={{ animation: 'goldGlow 4s infinite alternate ease-in-out' }}
          >
            הדר
          </motion.h1>
          
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-xl md:text-3xl text-foreground max-w-3xl mx-auto mb-12 font-light">
            {sloganWords.map((word, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 + 0.5, ease: "easeOut" }}
              >
                {word}
              </motion.span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-[2000ms] fill-mode-both">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(214,168,79,0.5)] font-bold transition-all btn-shimmer" onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}>
                צפו בדוגמאות
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link href="/order">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 h-14 border-primary text-primary hover:bg-primary/10 transition-all">
                  הזמינו עכשיו
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 24-Hour Promise Module */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
            
            <div 
              ref={clockRef}
              className={`relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm transition-all duration-1000 ${clockIntersecting ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            >
              {/* Rotating SVG Ring */}
              <motion.svg 
                className="absolute inset-0 w-full h-full text-primary" 
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              >
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
                <motion.line 
                  x1="50" y1="50" x2="50" y2="15" 
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  style={{ originX: "50px", originY: "50px" }}
                />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
              </motion.svg>
              
              <div className="text-center z-10 relative">
                <span className="block text-primary/80 font-medium mb-1 text-sm md:text-base">סקיצה ראשונה תוך</span>
                <div className="font-serif text-6xl md:text-8xl font-bold text-primary tabular-nums leading-none bg-background/60 rounded-full px-2 py-1 backdrop-blur-sm shadow-[0_0_15px_rgba(214,168,79,0.2)]">{count}</div>
                <span className="block text-primary/80 font-medium mt-1 text-sm md:text-base">שעות</span>
              </div>
            </div>

            <div className={`space-y-6 max-w-md text-center md:text-right transition-all duration-1000 delay-300 ${clockIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <h2 className="font-serif text-4xl font-bold text-foreground">ההבטחה שלנו אליכם</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                אתם צריכים את העיצוב מהר, אבל לא רוצים להתפשר על האיכות. אנחנו מספקים סקיצה ראשונית ברמה הגבוהה ביותר תוך יממה אחת בלבד.
              </p>
              <div className="flex flex-col gap-4 mt-6">
                {['מהיר — זמן תגובה מיידי', 'מדויק — קולע לטעם שלכם', 'מקצועי — רמת גימור של סטודיו'].map((item, i) => (
                  <div key={i} className="flex items-center justify-center md:justify-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-lg font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section id="services" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">השירותים שלנו</h2>
            <p className="text-xl text-muted-foreground">כל מה שאתם צריכים לאירוע מושלם</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto auto-rows-[250px]">
            
            {/* הזמנות לחתונה (Large, takes 2 cols on md) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80')] bg-cover bg-center" />
              <div className="relative z-20">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary backdrop-blur-md">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-3xl font-bold mb-2">הזמנות לחתונה</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">עיצובים יוקרתיים שמשדרים הוד והדר, מותאמים אישית לטעם שלכם.</p>
                <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
              </div>
            </motion.div>

            {/* הזמנות לקידוש */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
              className="group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors"
            >
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/10 z-10" />
               <div className="relative z-20">
                 <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                    <ImageIcon className="w-6 h-6" />
                 </div>
                 <h3 className="font-serif text-2xl font-bold mb-2">הזמנות לקידוש</h3>
                 <p className="text-sm text-muted-foreground mb-4">הזמנות קלאסיות ומרשימות.</p>
                 <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
               </div>
            </motion.div>

            {/* מודעות לאירועים */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
              className="group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors"
            >
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/10 z-10" />
               <div className="relative z-20">
                 <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                    <PenTool className="w-6 h-6" />
                 </div>
                 <h3 className="font-serif text-2xl font-bold mb-2">מודעות לאירועים</h3>
                 <p className="text-sm text-muted-foreground mb-4">מודעות בולטות ומכובדות לישיבות וארגונים.</p>
                 <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
               </div>
            </motion.div>

            {/* קליפי וידאו (Large, takes 2 cols on md) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://images.unsplash.com/photo-1516280440502-861053422037?auto=format&fit=crop&q=80')] bg-cover bg-center" />
              <div className="relative z-20">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary backdrop-blur-md">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-3xl font-bold mb-2">קליפי וידאו</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">מצגות מרגשות וקליפים קצרים להקרנה באירועים ושמחות.</p>
                <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
              </div>
            </motion.div>

             {/* עיצובים לחגים ושבת */}
             <motion.div 
               initial={{ opacity: 0, x: -30 }} 
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
               whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
               className="group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors hidden md:flex"
             >
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/10 z-10" />
               <div className="relative z-20">
                 <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                    <Calendar className="w-6 h-6" />
                 </div>
                 <h3 className="font-serif text-2xl font-bold mb-2">לחגים ושבתות</h3>
                 <p className="text-sm text-muted-foreground mb-4">עיצובים ייעודיים למועדי ישראל.</p>
                 <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3-Step Order Process */}
      <section className="py-24 bg-background border-t border-white/5" ref={stepsRef}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">איך זה עובד?</h2>
            <p className="text-xl text-muted-foreground">פשוט, מהיר ואיכותי</p>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between gap-12 md:gap-4">
            {/* Connecting Line Desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-secondary overflow-hidden">
              <motion.div 
                className="h-full bg-primary origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

             {/* Connecting Line Mobile */}
             <div className="md:hidden absolute top-0 bottom-0 right-12 w-0.5 bg-secondary overflow-hidden">
              <motion.div 
                className="w-full bg-primary origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

            {[
              { num: 1, title: "בחרו תבנית", desc: "סיירו בגלריה שלנו ומצאו את הסגנון המושלם עבורכם.", icon: <Palette /> },
              { num: 2, title: "מלאו פרטים", desc: "הגישו בריף קצר עם כל הטקסטים והבקשות שלכם.", icon: <Send /> },
              { num: 3, title: "קבלו תוך 24 שעות", desc: "סקיצה ראשונה אצלכם לאישור, בסטנדרט הגבוה ביותר.", icon: <Clock /> }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.3 }}
                className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-6 md:w-1/3"
              >
                <div className="w-24 h-24 rounded-full bg-secondary border-4 border-background flex items-center justify-center relative flex-shrink-0 shadow-lg shadow-black/50">
                  <div className="text-primary w-10 h-10">
                    {step.icon}
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.3 + 0.3 }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-md"
                  >
                    {step.num}
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Gallery */}
      <section id="gallery" className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
             <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">הגלריה שלנו</h2>
             <p className="text-xl text-muted-foreground">מגוון תבניות מרהיבות מוכנות להתאמה אישית</p>
          </div>
        
          {/* Filters */}
          <div className="bg-background/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 md:p-6 mb-12 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Search */}
              <div className="relative max-w-md w-full">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="חפשו סגנון, אירוע או תבנית..." 
                  className="pl-4 pr-12 bg-secondary/50 border-white/10 focus-visible:ring-primary h-12 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Style Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <span className="text-base text-muted-foreground ml-2 whitespace-nowrap font-medium">סגנון:</span>
                <button 
                  onClick={() => setActiveStyle("הכל")}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeStyle === "הכל" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"}`}
                >
                  הכל
                </button>
                {styles.map(style => (
                  <button 
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeStyle === style ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Strip */}
            <div className="flex items-center gap-8 overflow-x-auto mt-6 pb-2 hide-scrollbar border-t border-white/5 pt-6">
              <button 
                onClick={() => setActiveCategory("הכל")}
                className={`text-base font-medium whitespace-nowrap transition-all relative pb-2 ${activeCategory === "הכל" ? "text-primary" : "text-muted-foreground hover:text-white"}`}
              >
                הכל
                {activeCategory === "הכל" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-base font-medium whitespace-nowrap transition-all relative pb-2 ${activeCategory === cat ? "text-primary" : "text-muted-foreground hover:text-white"}`}
                >
                  {cat}
                  {activeCategory === cat && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.07 } },
              hidden: {}
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template, index) => (
                <TemplateCard key={template.id} template={template} index={index} />
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-background/50 rounded-2xl border border-white/5">
                <p className="text-2xl text-muted-foreground font-medium">לא נמצאו תבניות התואמות את החיפוש שלכם.</p>
                <Button variant="link" className="text-primary mt-4 text-lg" onClick={() => {setSearchQuery(""); setActiveCategory("הכל"); setActiveStyle("הכל");}}>
                  נקה סינונים
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
             <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">לקוחות מספרים</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "הזמנו עיצוב לחתונת הבת. הסקיצה הגיעה תוך פחות מ-24 שעות והייתה מדויקת להפליא. רמת גימור שלא רואים כל יום, בסטנדרט חסידי מוקפד.", name: "משפחת לוי", role: "ירושלים" },
              { text: "כמזכיר ישיבה, אני צריך מודעות באופן תדיר. 'הדר' מבינים בדיוק את הסגנון הנדרש ופועלים במהירות שיא. פתרון מושלם למוסדות.", name: "הרב אברהם כהן", role: "מזכיר ישיבה, בני ברק" },
              { text: "השירות אדיב והמחיר מצוין ביחס לאיכות. העיצוב לבר המצווה היה פשוט מושלם, קלאסי ויוקרתי בדיוק כמו שרצינו.", name: "יעקב מ.", role: "ביתר עילית" }
            ].map((t, i) => (
              <div key={i} className="bg-secondary p-8 rounded-2xl border border-primary/20 relative shadow-lg">
                 <div className="absolute top-6 right-6 text-primary/20 font-serif text-6xl leading-none">"</div>
                 <p className="text-lg relative z-10 text-foreground mb-8 leading-relaxed">
                   {t.text}
                 </p>
                 <div>
                   <h4 className="font-bold text-lg text-primary">{t.name}</h4>
                   <span className="text-sm text-muted-foreground">{t.role}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order CTA Banner */}
      <section className="py-24 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">מוכנים להתחיל?</h2>
          <p className="text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
            ספרו לנו על האירוע שלכם, ונתחיל לעבוד על סקיצה יוקרתית.
          </p>
          <Link href="/order">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-xl px-12 h-16 rounded-full shadow-2xl transition-transform font-bold">
                שלחו בריף אישי
              </Button>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/5 bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
           <div className="flex flex-col items-center justify-center text-primary mb-8">
              <Crown className="w-6 h-6 mb-1" />
              <span className="font-serif font-bold text-3xl text-foreground">הדר</span>
            </div>
          <p className="text-muted-foreground mb-8">עיצוב ווידאו לאירועים — במהירות של תבנית, ברמה של סטודיו.</p>
          <p className="text-sm text-muted-foreground/60">© {new Date().getFullYear()} הדר. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </motion.div>
  );
}