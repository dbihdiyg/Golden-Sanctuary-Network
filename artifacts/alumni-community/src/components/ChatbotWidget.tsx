import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

function getSessionId() {
  let id = sessionStorage.getItem("chatbot_session");
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("chatbot_session", id);
  }
  return id;
}

const GREET = "שלום! אני רוחניק — העוזר הרוחני של קהילת בוגרי מאירים 🌟\n\nאני כאן לתת חיזוקים, השראה מהתורה והחסידות, ולענות על שאלות בנושאי יהדות וקהילתנו.\n\nרוצה להצטרף לרשימת התפוצה? פשוט תגיד לי!\n\nבמה אוכל לחזק אותך היום?";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREET },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    setMessages(prev => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "", loading: true },
    ]);

    const sessionId = getSessionId();
    let assembled = "";

    try {
      const res = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });

      if (!res.ok || !res.body) throw new Error("שגיאה");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            assembled += data.content;
            setMessages(prev =>
              prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assembled, loading: false } : m)
            );
          }
          if (data.done || data.error) break;
        }
      }
    } catch {
      setMessages(prev =>
        prev.map((m, i) => i === prev.length - 1 ? { ...m, content: "מצטער, אירעה שגיאה. נסה שוב.", loading: false } : m)
      );
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3" dir="rtl">
      {open && (
        <div className="w-[340px] sm:w-[380px] rounded-[2rem] border border-white/15 bg-[#0e0e0e] shadow-[0_24px_80px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
          style={{ maxHeight: "calc(100dvh - 120px)" }}>

          <div className="flex items-center justify-between gap-3 bg-[radial-gradient(circle_at_80%_50%,rgba(245,192,55,0.18),transparent_70%)] border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-white text-sm leading-tight">רוחניק</p>
                <p className="text-xs text-muted-foreground">עוזר רוחני · קהילת מאירים</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground hover:text-white hover:bg-white/10 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary mt-1">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-white/[0.06] border border-white/10 text-white rounded-tl-sm"
                }`}>
                  {m.loading ? (
                    <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" /> חושב…
                    </span>
                  ) : m.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2 items-end rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="שאל, בקש חיזוק, או הצטרף לרשימה…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground/50 max-h-24"
                style={{ lineHeight: "1.5" }}
                dir="rtl"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:shadow-[0_0_16px_rgba(245,192,55,0.4)] disabled:opacity-40 disabled:cursor-not-allowed">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">מוגבל לתורה, חסידות וקהילת מאירים</p>
          </div>
        </div>
      )}

      <button
        onClick={() => { setOpen(o => !o); setPulse(false); }}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary shadow-[0_8px_40px_rgba(245,192,55,0.25)] transition hover:bg-primary hover:text-primary-foreground hover:shadow-[0_8px_40px_rgba(245,192,55,0.45)] ${open ? "bg-primary text-primary-foreground" : ""}`}>
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
        {!open && pulse && (
          <span className="absolute inset-0 rounded-full border border-primary/60 animate-ping" />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground shadow">AI</span>
        )}
      </button>
    </div>
  );
}
