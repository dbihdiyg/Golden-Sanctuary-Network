import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { CheckCircle, Clock, MessageSquare, Users, BarChart3, Loader2 } from "lucide-react";
import Footer from "@/components/sections/Footer";

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

export default function AdminPage() {
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("הכל");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/questions").then(r => { if (!r.ok) throw new Error("אין גישה"); return r.json(); }),
      fetch("/api/admin/stats").then(r => r.json()),
    ]).then(([q, s]) => {
      setQuestions(q);
      setStats(s);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const filtered = filter === "הכל" ? questions : questions.filter(q => q.status === filter);

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (error) return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-xl font-bold text-white">אין גישה לפאנל הניהול</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(245,192,55,0.1),transparent_35%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-16 space-y-8">

        <div>
          <p className="text-sm font-bold tracking-widest text-blue-brand">פאנל ניהול</p>
          <h1 className="text-4xl font-black text-white mt-2">שלום, {user?.firstName} 👋</h1>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "שאלות לרבנים", value: stats.questions, icon: MessageSquare, color: "text-yellow-400" },
              { label: "פוסטים בקהילה", value: stats.posts, icon: Users, color: "text-blue-400" },
              { label: "שאלות חדשות", value: questions.filter(q => q.status === "new").length, icon: BarChart3, color: "text-green-400" },
            ].map(s => (
              <div key={s.label} className="rounded-[1.5rem] border border-white/10 bg-card p-5">
                <s.icon className={`h-7 w-7 ${s.color}`} />
                <p className="text-3xl font-black text-white mt-3">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-black text-white mb-4">שאלות לרבני הקהילה</h2>

          <div className="flex gap-2 mb-5 flex-wrap">
            {["הכל", "new", "in_progress", "answered"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/5 text-muted-foreground hover:text-white"}`}>
                {f === "הכל" ? "הכל" : STATUS_LABELS[f]}
                {f !== "הכל" && (
                  <span className="mr-1.5 opacity-70">({questions.filter(q => q.status === f).length})</span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-12">אין שאלות בקטגוריה זו.</p>
            )}
            {filtered.map(q => (
              <div key={q.id} className="rounded-[1.5rem] border border-white/10 bg-card p-6">
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
                  <div className="flex flex-col gap-2 min-w-[130px]">
                    <span className={`self-start rounded-full border px-3 py-1 text-xs font-bold ${STATUS_COLORS[q.status] ?? STATUS_COLORS.new}`}>
                      {STATUS_LABELS[q.status] ?? q.status}
                    </span>
                    <div className="flex gap-2">
                      {q.status !== "in_progress" && (
                        <button onClick={() => updateStatus(q.id, "in_progress")}
                          className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition">
                          <Clock className="h-3 w-3" />
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
