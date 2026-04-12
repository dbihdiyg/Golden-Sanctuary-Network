import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, Clock, MessageSquare, BarChart3, Loader2,
  Lock, Eye, EyeOff, TrendingUp, LogOut, Users
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

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("הכל");
  const [tab, setTab] = useState<"questions" | "contacts">("questions");

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

        <div>
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
        </div>
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
