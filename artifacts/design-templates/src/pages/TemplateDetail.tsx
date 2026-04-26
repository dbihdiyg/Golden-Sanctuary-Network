import { useParams, Link } from "wouter";
import { ArrowRight, Download, MessageCircle, Palette, CheckCircle2, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { templates } from "@/lib/data";

export default function TemplateDetail() {
  const params = useParams();
  const id = params.id;
  const template = templates.find(t => t.id === id);

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="font-serif text-3xl mb-4 text-foreground">התבנית לא נמצאה</h1>
        <Link href="/">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">חזור לעמוד הראשי</Button>
        </Link>
      </div>
    );
  }

  const editableItems = ["שמות", "תאריכים", "מיקום", "טקסט", "צבעים"];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">חזרה לגלריה</span>
          </Link>
          
          <div className="flex items-center gap-2 text-primary">
            <span className="font-serif font-bold text-xl text-foreground">תבניות עיצוב</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Image/Preview Column */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="relative rounded-2xl overflow-hidden bg-card/30 border border-card-border aspect-[3/4] md:aspect-auto md:h-[800px] flex items-center justify-center group shadow-2xl">
              {template.isGradient ? (
                <div className="absolute inset-0 w-full h-full" style={{ background: template.image }}>
                  <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay"></div>
                  <div className="absolute inset-8 border-2 border-white/10 rounded-xl flex items-center justify-center p-8 text-center">
                    <h3 className="font-serif text-5xl md:text-6xl font-light text-white/80">{template.title}</h3>
                  </div>
                </div>
              ) : (
                <img 
                  src={template.image} 
                  alt={template.title} 
                  className="w-full h-full object-cover md:object-contain"
                />
              )}
              
              <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl" />
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <div className="sticky top-24">
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary" className="bg-white/5 border-white/10 text-sm">{template.category}</Badge>
                  <Badge variant="outline" className="border-primary/30 text-primary text-sm">{template.style}</Badge>
                </div>
                <h1 className="font-serif text-4xl font-bold mb-2">{template.title}</h1>
                <p className="text-xl text-muted-foreground">{template.subtitle}</p>
              </div>

              <div className="py-6 border-y border-white/5 mb-6 flex justify-between items-center">
                <span className="text-muted-foreground">מחיר מחירון</span>
                <span className="font-sans font-bold text-4xl text-primary">₪{template.price}</span>
              </div>

              <div className="mb-8">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  מה ניתן לערוך?
                </h3>
                <ul className="grid grid-cols-2 gap-3">
                  {editableItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 relative overflow-hidden group">
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <Palette className="w-5 h-5 ml-2 relative z-10" />
                  <span className="relative z-10">התאמה אישית באונליין</span>
                </Button>
                
                <Button size="lg" variant="outline" className="w-full text-lg h-14 border-white/10 hover:bg-white/5">
                  <Download className="w-5 h-5 ml-2" />
                  הורד קובץ מקור
                </Button>

                <Button size="lg" variant="secondary" className="w-full text-lg h-14 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 mt-4">
                  <MessageCircle className="w-5 h-5 ml-2" />
                  הזמן דרך ווצאפ
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center">
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="w-4 h-4" />
                  שתף תבנית זו
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
