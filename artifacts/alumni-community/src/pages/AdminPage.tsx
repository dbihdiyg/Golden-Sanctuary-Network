import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, Clock, MessageSquare, BarChart3, Loader2,
  Lock, Eye, EyeOff, TrendingUp, LogOut, Users, ImageIcon,
  Video, ThumbsUp, ThumbsDown, Inbox, Mail, Phone, Trash2, UserCheck, UserX
} from "lucide-react";
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

  const deleteSub = async (id: number) => {
    if (!confirm("האם למחוק את הנרשם?")) return;
    await adminFetch(`/api/newsletter/subscribers/${id}`, { method: "DELETE" });
    setSubs(prev => prev.filter(s => s.id !== id));
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
                  <button onClick={() => deleteSub(s.id)} title="מחק"
                    className="rounded-full border border-white/10 p-2 text-muted-foreground transition hover:text-red-400 hover:border-red-400/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("הכל");
  const [tab, setTab] = useState<"questions" | "media" | "newsletter">("questions");

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

        <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1 mb-2">
          {([["questions", "שאלות לרב", MessageSquare], ["media", "תוכן ממשתמשים", Inbox], ["newsletter", "רשימת תפוצה", Mail]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k as any)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"}`}>
              <Icon className="h-4 w-4" />{l}
            </button>
          ))}
        </div>

        {tab === "media" && <MediaSubmissions token={sessionStorage.getItem(TOKEN_KEY) ?? ""} />}
        {tab === "newsletter" && <MailingList />}

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
