import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/TemplateCard";
import { templates, categories, styles } from "@/lib/data";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("הכל");
  const [activeStyle, setActiveStyle] = useState<string>("הכל");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = activeCategory === "הכל" || t.category === activeCategory;
    const matchesStyle = activeStyle === "הכל" || t.style === activeStyle;
    const matchesSearch = t.title.includes(searchQuery) || t.subtitle.includes(searchQuery);
    return matchesCategory && matchesStyle && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary-foreground">
      
      {/* Header/Nav */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-serif font-bold text-xl text-foreground">תבניות עיצוב</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="text-foreground transition-colors">ראשי</a>
            <a href="#" className="hover:text-foreground transition-colors">אודות</a>
            <a href="#" className="hover:text-foreground transition-colors">איך זה עובד?</a>
            <a href="#" className="hover:text-foreground transition-colors">צור קשר</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            סטודיו לעיצוב דיגיטלי
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            תבניות עיצוב ווידאו <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-primary/80 to-white">לציבור החרדי</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            הזמנות, מודעות, קליפים ותבניות מוכנות —<br/> משנים טקסט ומורידים בקלות ובמהירות.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_40px_-10px_rgba(201,168,76,0.5)]">
              צפה בתבניות
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 border-white/10 hover:bg-white/5">
              העלה בקשה אישית
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-24 flex-1">
        
        {/* Filters */}
        <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 py-4 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative max-w-md w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="חפש תבנית..." 
                className="pl-4 pr-10 bg-card/50 border-white/10 focus-visible:ring-primary h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Style Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">סגנון:</span>
              <button 
                onClick={() => setActiveStyle("הכל")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeStyle === "הכל" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
              >
                הכל
              </button>
              {styles.map(style => (
                <button 
                  key={style}
                  onClick={() => setActiveStyle(style)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeStyle === style ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Strip */}
          <div className="flex items-center gap-6 overflow-x-auto mt-6 pb-2 hide-scrollbar border-t border-white/5 pt-4">
            <button 
              onClick={() => setActiveCategory("הכל")}
              className={`text-sm font-medium whitespace-nowrap transition-all relative ${activeCategory === "הכל" ? "text-primary" : "text-muted-foreground hover:text-white"}`}
            >
              הכל
              {activeCategory === "הכל" && <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-medium whitespace-nowrap transition-all relative ${activeCategory === cat ? "text-primary" : "text-muted-foreground hover:text-white"}`}
              >
                {cat}
                {activeCategory === cat && <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template, index) => (
              <div key={template.id} className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                <TemplateCard template={template} index={index} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center text-muted-foreground">
              לא נמצאו תבניות התואמות את החיפוש שלך.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-card/30 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} תבניות עיצוב. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
