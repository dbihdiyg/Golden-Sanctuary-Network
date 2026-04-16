import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, Clock, MessageSquare, BarChart3, Loader2,
  Lock, Eye, EyeOff, TrendingUp, LogOut, Users, ImageIcon,
  Video, ThumbsUp, ThumbsDown, Inbox, Mail, Phone, Trash2, UserCheck, UserX, Bot,
  Monitor, Smartphone, Maximize, Activity, MousePointerClick, Globe, ArrowUp, ArrowDown,
  Repeat2, Sparkles, Chrome, Navigation, RefreshCw, AlertTriangle, X
} from "lucide-react";

/* ─── Safe Delete Confirmation Modal ─────────────────────── */
function ConfirmDeleteModal({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-[2rem] border border-red-500/30 bg-[hsl(232,30%,6%)] p-8 shadow-[0_0_80px_rgba(220,30,30,0.25),0_40px_100px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-full border border-red-500/35 bg-red-500/12 text-red-400 shadow-[0_0_40px_rgba(220,30,30,0.2)]">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-black text-white">מחיקה לצמיתות</h2>
            <p className="text-muted-foreground leading-relaxed">
              האם למחוק את{" "}
              <strong className="text-white font-black">{name}</strong>{" "}
              מרשימת התפוצה?
            </p>
            <p className="text-sm text-red-400/80 font-bold">
              ⚠️ פעולה זו בלתי הפיכה — לא ניתן לשחזר!
            </p>
          </div>

          <div className="flex w-full gap-3 pt-2">
            <button
              autoFocus
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-white/15 bg-white/[0.06] py-3 font-bold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              ביטול
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-2xl border border-red-500/50 bg-red-600/20 py-3 font-black text-red-400 transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-500 hover:shadow-[0_0_30px_rgba(220,30,30,0.35)] focus:outline-none"
            >
              <Trash2 className="inline h-4 w-4 ml-1.5" />
              כן, מחק לצמיתות
            </button>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition hover:text-white"
          aria-label="סגור"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
import Footer from "@/components/sections/Footer";

const TOKEN_KEY = "meirim_admin_token";

interface Question {
  id: number;
  name: string;
  contact: string | null;
  topic: string | null;
  question: string;
  status: string;
  created_at: string;
}

interface Stats {
  questions: number;
  contacts: number;
  posts: number;
}

const STATUS_LABELS: Record<string, string> = { new: "חדש", in_progress: "בטיפול", answered: "נענה" };
const STATUS_COLORS: Record<string, string> = {
  new: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  in_progress: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  answered: "border-green-500/40 bg-green-500/10 text-green-400",
};

function adminFetch(path: string, opts: RequestInit = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
  return fetch(path, {
    ...opts,
    headers: {
      ...(opts.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "שגיאה בכניסה");
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, data.token);
    onSuccess();
  };

  return (
    <main className="relative min-h-[100dvh] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,192,55,0.08),transparent_50%)]" />
      <div className="relative w-full max-w-sm">
        <div className="rounded-[2rem] border border-white/10 bg-card p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-white">פאנל ניהול</h1>
            <p className="mt-1 text-sm text-muted-foreground">בוגרי מאירים · כניסה מנהלים בלבד</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="סיסמת מנהל"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 pr-4 pl-10 text-right text-white outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                autoFocus
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-xl bg-primary py-3 font-black text-primary-foreground transition hover:shadow-[0_0_30px_rgba(245,192,55,0.3)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "כניסה"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

interface MediaSub {
  id: number; user_name: string; user_image: string | null;
  type: string; title: string; description: string | null;
  category: string; status: string; admin_note: string | null;
  submitted_at: string; video_url: string | null;
}

function MediaSubmissions({ token }: { token: string }) {
  const [items, setItems] = useState<MediaSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState("pending");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/media-submissions", { headers: { Authorization: `Bearer ${token}` } });
    setItems(await res.json()); setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string, adminNote = "") => {
    await fetch(`/api/media-submissions/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    setItems(prev => prev.map(s => s.id === id ? { ...s, status, admin_note: adminNote || null } : s));
  };

  const loadPreview = async (id: number) => {
    if (previewLoading === id) return;
    setPreviewLoading(id);
    const res = await fetch(`/api/media-submissions/${id}/full`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    setPreviewImage(d.file_data ?? null);
    setPreviewLoading(null);
  };

  const filtered = filter === "all" ? items : items.filter(s => s.status === filter);

  const pendingCount = items.filter(s => s.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" /> תוכן ממשתמשים
          {pendingCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-black text-white">{pendingCount}</span>}
        </h2>
      </div>
      <div className="flex gap-2 flex-wrap mb-5">
        {[["pending","ממתין"], ["approved","מאושר"], ["rejected","נדחה"], ["all","הכל"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${filter === v ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/5 text-muted-foreground hover:text-white"}`}>
            {l}{v !== "all" && <span className="mr-1.5 opacity-60">({items.filter(s => s.status === v).length})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">אין פריטים בקטגוריה זו.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(s => (
            <div key={s.id} className="rounded-[1.5rem] border border-white/10 bg-card p-5 hover:border-white/20 transition">
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="flex items-center gap-3 md:flex-col md:items-start md:w-36 shrink-0">
                  <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${s.type === "photo" ? "border-blue-400/30 bg-blue-400/10 text-blue-400" : "border-purple-400/30 bg-purple-400/10 text-purple-400"}`}>
                    {s.type === "photo" ? <ImageIcon className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                    {s.type === "photo" ? "תמונה" : "סרטון"}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(s.submitted_at).toLocaleDateString("he-IL")}</span>
                  <span className="font-bold text-white text-xs">{s.user_name}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="font-black text-white">{s.title}</p>
                  {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                  {s.video_url && (
                    <a href={s.video_url} target="_blank" rel="noreferrer"
                      className="text-sm text-primary underline break-all" dir="ltr">{s.video_url}</a>
                  )}
                  <span className="inline-block rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-xs text-muted-foreground">{s.category}</span>
                  {s.type === "photo" && (
                    <div>
                      <button onClick={() => loadPreview(s.id)}
                        className="flex items-center gap-1.5 text-xs text-primary underline hover:text-primary/80">
                        {previewLoading === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                        צפה בתמונה
                      </button>
                    </div>
                  )}
                </div>
                {s.status === "pending" ? (
                  <div className="flex flex-row md:flex-col gap-2 shrink-0">
                    <button onClick={() => updateStatus(s.id, "approved")}
                      className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400 hover:bg-green-500/20 transition">
                      <ThumbsUp className="h-4 w-4" /> אשר
                    </button>
                    <button onClick={() => updateStatus(s.id, "rejected")}
                      className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition">
                      <ThumbsDown className="h-4 w-4" /> דחה
                    </button>
                  </div>
                ) : (
                  <div className="shrink-0">
                    <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${s.status === "approved" ? "border-green-500/40 bg-green-500/10 text-green-400" : "border-red-500/40 bg-red-500/10 text-red-400"}`}>
                      {s.status === "approved" ? "✓ אושר" : "✗ נדחה"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative">
            <img src={previewImage} alt="preview" className="max-h-[80vh] max-w-[90vw] rounded-2xl border border-white/20 object-contain" />
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 rounded-full bg-white/10 p-1.5 hover:bg-white/20">
              <TrendingUp className="h-4 w-4 text-white rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Subscriber {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  studied: string | null;
  contact_person: string | null;
  updates: string[];
  joined_at: string;
  is_active: boolean;
  notes: string | null;
}

function MailingList() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editNotes, setEditNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await adminFetch("/api/newsletter/subscribers");
    if (res.ok) setSubs(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (sub: Subscriber) => {
    await adminFetch(`/api/newsletter/subscribers/${sub.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !sub.is_active }),
    });
    setSubs(prev => prev.map(s => s.id === sub.id ? { ...s, is_active: !sub.is_active } : s));
  };

  const saveNotes = async (id: number) => {
    await adminFetch(`/api/newsletter/subscribers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ notes: noteText }),
    });
    setSubs(prev => prev.map(s => s.id === id ? { ...s, notes: noteText } : s));
    setEditNotes(null);
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    await adminFetch(`/api/newsletter/subscribers/${confirmDelete.id}`, { method: "DELETE" });
    setSubs(prev => prev.filter(s => s.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const filtered = subs.filter(s =>
    s.name.includes(search) || (s.phone ?? "").includes(search) || (s.email ?? "").includes(search)
  );

  const active = subs.filter(s => s.is_active).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">רשימת תפוצה</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{subs.length} נרשמים · {active} פעילים</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש שם / טלפון / מייל…"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-right text-sm text-white outline-none focus:border-primary/50 placeholder:text-muted-foreground/50 w-64"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">אין נרשמים עדיין.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <div key={s.id} className={`rounded-[1.5rem] border bg-card p-5 transition ${s.is_active ? "border-white/10 hover:border-white/20" : "border-white/5 opacity-50"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-black">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white">{s.name}</p>
                    <div className="flex items-center gap-3 flex-wrap mt-1">
                      {s.phone && (
                        <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition" dir="ltr">
                          <Phone className="h-3 w-3" />{s.phone}
                        </a>
                      )}
                      {s.email && (
                        <a href={`mailto:${s.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition" dir="ltr">
                          <Mail className="h-3 w-3" />{s.email}
                        </a>
                      )}
                    </div>
                    {s.studied && <p className="text-xs text-muted-foreground mt-1">📚 {s.studied}</p>}
                    {s.contact_person && <p className="text-xs text-muted-foreground">👤 {s.contact_person}</p>}
                    {s.updates?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.updates.map(u => (
                          <span key={u} className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary">{u}</span>
                        ))}
                      </div>
                    )}
                    {editNotes === s.id ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="הוסף הערה…"
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-right text-white outline-none focus:border-primary/50"
                          autoFocus
                        />
                        <button onClick={() => saveNotes(s.id)} className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">שמור</button>
                        <button onClick={() => setEditNotes(null)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-muted-foreground">ביטול</button>
                      </div>
                    ) : s.notes ? (
                      <p className="mt-1.5 text-xs text-muted-foreground cursor-pointer hover:text-white transition" onClick={() => { setEditNotes(s.id); setNoteText(s.notes ?? ""); }}>
                        💬 {s.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-col md:flex-row">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(s.joined_at).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => toggleActive(s)}
                    title={s.is_active ? "הסר מפעילים" : "הפעל"}
                    className={`rounded-full border p-2 transition ${s.is_active ? "border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400" : "border-white/10 text-muted-foreground hover:border-green-500/30 hover:text-green-400"}`}>
                    {s.is_active ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => { setEditNotes(s.id); setNoteText(s.notes ?? ""); }}
                    title="הוסף הערה"
                    className="rounded-full border border-white/10 p-2 text-muted-foreground transition hover:text-primary hover:border-primary/30">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ id: s.id, name: s.name })}
                    title="מחק לצמיתות"
                    className="rounded-full border border-white/10 p-2 text-muted-foreground/40 transition hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          name={confirmDelete.name}
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

interface ChatSession {
  session_id: string;
  user_name: string | null;
  phone: string | null;
  registered_at: string | null;
  started_at: string;
  last_message_at: string;
  message_count: number;
}

interface ChatMsg {
  role: string;
  content: string;
  created_at: string;
}

function ChatbotSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, ChatMsg[]>>({});
  const [loadingMsgs, setLoadingMsgs] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/chatbot/sessions")
      .then(r => r.json())
      .then(d => { setSessions(d); setLoading(false); });
  }, []);

  const toggleSession = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!msgs[id]) {
      setLoadingMsgs(id);
      const r = await adminFetch(`/api/chatbot/sessions/${id}/messages`);
      const d = await r.json();
      setMsgs(prev => ({ ...prev, [id]: d }));
      setLoadingMsgs(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">שיחות עם הרוחניק</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{sessions.length} שיחות</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : sessions.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">אין שיחות עדיין.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.session_id} className="rounded-[1.5rem] border border-white/10 bg-card overflow-hidden">
              <button
                onClick={() => toggleSession(s.session_id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-white/[0.02] transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/8 text-primary text-xs font-black">
                    AI
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">{s.user_name ?? "אנונימי"}</span>
                      {s.phone && <span className="text-xs text-muted-foreground" dir="ltr">{s.phone}</span>}
                      {s.registered_at && (
                        <span className="rounded-full bg-green-500/10 border border-green-500/30 px-2 py-0.5 text-xs text-green-400">✓ נרשם</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{s.message_count} הודעות</span>
                      <span className="text-xs text-muted-foreground/50">
                        {new Date(s.last_message_at).toLocaleDateString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-muted-foreground transition ${expanded === s.session_id ? "rotate-180" : ""}`}>▼</span>
              </button>
              {expanded === s.session_id && (
                <div className="border-t border-white/10 p-4 space-y-2 max-h-96 overflow-y-auto bg-black/20">
                  {loadingMsgs === s.session_id ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                  ) : (msgs[s.session_id] ?? []).map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`} dir="rtl">
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === "user" ? "bg-primary/20 text-primary-foreground border border-primary/30 rounded-tr-sm" : "bg-white/5 border border-white/10 text-muted-foreground rounded-tl-sm"
                      }`}>{m.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface AnalyticsData {
  total_visits: number;
  desktop_visits: number;
  mobile_visits: number;
  active_now: number;
  active_desktop: number;
  active_mobile: number;
  fullscreen_count: number;
  visits_by_day: { day: string; visits: number }[];
  peak_hours: { hour: number; visits: number }[];
  top_pages: { page: string; visits: number }[];
  browser_breakdown: { browser: string; visits: number }[];
  today_visits: number;
  yesterday_visits: number;
  new_visitors: number;
  returning_visitors: number;
  recent_visits: { page: string; device_type: string; browser: string; visited_at: string }[];
}

const PAGE_LABELS: Record<string, string> = {
  "/": "עמוד הבית",
  "/forum": "פורום",
  "/video": "וידאו",
  "/live": "שידור חי",
  "/gallery": "גלריה",
  "/library": "ספרייה",
  "/newsletter": "ניוזלטר",
};

const BROWSER_COLORS: Record<string, string> = {
  Chrome: "bg-yellow-400",
  Firefox: "bg-orange-400",
  Safari: "bg-blue-400",
  Edge: "bg-cyan-400",
  Opera: "bg-red-400",
  IE: "bg-gray-400",
  Other: "bg-purple-400",
  unknown: "bg-white/20",
};

function StatCard({ icon: Icon, label, value, sub, color, pulse }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string; pulse?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-card p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`relative h-8 w-8 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("400", "400/15").replace("primary", "primary/15")}`}>
          {pulse && <span className="absolute inset-0 rounded-xl animate-ping opacity-30" style={{ background: "currentColor" }} />}
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className={`text-3xl font-black ${color}`}>{typeof value === "number" ? value.toLocaleString("he-IL") : value}</p>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color, count }: { label: string; value: number; max: number; color: string; count: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground truncate max-w-[60%]">{label}</span>
        <span className="font-bold text-white">{count.toLocaleString("he-IL")} <span className="text-muted-foreground font-normal text-xs">({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "היום";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "אתמול";
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" });
}

function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const res = await adminFetch("/api/admin/analytics");
    if (res.ok) {
      setData(await res.json());
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const maxDayVisits = Math.max(...data.visits_by_day.map(d => d.visits), 1);
  const maxHour = Math.max(...data.peak_hours.map(h => h.visits), 1);
  const maxPage = Math.max(...data.top_pages.map(p => p.visits), 1);
  const maxBrowser = Math.max(...data.browser_breakdown.map(b => b.visits), 1);
  const desktopPct = data.total_visits > 0 ? Math.round((data.desktop_visits / data.total_visits) * 100) : 0;
  const mobilePct = data.total_visits > 0 ? Math.round((data.mobile_visits / data.total_visits) * 100) : 0;
  const todayDiff = data.today_visits - data.yesterday_visits;
  const totalNV = data.new_visitors + data.returning_visitors;
  const newPct = totalNV > 0 ? Math.round((data.new_visitors / totalNV) * 100) : 0;
  const retPct = totalNV > 0 ? Math.round((data.returning_visitors / totalNV) * 100) : 0;
  const last30 = data.visits_by_day.reduce((s, d) => s + d.visits, 0);

  const PEAK_HOUR = data.peak_hours.reduce((a, b) => (b.visits > a.visits ? b : a), { hour: 0, visits: 0 });

  return (
    <div className="space-y-5" dir="rtl">
      {lastUpdated && (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          עודכן: {lastUpdated.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={MousePointerClick} label="סה״כ ביקורים" value={data.total_visits} color="text-primary" />
        <StatCard icon={Activity} label="מחוברים עכשיו" value={data.active_now} sub={`${data.active_desktop} מחשב · ${data.active_mobile} נייד`} color="text-green-400" pulse={data.active_now > 0} />
        <StatCard icon={TrendingUp} label="ביקורים היום" value={data.today_visits}
          sub={todayDiff >= 0 ? `+${todayDiff} מאתמול` : `${todayDiff} מאתמול`}
          color={todayDiff >= 0 ? "text-emerald-400" : "text-red-400"} />
        <StatCard icon={Sparkles} label="גולשים חדשים" value={data.new_visitors} sub={`${newPct}% מכלל הגולשים`} color="text-cyan-400" />
        <StatCard icon={Repeat2} label="גולשים חוזרים" value={data.returning_visitors} sub={`${retPct}% מכלל הגולשים`} color="text-purple-400" />
        <StatCard icon={BarChart3} label="30 יום אחרונים" value={last30} color="text-yellow-400" />
      </div>

      {/* Today vs Yesterday */}
      <div className="rounded-[1.5rem] border border-white/10 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> היום מול אתמול
          </h3>
          {todayDiff >= 0
            ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 rounded-full px-2.5 py-1"><ArrowUp className="h-3 w-3" />+{todayDiff} ביקורים</span>
            : <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/10 rounded-full px-2.5 py-1"><ArrowDown className="h-3 w-3" />{todayDiff} ביקורים</span>
          }
        </div>
        <div className="flex gap-4 items-end h-20">
          {[
            { label: "אתמול", value: data.yesterday_visits, color: "bg-white/20" },
            { label: "היום", value: data.today_visits, color: "bg-primary" },
          ].map(({ label, value, color }) => {
            const maxV = Math.max(data.today_visits, data.yesterday_visits, 1);
            const h = Math.round((value / maxV) * 100);
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-white">{value}</span>
                <div className="w-full rounded-t-lg bg-white/5 flex flex-col justify-end" style={{ height: "60px" }}>
                  <div className={`w-full rounded-t-lg ${color} transition-all`} style={{ height: `${h}%`, minHeight: value > 0 ? "4px" : "0" }} />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            );
          })}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 pb-5">
            {todayDiff >= 0
              ? <ArrowUp className="h-8 w-8 text-emerald-400" />
              : <ArrowDown className="h-8 w-8 text-red-400" />
            }
            <span className={`text-sm font-black ${todayDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {todayDiff >= 0 ? "+" : ""}{data.yesterday_visits > 0 ? Math.round((todayDiff / data.yesterday_visits) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 30-day trend */}
      {data.visits_by_day.length > 0 && (
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
          <h3 className="text-sm font-black text-white mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-yellow-400" /> ביקורים לפי יום — 30 ימים אחרונים
          </h3>
          <div className="flex items-end gap-1 h-24 overflow-x-auto">
            {data.visits_by_day.map(d => {
              const heightPct = Math.round((d.visits / maxDayVisits) * 100);
              const date = new Date(d.day);
              const label = date.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" });
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div key={d.day} className="flex-1 min-w-[10px] flex flex-col items-center gap-1" title={`${label}: ${d.visits} ביקורים`}>
                  <div className="w-full rounded-t-sm bg-white/5 flex flex-col justify-end" style={{ height: "72px" }}>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ${isToday ? "bg-primary" : "bg-primary/40 hover:bg-primary/70"}`}
                      style={{ height: `${heightPct}%`, minHeight: d.visits > 0 ? "3px" : "0" }}
                    />
                  </div>
                  {data.visits_by_day.length <= 14 && (
                    <span className="text-[9px] text-muted-foreground">{label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Peak Hours */}
      <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-400" /> שעות השיא
          </h3>
          <span className="text-xs text-muted-foreground bg-white/5 rounded-full px-3 py-1">
            שיא: {PEAK_HOUR.hour}:00–{PEAK_HOUR.hour + 1}:00
          </span>
        </div>
        <div className="flex items-end gap-0.5 h-20">
          {data.peak_hours.map(h => {
            const heightPct = Math.round((h.visits / maxHour) * 100);
            const isDay = h.hour >= 7 && h.hour <= 22;
            const isPeak = h.hour === PEAK_HOUR.hour;
            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1" title={`${h.hour}:00 — ${h.visits} ביקורים`}>
                <div className="w-full rounded-t-sm bg-white/5 flex flex-col justify-end" style={{ height: "64px" }}>
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${isPeak ? "bg-orange-400" : isDay ? "bg-orange-400/35 hover:bg-orange-400/60" : "bg-white/10"}`}
                    style={{ height: `${heightPct}%`, minHeight: h.visits > 0 ? "2px" : "0" }}
                  />
                </div>
                {[0, 6, 12, 18, 23].includes(h.hour) && (
                  <span className="text-[9px] text-muted-foreground">{h.hour}</span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">שעות 0–23 · כל עמודה = שעה אחת</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Pages */}
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-cyan-400" /> עמודים פופולריים
          </h3>
          <div className="space-y-3">
            {data.top_pages.length === 0 && (
              <p className="text-sm text-muted-foreground">אין נתונים עדיין</p>
            )}
            {data.top_pages.map(p => (
              <BarRow
                key={p.page}
                label={PAGE_LABELS[p.page] ?? p.page}
                value={p.visits}
                max={maxPage}
                color="bg-cyan-400"
                count={p.visits}
              />
            ))}
          </div>
        </div>

        {/* Browser Breakdown */}
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-400" /> דפדפנים
          </h3>
          <div className="space-y-3">
            {data.browser_breakdown.length === 0 && (
              <p className="text-sm text-muted-foreground">אין נתונים עדיין</p>
            )}
            {data.browser_breakdown.map(b => (
              <BarRow
                key={b.browser}
                label={b.browser}
                value={b.visits}
                max={maxBrowser}
                color={BROWSER_COLORS[b.browser] ?? "bg-white/30"}
                count={b.visits}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device */}
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" /> מכשירים
          </h3>
          <div className="space-y-3">
            <BarRow label="מחשב" value={data.desktop_visits} max={data.total_visits} color="bg-primary" count={data.desktop_visits} />
            <BarRow label="סמארטפון" value={data.mobile_visits} max={data.total_visits} color="bg-blue-400" count={data.mobile_visits} />
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-muted-foreground">
            <span>מחשב: {desktopPct}%</span>
            <span>נייד: {mobilePct}%</span>
          </div>
        </div>

        {/* New vs Returning */}
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-pink-400" /> גולשים חדשים מול חוזרים
          </h3>
          <div className="flex items-center gap-6 mb-4">
            <div className="relative h-20 w-20 shrink-0">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.8" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(34,211,238)" strokeWidth="3.8"
                  strokeDasharray={`${newPct} ${100 - newPct}`} strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(168,85,247)" strokeWidth="3.8"
                  strokeDasharray={`${retPct} ${100 - retPct}`}
                  strokeDashoffset={`-${newPct}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-black text-white">{totalNV}</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shrink-0" />חדשים</span>
                <span className="font-black text-white">{data.new_visitors} <span className="text-muted-foreground font-normal text-xs">({newPct}%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-purple-400 shrink-0" />חוזרים</span>
                <span className="font-black text-white">{data.returning_visitors} <span className="text-muted-foreground font-normal text-xs">({retPct}%)</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
        <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-400" />
          <span>פעילות אחרונה</span>
          <span className="mr-auto h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        </h3>
        {data.recent_visits.length === 0 ? (
          <p className="text-sm text-muted-foreground">אין ביקורים עדיין</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.recent_visits.map((v, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-2.5 text-sm">
                {v.device_type === "mobile"
                  ? <Smartphone className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  : <Monitor className="h-3.5 w-3.5 text-primary shrink-0" />
                }
                <span className="text-white font-bold truncate max-w-[120px]">
                  {PAGE_LABELS[v.page] ?? v.page}
                </span>
                <span className="text-muted-foreground text-xs">{v.browser}</span>
                <span className="mr-auto text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(v.visited_at)} {formatTime(v.visited_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extra stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-5">
          <Maximize className="h-4 w-4 text-blue-400 mb-3" />
          <p className="text-3xl font-black text-blue-400">{data.fullscreen_count.toLocaleString("he-IL")}</p>
          <p className="text-sm font-bold text-white">פתיחות מסך מלא</p>
          <p className="text-xs text-muted-foreground mt-0.5">PDF / וידאו</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-5">
          <Clock className="h-4 w-4 text-orange-400 mb-3" />
          <p className="text-3xl font-black text-orange-400">{PEAK_HOUR.hour}:00</p>
          <p className="text-sm font-bold text-white">שעת השיא</p>
          <p className="text-xs text-muted-foreground mt-0.5">{PEAK_HOUR.visits} ביקורים</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-card p-5 col-span-2 md:col-span-1">
          <Users className="h-4 w-4 text-pink-400 mb-3" />
          <p className="text-3xl font-black text-pink-400">{data.active_now}</p>
          <p className="text-sm font-bold text-white">מחוברים עכשיו</p>
          <p className="text-xs text-muted-foreground mt-0.5">פעיל ב-10 דקות האחרונות</p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("הכל");
  const [tab, setTab] = useState<"questions" | "media" | "newsletter" | "chatbot" | "analytics">("questions");

  const load = useCallback(async () => {
    setLoading(true);
    const [qRes, sRes] = await Promise.all([
      adminFetch("/api/admin/questions"),
      adminFetch("/api/admin/stats"),
    ]);
    if (qRes.status === 401) { onLogout(); return; }
    setQuestions(await qRes.json());
    setStats(await sRes.json());
    setLoading(false);
  }, [onLogout]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, status: string) => {
    await adminFetch(`/api/admin/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    onLogout();
  };

  const filtered = filter === "הכל" ? questions : questions.filter(q => q.status === filter);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(245,192,55,0.08),transparent_35%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-14 space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary">פאנל ניהול</p>
            <h1 className="text-3xl font-black text-white mt-1">בוגרי מאירים</h1>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition">
            <LogOut className="h-4 w-4" />
            יציאה
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "שאלות לרבנים", value: stats.questions, icon: MessageSquare, color: "text-primary" },
              { label: "פוסטים בקהילה", value: stats.posts, icon: Users, color: "text-blue-400" },
              { label: "ממתינות לטיפול", value: questions.filter(q => q.status === "new").length, icon: BarChart3, color: "text-yellow-400" },
            ].map(s => (
              <div key={s.label} className="rounded-[1.5rem] border border-white/10 bg-card p-5">
                <s.icon className={`h-6 w-6 ${s.color} mb-3`} />
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1 mb-2 overflow-x-auto scrollbar-none">
          {([["questions", "שאלות לרב", MessageSquare], ["media", "תוכן ממשתמשים", Inbox], ["newsletter", "רשימת תפוצה", Mail], ["chatbot", "שיחות AI", Bot], ["analytics", "סטטיסטיקות", BarChart3]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition whitespace-nowrap ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"}`}>
              <Icon className="h-4 w-4" />{l}
            </button>
          ))}
        </div>

        {tab === "media" && <MediaSubmissions token={sessionStorage.getItem(TOKEN_KEY) ?? ""} />}
        {tab === "newsletter" && <MailingList />}
        {tab === "chatbot" && <ChatbotSessions />}
        {tab === "analytics" && <AnalyticsPanel />}

        {tab === "questions" && <div>
          <h2 className="text-xl font-black text-white mb-4">שאלות לרבני הקהילה</h2>

          <div className="flex gap-2 flex-wrap mb-5">
            {["הכל", "new", "in_progress", "answered"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/5 text-muted-foreground hover:text-white"}`}>
                {f === "הכל" ? "הכל" : STATUS_LABELS[f]}
                {f !== "הכל" && <span className="mr-1.5 opacity-60">({questions.filter(q => q.status === f).length})</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-12">אין שאלות בקטגוריה זו.</p>
              )}
              {filtered.map(q => (
                <div key={q.id} className="rounded-[1.5rem] border border-white/10 bg-card p-6 hover:border-white/20 transition">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-white">{q.name}</span>
                        {q.contact && <span className="text-sm text-muted-foreground">{q.contact}</span>}
                        {q.topic && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{q.topic}</span>
                        )}
                        <span className="text-xs text-muted-foreground mr-auto">
                          {new Date(q.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{q.question}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[130px] shrink-0">
                      <span className={`self-start rounded-full border px-3 py-1 text-xs font-bold ${STATUS_COLORS[q.status] ?? STATUS_COLORS.new}`}>
                        {STATUS_LABELS[q.status] ?? q.status}
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {q.status !== "in_progress" && (
                          <button onClick={() => updateStatus(q.id, "in_progress")}
                            className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition">
                            <TrendingUp className="h-3 w-3" />
                            בטיפול
                          </button>
                        )}
                        {q.status !== "answered" && (
                          <button onClick={() => updateStatus(q.id, "answered")}
                            className="flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400 hover:bg-green-500/20 transition">
                            <CheckCircle className="h-3 w-3" />
                            נענה
                          </button>
                        )}
                        {q.status !== "new" && (
                          <button onClick={() => updateStatus(q.id, "new")}
                            className="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400 hover:bg-yellow-500/20 transition">
                            <Clock className="h-3 w-3" />
                            חדש
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>}
      </div>
      <Footer />
    </main>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) { setAuthed(false); return; }
    fetch("/api/admin/verify", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}
