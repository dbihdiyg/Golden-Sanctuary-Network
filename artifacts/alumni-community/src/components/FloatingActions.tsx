import { HelpCircle, MessageCircle, Send } from "lucide-react";
import { Link } from "wouter";
import { contact } from "@/content/community";

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function FloatingActions() {
  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-3">
      <a
        href="https://www.youtube.com/@%D7%91%D7%95%D7%92%D7%A8%D7%99-%D7%9E%D7%90%D7%99%D7%A8%D7%99%D7%9D"
        target="_blank"
        rel="noreferrer"
        className="grid h-12 w-12 place-items-center rounded-full border border-red-600/50 bg-red-600 text-white shadow-[0_0_28px_rgba(220,38,38,0.45)] transition hover:scale-110"
      >
        <YouTubeIcon />
        <span className="sr-only">ערוץ יוטיוב</span>
      </a>
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