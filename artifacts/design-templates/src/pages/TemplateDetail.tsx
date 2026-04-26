import { useParams, Link } from "wouter";
import { ArrowRight, Download, MessageCircle, Palette, CheckCircle2, Share2, Info, Crown, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { templates } from "@/lib/data";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";

export default function TemplateDetail() {
  const params = useParams();
  const id = params.id;
  const template = templates.find(t => t.id === id);
  const { theme, toggle } = useTheme();

  if (!template) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
        className="min-h-screen bg-background flex flex-col items-center justify-center p-4 transition-colors duration-300"
      >
        <h1 className="font-serif text-3xl mb-4 text-foreground">התבנית לא נמצאה</h1>
        <Link href="/">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">חזור לעמוד הראשי</Button>
        </Link>
      </motion.div>
    );
  }

  const editableItems = ["שמות", "תאריכים", "מיקום", "טקסט", "צבעים"];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300"
    >
      
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="font-medium hidden sm:inline">חזרה לגלריה</span>
            </Link>
            <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors font-medium">מדריכים</Link>
            <button onClick={toggle} className="rounded-full p-2 border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          <Link href="/">
            <div className="flex flex-col items-center justify-center text-primary cursor-pointer relative">
              <Crown className="w-5 h-5 absolute -top-4 text-primary" strokeWidth={2.5} />
              <span className="font-serif font-bold text-3xl text-foreground tracking-wide">הדר</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Image/Preview Column */}
          <div className="lg:col-span-7 xl:col-span-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="relative rounded-3xl overflow-hidden bg-secondary border border-primary/20 aspect-[3/4] md:aspect-auto md:h-[800px] flex items-center justify-center group shadow-2xl">
              {template.isGradient ? (
                <div className="absolute inset-0 w-full h-full" style={{ background: template.image }}>
                  <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay"></div>
                  <div className="absolute inset-8 border-2 border-white/10 rounded-2xl flex items-center justify-center p-8 text-center">
                    <h3 className="font-serif text-5xl md:text-7xl font-bold text-white/90 drop-shadow-xl">{template.title}</h3>
                  </div>
                </div>
              ) : (
                <img 
                  src={template.image} 
                  alt={template.title} 
                  className="w-full h-full object-cover md:object-contain"
                />
              )}
              
              <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl" />
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col animate-in fade-in slide-in-from-left-8 duration-700 delay-150 fill-mode-both">
            <div className="sticky top-28 bg-secondary/50 p-8 rounded-3xl border border-primary/10 shadow-lg">
              <div className="mb-8">
                <div className="flex gap-2 mb-6">
                  <Badge variant="secondary" className="bg-background border-primary/20 text-primary px-3 py-1 text-sm font-medium">{template.category}</Badge>
                  <Badge variant="outline" className="border-white/10 text-foreground px-3 py-1 text-sm font-medium bg-white/5">{template.style}</Badge>
                </div>
                <h1 className="font-serif text-5xl font-bold mb-4 text-foreground">{template.title}</h1>
                <p className="text-xl text-muted-foreground">{template.subtitle}</p>
              </div>

              <div className="py-6 border-y border-white/5 mb-8 flex justify-between items-center bg-primary/5 -mx-8 px-8">
                <span className="text-lg text-foreground font-medium">מחיר מחירון</span>
                <span className="font-sans font-bold text-5xl text-primary">₪{template.price}</span>
              </div>

              <div className="mb-10">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-foreground">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  מה ניתן לערוך?
                </h3>
                <ul className="grid grid-cols-2 gap-4">
                  {editableItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground font-medium">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <Link href={`/editor/${template.id}`}>
                  <Button size="lg" className="w-full text-lg h-16 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 relative overflow-hidden group font-bold">
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <Palette className="w-6 h-6 ml-3 relative z-10" />
                    <span className="relative z-10">ערכו את ההזמנה עכשיו</span>
                  </Button>
                </Link>
                
                <Button size="lg" variant="outline" className="w-full text-lg h-16 border-primary/50 text-primary hover:bg-primary/10 font-bold transition-colors">
                  <Download className="w-6 h-6 ml-3" />
                  הורד קובץ מקור
                </Button>

                <Button size="lg" variant="secondary" className="w-full text-lg h-16 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 mt-2 font-bold transition-colors">
                  <MessageCircle className="w-6 h-6 ml-3" />
                  הזמנה מהירה בוואטסאפ
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center">
                <button className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
                  שתפו תבנית זו
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </motion.div>
  );
}