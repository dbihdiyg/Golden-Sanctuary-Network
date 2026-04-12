import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useUser, Show } from "@clerk/react";
import {
  Heart, MessageSquare, Eye, ChevronRight, Loader2,
  Send, ImageIcon, X, Flag, Share2
} from "lucide-react";
import Footer from "@/components/sections/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = (p: string) => `${BASE}/api${p}`;

function timeAgo(date: string) {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "עכשיו";
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דקות`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעות`;
  if (diff < 604800) return `לפני ${Math.floor(diff / 86400)} ימים`;
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function Avatar({ name, image, size = "md" }: { name: string; image?: string | null; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-8 w-8 text-xs" : size === "md" ? "h-10 w-10 text-sm" : "h-14 w-14 text-lg";
  const initials = name?.split(" ").map(n => n[0]).slice(0, 2).join("") || "?";
  if (image) return <img src={image} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary shrink-0`}>
      {initials}
    </div>
  );
}

function ImageUploadInline({ onImage }: { onImage: (b64: string | null) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const ref = { current: null as HTMLInputElement | null };

  const compress = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 900;
        let { width, height } = img;
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setPreview(compressed);
        onImage(compressed);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-3">
      <button type="button"
        onClick={() => { const i = document.createElement("input"); i.type="file"; i.accept="image/*"; i.onchange=(e: any)=>{ if(e.target.files[0]) compress(e.target.files[0]); }; i.click(); }}
        className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition">
        <ImageIcon className="h-3.5 w-3.5" />
        תמונה
      </button>
      {preview && (
        <div className="relative">
          <img src={preview} alt="" className="h-12 w-auto rounded-lg object-cover border border-white/10" />
          <button onClick={() => { setPreview(null); onImage(null); }}
            className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5">
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

interface Thread {
  id: number; category_id: number | null; title: string; content: string; image_url: string | null;
  author_clerk_id: string; author_name: string; author_image: string | null;
  is_pinned: boolean; reply_count: number; like_count: number; view_count: number;
  last_activity_at: string; created_at: string;
  category_name: string | null; category_emoji: string | null; category_color: string | null;
}
interface Reply {
  id: number; thread_id: number; content: string; image_url: string | null;
  author_clerk_id: string; author_name: string; author_image: string | null;
  like_count: number; created_at: string;
}

export default function ThreadPage() {
  const [, params] = useRoute("/forum/:id");
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const threadId = params?.id;

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [threadLiked, setThreadLiked] = useState(false);
  const [likedReplies, setLikedReplies] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!threadId) return;
    const headers: Record<string, string> = {};
    if (user?.id) headers["x-user-id"] = user.id;
    fetch(API(`/forum/threads/${threadId}`), { headers })
      .then(r => r.json())
      .then(d => {
        setThread(d.thread);
        setReplies(d.replies ?? []);
        setThreadLiked(d.threadLiked ?? false);
        setLikedReplies(new Set(d.likedReplies ?? []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [threadId, user?.id]);

  const likeThread = async () => {
    if (!user) { setLocation("/sign-in"); return; }
    const res = await fetch(API(`/forum/threads/${threadId}/like`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const d = await res.json();
    setThreadLiked(d.liked);
    setThread(prev => prev ? { ...prev, like_count: prev.like_count + (d.liked ? 1 : -1) } : prev);
  };

  const likeReply = async (replyId: number) => {
    if (!user) { setLocation("/sign-in"); return; }
    const res = await fetch(API(`/forum/replies/${replyId}/like`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const d = await res.json();
    setLikedReplies(prev => {
      const next = new Set(prev);
      d.liked ? next.add(replyId) : next.delete(replyId);
      return next;
    });
    setReplies(prev => prev.map(r => r.id === replyId ? { ...r, like_count: r.like_count + (d.liked ? 1 : -1) } : r));
  };

  const submitReply = async () => {
    if (!user || !replyContent.trim()) return;
    setSubmitting(true);
    const res = await fetch(API(`/forum/threads/${threadId}/replies`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: replyContent.trim(),
        imageUrl: replyImage,
        authorClerkId: user.id,
        authorName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "בוגר",
        authorImage: user.imageUrl || null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setReplies(prev => [...prev, data]);
      setReplyContent("");
      setReplyImage(null);
      setThread(prev => prev ? { ...prev, reply_count: prev.reply_count + 1 } : prev);
    }
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: thread?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!thread) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">הפוסט לא נמצא</p>
      <button onClick={() => setLocation("/forum")} className="rounded-full bg-primary px-6 py-2.5 font-black text-primary-foreground text-sm">
        חזרה לפורום
      </button>
    </div>
  );

  return (
    <main className="relative min-h-[100dvh] overflow-hidden pt-24 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_0%,rgba(245,192,55,0.06),transparent_40%)]" />

      <div className="relative mx-auto max-w-3xl px-4 space-y-6">
        <button onClick={() => setLocation("/forum")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition">
          <ChevronRight className="h-4 w-4" />
          חזרה לפורום
        </button>

        <article className="rounded-[2rem] border border-white/10 bg-card p-6 md:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <Avatar name={thread.author_name} image={thread.author_image} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-black text-white">{thread.author_name}</span>
                {thread.category_name && (
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {thread.category_emoji} {thread.category_name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo(thread.created_at)}</p>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{thread.title}</h1>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base">{thread.content}</p>

          {thread.image_url && (
            <img src={thread.image_url} alt=""
              className="w-full rounded-xl object-contain max-h-96 border border-white/10 bg-white/5" />
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-white/8">
            <button onClick={likeThread}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${threadLiked ? "border-red-400/50 bg-red-400/10 text-red-400" : "border-white/15 bg-white/5 text-muted-foreground hover:border-red-400/30 hover:text-red-400"}`}>
              <Heart className={`h-4 w-4 ${threadLiked ? "fill-current" : ""}`} />
              {thread.like_count}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {thread.reply_count} תגובות
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground mr-auto">
              <Eye className="h-4 w-4" />
              {thread.view_count}
            </span>
            <button onClick={share} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition rounded-full border border-white/10 px-3 py-1.5">
              <Share2 className="h-3.5 w-3.5" />
              שתף
            </button>
          </div>
        </article>

        {replies.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-black text-muted-foreground tracking-wider">{replies.length} תגובות</h2>
            {replies.map((reply, i) => (
              <div key={reply.id} className="rounded-[1.5rem] border border-white/10 bg-card p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar name={reply.author_name} image={reply.author_image} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white text-sm">{reply.author_name}</span>
                      <span className="text-xs text-muted-foreground">#{i + 1}</span>
                      <span className="text-xs text-muted-foreground mr-auto">{timeAgo(reply.created_at)}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>

                {reply.image_url && (
                  <div className="pr-11">
                    <img src={reply.image_url} alt="" className="max-h-60 w-auto rounded-xl border border-white/10 object-contain" />
                  </div>
                )}

                <div className="pr-11">
                  <button onClick={() => likeReply(reply.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition ${likedReplies.has(reply.id) ? "border-red-400/50 bg-red-400/10 text-red-400" : "border-white/10 text-muted-foreground hover:border-red-400/30 hover:text-red-400"}`}>
                    <Heart className={`h-3 w-3 ${likedReplies.has(reply.id) ? "fill-current" : ""}`} />
                    {reply.like_count}
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-[2rem] border border-white/10 bg-card p-5 md:p-6 space-y-4">
          <Show when="signed-in">
            <div className="flex items-start gap-3">
              <Avatar name={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "אני"} image={user?.imageUrl} size="sm" />
              <div className="flex-1 space-y-3">
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  rows={3}
                  placeholder="כתוב תגובה..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 resize-none placeholder:text-muted-foreground/50"
                />
                <div className="flex items-center justify-between">
                  <ImageUploadInline onImage={setReplyImage} />
                  <button onClick={submitReply} disabled={submitting || !replyContent.trim()}
                    className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-black text-primary-foreground hover:shadow-[0_0_20px_rgba(245,192,55,0.3)] disabled:opacity-50 transition">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" />שלח</>}
                  </button>
                </div>
              </div>
            </div>
          </Show>
          <Show when="signed-out">
            <div className="text-center py-4 space-y-3">
              <p className="text-muted-foreground text-sm">כדי להגיב צריך להתחבר</p>
              <button onClick={() => setLocation("/sign-in")}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-black text-primary-foreground hover:shadow-[0_0_20px_rgba(245,192,55,0.3)] transition">
                כניסה לאזור האישי
              </button>
            </div>
          </Show>
        </section>
      </div>

      <Footer />
    </main>
  );
}
