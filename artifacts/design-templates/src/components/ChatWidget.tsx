import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";

type Message = {
  id: string;
  type: "user" | "bot";
  text: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: "1", type: "bot", text: t("chat_greeting", lang) }
      ]);
    }
  }, [isOpen, messages.length, lang]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const faqs = [
    { question: "כמה עולה הזמנה?", answer: "המחירים מתחילים מ-₪19 לתבנית בסיסית ועד ₪120 לקליפ וידאו. ניתן לראות את כל המחירים בגלריה שלנו." },
    { question: "תוך כמה זמן?", answer: "סקיצה ראשונה תוך 24 שעות. שירות אקספרס זמין תוך 6 שעות בתוספת תשלום." },
    { question: "אפשר לשנות צבעים?", answer: "כן! כל תבנית ניתנת להתאמה מלאה — שמות, תאריכים, צבעים, טקסט וכן הלאה." }
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newUserMsg: Message = { id: Date.now().toString(), type: "user", text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: "bot", text: "תודה! נחזור אליך בהקדם." }]);
    }, 1000);
  };

  const handleFaqClick = (faq: { question: string, answer: string }) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: "user", text: faq.question }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: "bot", text: faq.answer }]);
    }, 500);
  };

  const handleRepresentative = () => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type: "user", text: "דבר עם נציג" }]);
    window.open(`https://wa.me/972500000000?text=${encodeURIComponent("שלום, אשמח לשוחח עם נציג")}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start" style={lang === "he" ? { right: "24px", left: "auto" } : { left: "24px", right: "auto" }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[300px] h-[420px] bg-card border border-primary/40 rounded-2xl shadow-xl flex flex-col overflow-hidden mb-4"
          >
            <div className="bg-secondary p-4 flex items-center justify-between border-b border-primary/20">
              <h3 className="font-bold text-foreground text-cream">{t("chat_title", lang)}</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.type === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 mt-2">
                {faqs.map((faq, i) => (
                  <button key={i} onClick={() => handleFaqClick(faq)} className="text-xs bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors text-right">
                    {faq.question}
                  </button>
                ))}
                <button onClick={handleRepresentative} className="text-xs bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors text-right">
                  דבר עם נציג
                </button>
              </div>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-primary/20 bg-background/50 flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="הקלד הודעה..." 
                className="flex-1 bg-secondary text-foreground text-sm rounded-full px-4 border border-primary/20 focus:outline-none focus:border-primary/50"
              />
              <button onClick={handleSend} className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 flex-shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-secondary border border-primary flex items-center justify-center shadow-lg relative"
      >
        <MessageCircle className="w-6 h-6 text-primary" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-secondary rounded-full animate-pulse"></span>
      </motion.button>
    </div>
  );
}