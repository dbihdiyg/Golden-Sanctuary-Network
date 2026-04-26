import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Crown, ArrowRight } from "lucide-react";

export default function Order() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="bg-secondary/50 backdrop-blur-md p-10 rounded-2xl border border-primary/20 text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">קיבלנו!</h2>
          <p className="text-lg text-muted-foreground mb-8">ניצור קשר תוך 24 שעות.</p>
          <Link href="/">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              חזרה לעמוד הראשי
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">חזרה לגלריה</span>
          </Link>
          <Link href="/">
            <div className="flex flex-col items-center justify-center text-primary cursor-pointer relative">
              <Crown className="w-5 h-5 absolute -top-4 text-primary" strokeWidth={2.5} />
              <span className="font-serif font-bold text-2xl text-foreground">הדר</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">הגישו בריף אישי</h1>
          <p className="text-xl text-muted-foreground">ספרו לנו על האירוע שלכם ונתחיל לעצב</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-secondary/30 border border-primary/10 rounded-2xl p-6 md:p-10 space-y-8">
          
          <div className="space-y-3">
            <Label htmlFor="projectType" className="text-base text-foreground">סוג פרויקט</Label>
            <Select required>
              <SelectTrigger id="projectType" className="h-12 bg-white text-secondary-foreground border-none">
                <SelectValue placeholder="בחרו סוג פרויקט" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wedding">הזמנה לחתונה</SelectItem>
                <SelectItem value="kiddush">הזמנה לקידוש</SelectItem>
                <SelectItem value="event">מודעה לאירוע</SelectItem>
                <SelectItem value="video">קליפ וידאו</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="names" className="text-base text-foreground">שמות מרכזיים</Label>
            <Input id="names" required placeholder="לדוגמה: משה ורחל" className="h-12 bg-white text-secondary-foreground border-none placeholder:text-muted-foreground/60" />
          </div>

          <div className="space-y-3">
            <Label htmlFor="date" className="text-base text-foreground">תאריך האירוע</Label>
            <Input id="date" type="date" required className="h-12 bg-white text-secondary-foreground border-none block w-full" />
          </div>

          <div className="space-y-4">
            <Label className="text-base text-foreground">סגנון מבוקש</Label>
            <RadioGroup defaultValue="classic" className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { value: "luxury", label: "יוקרתי" },
                { value: "chasidi", label: "חסידי" },
                { value: "modern", label: "מודרני" },
                { value: "classic", label: "קלאסי" },
                { value: "gold", label: "זהב" },
                { value: "minimal", label: "מינימליסטי" },
              ].map((style) => (
                <div key={style.value} className="flex items-center space-x-2 space-x-reverse border border-white/10 rounded-lg p-3 bg-secondary/50">
                  <RadioGroupItem value={style.value} id={`style-${style.value}`} className="border-primary text-primary" />
                  <Label htmlFor={`style-${style.value}`} className="cursor-pointer font-medium">{style.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base text-foreground">הערות נוספות</Label>
            <Textarea id="notes" placeholder="פרטים נוספים, רעיונות, או בקשות מיוחדות..." className="min-h-[120px] bg-white text-secondary-foreground border-none resize-none placeholder:text-muted-foreground/60" />
          </div>

          <div className="space-y-3">
            <Label htmlFor="whatsapp" className="text-base text-foreground">מספר ווצאפ לחזרה</Label>
            <Input id="whatsapp" type="tel" dir="ltr" className="text-right h-12 bg-white text-secondary-foreground border-none placeholder:text-muted-foreground/60" placeholder="050-000-0000" required />
          </div>

          <Button type="submit" size="lg" className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
            שלחו בריף
          </Button>

        </form>
      </main>
    </div>
  );
}