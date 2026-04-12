import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { Send, Heart, Trash2, BookOpen, LogOut, User, Sparkles } from "lucide-react";
import { useClerk } from "@clerk/react";
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

function Avatar({ name, image, size = 10 }: { name: string; image?: string | null; size?: number }) {
  if (image) return <img src={image} alt={name} className={`h-${size} w-${size} rounded-full object-cover`} />;
  const initials = name.slice(0, 2);
  return (
    <div className={`h-${size} w-${size} flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm`}>
      {initials}
    </div>
  );
}

function CommunityBoard({ userId }: { userId: string }) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/posts").then(r => r.json()).then(setPosts).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        user_name: user?.fullName || user?.firstName || "בוגר",
        user_image: user?.imageUrl,
        cohort: user?.unsafeMetadata?.cohort as string || null,
      }),
    });
    if (res.ok) {
      const post = await res.json();
      setPosts(p => [post, ...p]);
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
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="שתף רגע, מחשבה, זיכרון מהקהילה..."
          rows={3}
          className="w-full resize-none rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-right text-white outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
        />
        <div className="mt-3 flex justify-end">
          <button type="submit" disabled={sending || !content.trim()}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:shadow-[0_0_30px_rgba(245,192,55,0.3)] disabled:opacity-50">
            <Send className="h-4 w-4" />
            {sending ? "שולח..." : "פרסם"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">היה הראשון לשתף משהו עם הקהילה!</p>
        )}
        {posts.map(post => {
          const liked = post.reactions.some(r => r.clerk_user_id === userId);
          const isOwn = post.clerk_user_id === userId;
          return (
            <div key={post.id} className="rounded-[1.5rem] border border-white/10 bg-card p-5">
              <div className="flex items-start gap-3">
                <Avatar name={post.user_name} image={post.user_image} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{post.user_name}</span>
                      {post.cohort && <span className="mr-2 text-xs text-muted-foreground">מחזור {post.cohort}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("he-IL")}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-muted-foreground leading-relaxed">{post.content}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => react(post.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition ${liked ? "bg-red-500/20 text-red-400" : "bg-white/5 text-muted-foreground hover:text-red-400"}`}>
                      <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-400" : ""}`} />
                      {post.reactions.length > 0 && post.reactions.length}
                    </button>
                    {isOwn && (
                      <button onClick={() => deletePost(post.id)}
                        className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground/50 hover:text-red-400 transition">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my-questions").then(r => r.json()).then(setQuestions).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusLabel: Record<string, string> = { new: "חדש", in_progress: "בטיפול", answered: "נענה" };
  const statusColor: Record<string, string> = { new: "text-yellow-400 bg-yellow-400/10", in_progress: "text-blue-400 bg-blue-400/10", answered: "text-green-400 bg-green-400/10" };

  if (loading) return <p className="text-center text-muted-foreground py-8">טוען...</p>;
  if (questions.length === 0) return <p className="text-center text-muted-foreground py-8">עדיין לא שלחת שאלות לרבנים.</p>;

  return (
    <div className="space-y-4">
      {questions.map(q => (
        <div key={q.id} className="rounded-[1.5rem] border border-white/10 bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {q.topic && <p className="text-xs font-bold text-primary mb-1">{q.topic}</p>}
              <p className="text-white leading-relaxed">{q.question}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(q.created_at).toLocaleDateString("he-IL")}</p>
            </div>
            <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusColor[q.status] ?? statusColor.new}`}>
              {statusLabel[q.status] ?? q.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UserPortal() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [tab, setTab] = useState<"board" | "questions">("board");

  if (!user) return null;

  const tabs = [
    { key: "board", label: "לוח הקהילה", icon: Sparkles },
    { key: "questions", label: "השאלות שלי", icon: BookOpen },
  ] as const;

  return (
    <main className="relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(245,192,55,0.12),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(0,19,164,0.18),transparent_40%)]" />

      <div className="relative mx-auto max-w-4xl px-4 py-8 md:py-16 space-y-8">

        <div className="rounded-[2rem] border border-white/10 bg-card p-6 flex items-center gap-5">
          <div className="relative">
            <Avatar name={user.fullName || user.firstName || "בוגר"} image={user.imageUrl} size={16} />
            <span className="absolute bottom-0 left-0 h-4 w-4 rounded-full border-2 border-card bg-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-white">{user.fullName || user.firstName || "בוגר"}</h1>
            <p className="text-muted-foreground text-sm">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/profile" className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:text-white transition">
              <User className="h-4 w-4" />
              פרופיל
            </a>
            <button onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:text-red-400 transition">
              <LogOut className="h-4 w-4" />
              יציאה
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-white/10 pb-0">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white"}`}>
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {tab === "board" && <CommunityBoard userId={user.id} />}
          {tab === "questions" && <MyQuestions />}
        </div>
      </div>

      <Footer />
    </main>
  );
}
