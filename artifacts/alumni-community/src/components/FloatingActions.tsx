import { HelpCircle, MessageCircle, Send } from "lucide-react";
import { Link } from "wouter";
import { contact } from "@/content/community";

export default function FloatingActions() {
  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-3">
      <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="group grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-[0_0_38px_rgba(245,192,55,0.35)] transition hover:scale-110">
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">וואטסאפ</span>
      </a>
      <Link href="/ask-rabbi" className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-background/80 text-primary shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:bg-blue-brand">
        <HelpCircle className="h-5 w-5" />
        <span className="sr-only">שאל את הרב</span>
      </Link>
      <Link href="/join" className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-background/80 text-primary shadow-2xl backdrop-blur-xl transition hover:scale-110 hover:bg-blue-brand">
        <Send className="h-5 w-5" />
        <span className="sr-only">הצטרפות לעדכונים</span>
      </Link>
    </div>
  );
}