import { useState, useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import hadarLogo from "@/assets/logo-hadar.png";
import {
  ArrowRight, MessageCircle, Plus, Send, ChevronRight,
  Loader2, Clock, CheckCircle, AlertCircle, Paperclip,
  X, RefreshCw, Tag, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");

// ── Types ─────────────────────────────────────────────────────────────────────
interface Ticket {
  id: number;
  subject: string;
  status: "open" | "in_progress" | "closed";
  unreadUser: number;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: number;
  ticketId: number;
  senderType: "user" | "admin";
  senderLabel: string;
  message: string;
  attachmentUrl: string | null;
  createdAt: string;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "open") return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full px-2 py-0.5 font-medium">
      <Circle className="w-2 h-2 fill-blue-500" />פתוחה
    </span>
  );
  if (status === "in_progress") return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full px-2 py-0.5 font-medium">
      <Clock className="w-2.5 h-2.5" />בטיפול
    </span>
  );
  if (status === "closed") return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-green-500/10 text-green-700 border border-green-500/20 rounded-full px-2 py-0.5 font-medium">
      <CheckCircle className="w-2.5 h-2.5" />סגורה
    </span>
  );
  return null;
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" }) +
    " " + date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 2) return "עכשיו";
  if (min < 60) return `לפני ${min} דקות`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `לפני ${hr} שעות`;
  return new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

// ── New Ticket Form ───────────────────────────────────────────────────────────
function NewTicketForm({ onCreated, onCancel }: { onCreated: (t: Ticket) => void; onCancel: () => void }) {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!subject.trim() || !message.trim()) { setError("נא למלא נושא והודעה"); return; }
    setSending(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/hadar/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          userEmail: user?.primaryEmailAddress?.emailAddress || "",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const ticket = await res.json();
      onCreated(ticket);
    } catch (e: any) {
      setError(e.message || "שגיאה בשליחה");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-primary/15 rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-xl font-bold">פנייה חדשה</h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">נושא הפנייה</label>
        <input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="לדוגמה: בעיה בהורדת הקובץ"
          className="w-full border border-primary/15 rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">תוכן הפנייה</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          placeholder="תארו את הבעיה או השאלה שלכם..."
          className="w-full border border-primary/15 rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">ביטול</Button>
        <Button
          onClick={send}
          disabled={sending || !subject.trim() || !message.trim()}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          שליחה
        </Button>
      </div>
    </motion.div>
  );
}

