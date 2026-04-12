import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/react";
import {
  Send, Heart, Trash2, BookOpen, LogOut, Sparkles, Star,
  MessageSquare, Award, Users, TrendingUp, ChevronRight,
  Edit3, CheckCircle, Clock
} from "lucide-react";
import Footer from "@/components/sections/Footer";

interface Post {
  id: number;
  clerk_user_id: string;
  user_name: string;
  user_image: string | null;
  cohort: string | null;
  content: string;
  created_at: string;
  reactions: { id: number; clerk_user_id: string; emoji: string }[];
}

interface Question {
  id: number;
  topic: string | null;
  question: string;
  status: string;
  created_at: string;
}

interface ProfileStats {
  posts_count: number;
  reactions_received: number;
  questions_count: number;
  my_posts: Post[];
}

interface LeaderEntry {
  clerk_user_id: string;
  user_name: string;
  user_image: string | null;
  cohort: string | null;
  posts_count: number;
  reactions_received: number;
}

interface CommunityStats {
  members: number;
  posts: number;
  reactions: number;
}

type Tab = "board" | "profile" | "questions";

function Avatar({ name, image, size = 10 }: { name: string; image?: string | null; size?: number }) {
  const initials = (name || "א").slice(0, 2);
  const px = `h-${size} w-${size}`;
  if (image) {
    return <img src={image} alt={name} className={`${px} rounded-full object-cover ring-2 ring-primary/30`} />;
  }
  return (
    <div className={`${px} flex items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 text-primary font-black text-sm ring-2 ring-primary/20`}>
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <Icon className={`mx-auto h-6 w-6 mb-2 ${color}`} />
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(d => setLeaders(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/community-stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-white text-sm">תורמי הקהילה</h3>
        </div>
        {stats && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { v: stats.members, l: "בוגרים" },
              { v: stats.posts, l: "פוסטים" },
              { v: stats.reactions, l: "תגובות" },
            ].map(s => (
              <div key={s.l} className="rounded-xl bg-white/[0.04] py-2 px-1">
                <p className="text-lg font-black text-primary">{s.v}</p>
                <p className="text-[10px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="divide-y divide-white/[0.06]">
        {leaders.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">עדיין אין פוסטים בקהילה.</p>
        )}
        {leaders.map((l, i) => (
          <div key={l.clerk_user_id} className="flex items-center gap-3 px-5 py-3">
            <span className="text-lg min-w-[1.5rem] text-center">{medals[i] || `${i + 1}`}</span>
            <Avatar name={l.user_name} image={l.user_image} size={8} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">{l.user_name}</p>
              {l.cohort && <p className="text-xs text-muted-foreground">מחזור {l.cohort}</p>}
            </div>
            <div className="text-left text-xs text-muted-foreground">
              <span className="text-primary font-bold">{l.posts_count}</span>
              <span className="mr-1">פוסטים</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityBoard({ userId, userName, userImage, cohort }: { userId: string; userName: string; userImage: string; cohort: string | null }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/posts").then(r => r.json()).then(d => setPosts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, user_name: userName, user_image: userImage, cohort }),
    });
    if (res.ok) {
      const post = await res.json();
      setPosts(p => [{ ...post, reactions: [] }, ...p]);
      setContent("");
    }
    setSending(false);
  };

  const react = async (postId: number) => {
    await fetch(`/api/posts/${postId}/react`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emoji: "❤️" }) });
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const already = p.reactions.some(r => r.clerk_user_id === userId);
      return {
        ...p,
        reactions: already
          ? p.reactions.filter(r => r.clerk_user_id !== userId)
          : [...p.reactions, { id: Date.now(), clerk_user_id: userId, emoji: "❤️" }],
      };
    }));
  };

  const deletePost = async (postId: number) => {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <form onSubmit={submit} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="flex gap-3 items-start">
            <Avatar name={userName} image={userImage} size={10} />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="שתף מחשבה, זיכרון, ברכה עם הקהילה..."
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-right text-white outline-none focus:border-primary/50 placeholder:text-muted-foreground/50 text-sm"
              />
              <div className="mt-2 flex justify-end">
                <button type="submit" disabled={sending || !content.trim()}
                  className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:shadow-[0_0_24px_rgba(245,192,55,0.3)] disabled:opacity-50">
                  <Send className="h-3.5 w-3.5" />
                  {sending ? "שולח..." : "פרסם"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-10">היה הראשון לשתף משהו עם הקהילה!</p>
        )}
        {posts.map(post => {
          const liked = post.reactions.some(r => r.clerk_user_id === userId);
          const isOwn = post.clerk_user_id === userId;
          const likeCount = post.reactions.length;
          return (
            <article key={post.id} className="rounded-[1.5rem] border border-white/10 bg-card p-5 transition hover:border-white/20">
              <div className="flex items-start gap-3">
                <Avatar name={post.user_name} image={post.user_image} size={10} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">{post.user_name}</span>
                      {post.cohort && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">מחזור {post.cohort}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground/60 shrink-0">
                      {new Date(post.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm">{post.content}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => react(post.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition ${liked ? "bg-red-500/20 text-red-400" : "bg-white/5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"}`}>
                      <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-400" : ""}`} />
                      {likeCount > 0 && <span className="font-bold">{likeCount}</span>}
                    </button>
                    {isOwn && (
                      <button onClick={() => deletePost(post.id)}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground/40 hover:text-red-400 transition">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden lg:block">
        <Leaderboard />
      </div>
    </div>
  );
}

function MyProfile({ userId, onPostDelete }: { userId: string; onPostDelete?: () => void }) {
  const { user } = useUser();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCohort, setEditingCohort] = useState(false);
  const [cohortInput, setCohortInput] = useState("");
  const [savingCohort, setSavingCohort] = useState(false);

  const loadProfile = () => {
    setLoading(true);
    fetch("/api/my-profile")
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
    const meta = user?.unsafeMetadata?.cohort as string | undefined;
    setCohortInput(meta || "");
  }, [user]);

  const saveCohort = async () => {
    setSavingCohort(true);
    await user?.update({ unsafeMetadata: { ...user.unsafeMetadata, cohort: cohortInput } });
    setSavingCohort(false);
    setEditingCohort(false);
  };

  const deleteMine = async (postId: number) => {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setStats(s => s ? { ...s, my_posts: s.my_posts.filter(p => p.id !== postId), posts_count: s.posts_count - 1 } : s);
    onPostDelete?.();
  };

  if (!user) return null;

  const cohort = user.unsafeMetadata?.cohort as string | undefined;
  const name = user.fullName || user.firstName || "בוגר";

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-card to-card/60 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(245,192,55,0.08),transparent_50%)]" />
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-right">
          <div className="relative shrink-0">
            {user.imageUrl
              ? <img src={user.imageUrl} alt={name} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/30 shadow-[0_0_40px_rgba(245,192,55,0.2)]" />
              : <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/40 flex items-center justify-center text-3xl font-black text-primary ring-4 ring-primary/30">{name.slice(0, 2)}</div>
            }
            <span className="absolute bottom-1 left-1 h-4 w-4 rounded-full bg-green-400 border-2 border-card" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black text-white">{name}</h2>
            <p className="text-muted-foreground text-sm mt-1">{user.primaryEmailAddress?.emailAddress}</p>
            <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              {editingCohort ? (
                <div className="flex items-center gap-2">
                  <input
                    value={cohortInput}
                    onChange={e => setCohortInput(e.target.value)}
                    placeholder="מחזור (לדוגמה: תשפ״ה)"
                    className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm text-white outline-none w-40 text-right"
                    autoFocus
                  />
                  <button onClick={saveCohort} disabled={savingCohort}
                    className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground disabled:opacity-50">
                    {savingCohort ? "..." : "שמור"}
                  </button>
                  <button onClick={() => setEditingCohort(false)} className="text-muted-foreground text-xs hover:text-white">ביטול</button>
                </div>
              ) : (
                <button onClick={() => setEditingCohort(true)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm text-muted-foreground hover:text-white hover:border-primary/40 transition">
                  <Edit3 className="h-3 w-3" />
                  {cohort ? `מחזור ${cohort}` : "הוסף מחזור"}
                </button>
              )}
            </div>
          </div>
        </div>

        {!loading && stats && (
          <div className="relative mt-6 grid grid-cols-3 gap-4">
            <StatCard icon={MessageSquare} label="פוסטים" value={stats.posts_count} color="text-blue-400" />
            <StatCard icon={Heart} label="לייקים שקיבלתי" value={stats.reactions_received} color="text-red-400" />
            <StatCard icon={BookOpen} label="שאלות לרב" value={stats.questions_count} color="text-primary" />
          </div>
        )}
      </div>

      {!loading && stats && stats.my_posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg">הפוסטים שלי</h3>
          {stats.my_posts.map(post => (
            <article key={post.id} className="rounded-[1.5rem] border border-white/10 bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm flex-1">{post.content}</p>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground/60">
                    {new Date(post.created_at).toLocaleDateString("he-IL")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <Heart className="h-3 w-3 fill-red-400" />
                      {post.reactions.length}
                    </span>
                    <button onClick={() => deleteMine(post.id)} className="text-muted-foreground/40 hover:text-red-400 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && stats && stats.my_posts.length === 0 && (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-10 text-center">
          <Sparkles className="h-8 w-8 text-primary/40 mx-auto mb-3" />
          <p className="text-muted-foreground">עדיין לא שיתפת שום דבר עם הקהילה.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">עבור ללוח הקהילה וכתוב את הפוסט הראשון שלך!</p>
        </div>
      )}
    </div>
  );
}

function MyQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my-questions")
      .then(r => r.json())
      .then(d => setQuestions(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusLabel: Record<string, string> = { new: "חדש", in_progress: "בטיפול", answered: "נענה" };
  const statusColor: Record<string, string> = {
    new: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    in_progress: "bg-blue-400/10 text-blue-400 border-blue-400/30",
    answered: "bg-green-400/10 text-green-400 border-green-400/30",
  };
  const StatusIcon: Record<string, any> = { new: Clock, in_progress: TrendingUp, answered: CheckCircle };

  if (loading) return <p className="text-center text-muted-foreground py-10">טוען...</p>;

  if (questions.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-10 text-center">
        <BookOpen className="h-8 w-8 text-primary/40 mx-auto mb-3" />
        <p className="text-muted-foreground">עדיין לא שלחת שאלות לרבנים.</p>
        <a href="/ask-rabbi" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:shadow-[0_0_24px_rgba(245,192,55,0.3)] transition">
          שאל שאלה
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map(q => {
        const SIcon = StatusIcon[q.status] ?? Clock;
        return (
          <div key={q.id} className="rounded-[1.5rem] border border-white/10 bg-card p-5 hover:border-white/20 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-2">
                {q.topic && <p className="text-xs font-black text-primary tracking-wider">{q.topic}</p>}
                <p className="text-white leading-relaxed text-sm">{q.question}</p>
                <p className="text-xs text-muted-foreground/60">{new Date(q.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shrink-0 ${statusColor[q.status] ?? statusColor.new}`}>
                <SIcon className="h-3 w-3" />
                {statusLabel[q.status] ?? q.status}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function UserPortal() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [tab, setTab] = useState<Tab>("board");

  if (!user) return null;

  const name = user.fullName || user.firstName || "בוגר";
  const cohort = user.unsafeMetadata?.cohort as string | null || null;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "board", label: "לוח הקהילה", icon: Sparkles },
    { key: "profile", label: "הפרופיל שלי", icon: Star },
    { key: "questions", label: "השאלות שלי", icon: BookOpen },
  ];

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(245,192,55,0.1),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(0,19,164,0.15),transparent_40%)]" />

      <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-14 space-y-6">

        <div className="rounded-[2rem] border border-white/10 bg-card/60 backdrop-blur p-5 flex items-center gap-4">
          <div className="relative shrink-0">
            {user.imageUrl
              ? <img src={user.imageUrl} alt={name} className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/30" />
              : <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/40 flex items-center justify-center text-xl font-black text-primary">{name.slice(0, 2)}</div>
            }
            <span className="absolute bottom-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">{name}</h1>
            {cohort && <p className="text-sm text-primary">מחזור {cohort}</p>}
          </div>
          <button onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition">
            <LogOut className="h-4 w-4" />
            יציאה
          </button>
        </div>

        <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${tab === t.key ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(245,192,55,0.25)]" : "text-muted-foreground hover:text-white"}`}>
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div>
          {tab === "board" && (
            <CommunityBoard
              userId={user.id}
              userName={name}
              userImage={user.imageUrl || ""}
              cohort={cohort}
            />
          )}
          {tab === "profile" && <MyProfile userId={user.id} onPostDelete={() => {}} />}
          {tab === "questions" && <MyQuestions />}
        </div>
      </div>

      <Footer />
    </main>
  );
}
