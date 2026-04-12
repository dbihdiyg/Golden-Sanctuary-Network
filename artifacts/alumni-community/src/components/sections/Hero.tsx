import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10" />
        <img 
          src="https://images.unsplash.com/photo-1548625361-ec853f66c986?q=80&w=2070&auto=format&fit=crop" 
          alt="Sacred hall" 
          className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_20s_ease-in-out_infinite]"
        />
      </div>

      <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-6 space-y-8 animate-in fade-in zoom-in duration-1000 fill-mode-forwards">
        <div className="space-y-4">
          <p className="text-primary tracking-[0.2em] uppercase text-sm font-medium opacity-90 font-sans">
            היכל הזיכרון והחיבור
          </p>
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-white glow-text leading-tight">
            קהילת הבוגרים
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
            חיבור לדורות, צמיחה מתוך שורשים, וזיכרונות שנשארים לתמיד. המקום שלכם בקהילה שלנו.
          </p>
        </div>

        <div className="pt-8">
          <Button 
            size="lg" 
            onClick={scrollToContent}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 transition-all duration-500 rounded-full px-8 py-6 text-lg font-sans shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]"
          >
            לכניסה לעדכונים
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer" onClick={scrollToContent}>
        <ChevronDown className="w-8 h-8 text-primary/50" />
      </div>
    </section>
  );
}