// ── Chat View ─────────────────────────────────────────────────────────────────
function TicketChat({ ticket, onBack, onUpdated }: { ticket: Ticket; onBack: () => void; onUpdated: (t: Ticket) => void }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/hadar/tickets/${ticket.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCurrentTicket(data.ticket);
      setMessages(data.messages || []);
      onUpdated(data.ticket);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    pollRef.current = setInterval(load, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/hadar/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: reply.trim(),
          userEmail: user?.primaryEmailAddress?.emailAddress || "",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setReply("");
      await load();
    } catch (e: any) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
          <ArrowRight className="w-4 h-4" />
          חזרה
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-base truncate">{currentTicket.subject}</h2>
            <StatusBadge status={currentTicket.status} />
          </div>
          <p className="text-xs text-muted-foreground">פנייה #{currentTicket.id} · {formatRelative(currentTicket.updatedAt)}</p>
        </div>
        <button onClick={load} className="text-muted-foreground hover:text-foreground p-1" title="רענן">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[300px] max-h-[460px] pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">אין הודעות עדיין</div>
        ) : (
          messages.map(msg => {
            const isUser = msg.senderType === "user";
            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isUser
                    ? "bg-secondary/60 text-foreground rounded-tr-sm"
                    : "bg-primary text-primary-foreground rounded-tl-sm"
                }`}>
                  {!isUser && (
                    <p className="text-[10px] font-semibold opacity-70 mb-1">{msg.senderLabel}</p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  {msg.attachmentUrl && (
                    <a href={msg.attachmentUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs underline mt-1 opacity-80">
                      <Paperclip className="w-3 h-3" />קובץ מצורף
                    </a>
                  )}
                  <p className={`text-[10px] mt-1.5 opacity-60`}>{formatRelative(msg.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {currentTicket.status !== "closed" ? (
        <div className="border border-primary/15 rounded-2xl bg-card overflow-hidden">
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={handleKey}
            rows={3}
            placeholder="הקלידו תגובה... (Ctrl+Enter לשליחה)"
            className="w-full px-4 py-3 text-sm bg-transparent resize-none focus:outline-none border-b border-primary/10"
          />
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-[10px] text-muted-foreground">Ctrl+Enter לשליחה</p>
            <Button
              size="sm"
              onClick={sendReply}
              disabled={sending || !reply.trim()}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 h-8"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              שלחו
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground bg-secondary/30 rounded-xl border border-primary/10">
          <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
          פנייה זו נסגרה. לשאלות נוספות, פתחו פנייה חדשה.
        </div>
      )}
    </motion.div>
  );
}

// ── Quick Reply Templates ─────────────────────────────────────────────────────
const QUICK_SUBJECTS = [
  "בעיה בהורדת הקובץ",
  "בעיה בתשלום",
  "שאלה לגבי עיצוב",
  "הגדרת טקסט בקינבס",
  "בקשת החזר",
  "אחר",
];

// ── Main Support Page ─────────────────────────────────────────────────────────
export default function Support() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [, navigate] = useLocation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/hadar/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTickets(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) { navigate("/sign-in"); return; }
    if (isSignedIn) load();
  }, [isLoaded, isSignedIn]);

  const handleCreated = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    setShowNew(false);
    setActiveTicket(ticket);
  };

  const handleUpdated = (ticket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
  };

  const unreadCount = tickets.reduce((n, t) => n + (t.unreadUser || 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">
      {/* Header */}
      <header className="border-b border-primary/10 bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium hidden sm:inline">חזרה לגלריה</span>
          </Link>
          <Link href="/">
            <img src={hadarLogo} alt="הדר" style={{ height: 38, width: "auto", objectFit: "contain", cursor: "pointer" }} />
          </Link>
          <button onClick={load} title="רענן" className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-1 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary" />
              מרכז התמיכה
              {unreadCount > 0 && !activeTicket && (
                <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-0.5">{unreadCount}</span>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">שלחו פנייה וצוות הדר יחזור אליכם בהקדם</p>
          </div>
          {!activeTicket && (
            <Button
              onClick={() => { setShowNew(true); setActiveTicket(null); }}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              פנייה חדשה
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Active ticket chat */}
          {activeTicket ? (
            <TicketChat
              key={activeTicket.id}
              ticket={activeTicket}
              onBack={() => { setActiveTicket(null); load(); }}
              onUpdated={handleUpdated}
            />
          ) : showNew ? (
            <NewTicketForm
              key="new"
              onCreated={handleCreated}
              onCancel={() => setShowNew(false)}
            />
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Quick subject chips */}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">נושאים נפוצים:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUBJECTS.map(s => (
                    <button
                      key={s}
                      onClick={() => setShowNew(true)}
                      className="text-xs px-3 py-1.5 border border-primary/20 rounded-full text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets list */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-primary/10">
                  <MessageCircle className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <h2 className="font-serif text-xl text-foreground mb-2">אין פניות עדיין</h2>
                  <p className="text-muted-foreground mb-6 text-sm">שלחו לנו פנייה ונחזור אליכם בהקדם האפשרי</p>
                  <Button onClick={() => setShowNew(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    פנייה חדשה
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket, i) => (
                    <motion.button
                      key={ticket.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setActiveTicket(ticket)}
                      className="w-full text-right bg-card border border-primary/10 rounded-xl px-4 py-3.5 hover:border-primary/30 transition-all hover:shadow-sm group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="font-semibold text-sm text-foreground truncate">{ticket.subject}</span>
                            {ticket.unreadUser > 0 && (
                              <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5">
                                {ticket.unreadUser} חדש
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>#{ticket.id}</span>
                            <StatusBadge status={ticket.status} />
                            <span>{formatRelative(ticket.updatedAt)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 rotate-180" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
