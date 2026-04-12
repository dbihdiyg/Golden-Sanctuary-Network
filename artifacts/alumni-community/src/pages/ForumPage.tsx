import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useUser, Show } from "@clerk/react";
import {
  MessageSquare, Heart, Eye, Pin, ImageIcon, X,
  Plus, ChevronLeft, Loader2, Send, BookOpen, Briefcase,
  Star, HelpCircle, MessageCircle, LayoutGrid, Clock, TrendingUp,
  Flame
} from "lucide-react";
import Footer from "@/components/sections/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = (p: string) => `${BASE}/api${p}`;

const CATEGORY_ICONS: Record<string, any> = {
  "לימוד תורה": BookOpen,
  "אירועי בוגרים": Star,
  "עסקים ופרנסה": Briefcase,
  "ברכות ושמחות": Flame,
  "שאלות ועיון": HelpCircle,
  "כללי": MessageCircle,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
  green: "from-green-500/20 to-green-600/5 border-green-500/20",
  purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
  yellow: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20",
  orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
  gray: "from-white/10 to-white/5 border-white/15",
  gold: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20",
};

function timeAgo(date: string) {
  const d = new Date(date);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "עכשיו";
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דקות`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעות`;
  if (diff < 604800) return `לפני ${Math.floor(diff / 86400)} ימים`;
  return d.toLocaleDateString("he-IL");
}

function Avatar({ name, image, size = "sm" }: { name: string; image?: string | null; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-8 w-8 text-xs" : size === "md" ? "h-10 w-10 text-sm" : "h-12 w-12 text-base";
  const initials = name?.split(" ").map(n => n[0]).slice(0, 2).join("") || "?";
  if (image) return <img src={image} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0`}>
      {initials}
    </div>
  );
}

function ImageUpload({ onImage, label = "הוסף תמונה" }: { onImage: (b64: string | null) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = () => ref.current?.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      // compress via canvas
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
        setLoading(false);
      };
      img.src = b64;
    };
    reader.readAsDataURL(file);
  };

  const remove = () => {
    setPreview(null);
    onImage(null);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onChange} />
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="preview" className="h-32 w-auto rounded-xl object-cover border border-white/10" />
          <button onClick={remove} className="absolute -top-2 -right-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={pick} disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          {loading ? "טוען..." : label}
        </button>
      )}
    </div>
  );
}

interface Category { id: number; name: string; description: string; emoji: string; color: string; thread_count: number; }
interface Thread {
  id: number; category_id: number | null; title: string; content: string; image_url: string | null;
  author_clerk_id: string; author_name: string; author_image: string | null;
  is_pinned: boolean; reply_count: number; like_count: number; view_count: number;
  last_activity_at: string; created_at: string;
  category_name: string | null; category_emoji: string | null; category_color: string | null;
}

function CreateThreadModal({ categories, onClose, onCreated }: {
  categories: Category[];
  onClose: () => void;
  onCreated: (t: Thread) => void;
}) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">(categories[0]?.id ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!title.trim() || !content.trim()) { setError("נא למלא כותרת ותוכן"); return; }
    setLoading(true); setError("");
    const res = await fetch(API("/forum/threads"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: categoryId || null,
        title: title.trim(),
        content: content.trim(),
        imageUrl,
        authorClerkId: user!.id,
        authorName: `${user!.firstName || ""} ${user!.lastName || ""}`.trim() || "בוגר",
        authorImage: user!.imageUrl || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "שגיאה"); return; }
    onCreated(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full sm:max-w-2xl bg-card border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] p-6 sm:p-8 space-y-5 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">פוסט חדש</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 text-muted-foreground hover:text-white transition"><X className="h-5 w-5" /></button>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1.5 block">קטגוריה</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategoryId(c.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-bold border transition ${categoryId === c.id ? "border-primary bg-primary text-primary-foreground" : "border-white/15 bg-white/5 text-muted-foreground hover:text-white"}`}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1.5 block">כותרת</label>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
            placeholder="כותרת הפוסט..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-primary/50 placeholder:text-muted-foreground/50" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground mb-1.5 block">תוכן</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={5}
            placeholder="שתף מחשבות, שאלות, רעיונות..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-primary/50 resize-none placeholder:text-muted-foreground/50" />
        </div>

        <ImageUpload onImage={setImageUrl} label="הוסף תמונה לפוסט" />

        {error && <p className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button onClick={submit} disabled={loading || !title.trim() || !content.trim()}
            className="flex-1 rounded-xl bg-primary py-3 font-black text-primary-foreground hover:shadow-[0_0_30px_rgba(245,192,55,0.3)] disabled:opacity-50 transition flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" />פרסם</>}
          </button>
          <button onClick={onClose} className="rounded-xl border border-white/10 px-6 py-3 text-muted-foreground hover:text-white transition">ביטול</button>
        </div>
      </div>
    </div>
  );
}

function ThreadCard({ thread, onClick }: { thread: Thread; onClick: () => void }) {
  return (
    <div onClick={onClick}
      className="group cursor-pointer rounded-[1.5rem] border border-white/10 bg-card p-5 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 space-y-3">
      {thread.is_pinned && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
          <Pin className="h-3 w-3" />
          מוצמד
        </div>
      )}
      <div className="flex items-start gap-3">
        <Avatar name={thread.author_name} image={thread.author_image} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-white text-sm">{thread.author_name}</span>
            {thread.category_name && (
              <span className="rounded-full bg-white/8 border border-white/10 px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                {thread.category_emoji} {thread.category_name}
              </span>
            )}
            <span className="text-xs text-muted-foreground/60 mr-auto">{timeAgo(thread.created_at)}</span>
          </div>
          <h3 className="font-black text-white leading-snug line-clamp-2 group-hover:text-primary transition">{thread.title}</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 pr-11">{thread.content}</p>

      {thread.image_url && (
        <div className="pr-11">
          <img src={thread.image_url} alt="" className="h-40 w-full object-cover rounded-xl border border-white/10" />
        </div>
      )}

      <div className="flex items-center gap-4 pt-1 pr-11 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{thread.like_count}</span>
        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{thread.reply_count} תגובות</span>
        <span className="flex items-center gap-1 mr-auto"><Eye className="h-3.5 w-3.5" />{thread.view_count}</span>
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(thread.last_activity_at)}</span>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  useEffect(() => {
    fetch(API("/forum/categories")).then(r => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCat) params.set("categoryId", String(activeCat));
    fetch(API(`/forum/threads?${params}`))
      .then(r => r.json())
      .then(d => { setThreads(d.threads ?? []); setTotal(d.total ?? 0); setLoading(false); });
  }, [activeCat]);

  const sorted = sortBy === "popular"
    ? [...threads].sort((a, b) => (b.like_count + b.reply_count) - (a.like_count + a.reply_count))
    : threads;

  const openThread = (id: number) => setLocation(`/forum/${id}`);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden pt-28 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_0%,rgba(245,192,55,0.07),transparent_40%)]" />

      <div className="relative mx-auto max-w-6xl px-4 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs font-black tracking-[0.3em] text-primary">COMMUNITY</p>
          <h1 className="text-4xl md:text-5xl font-black text-white">קהילת הבוגרים</h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">שתפו, שאלו, עצרו רגע — זה המקום שלכם.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button onClick={() => setActiveCat(null)}
            className={`rounded-[1.5rem] border p-4 text-center transition-all ${activeCat === null ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,192,55,0.15)]" : "border-white/10 bg-card hover:border-white/20"}`}>
            <LayoutGrid className={`h-6 w-6 mx-auto mb-2 ${activeCat === null ? "text-primary" : "text-muted-foreground"}`} />
            <p className={`text-xs font-bold ${activeCat === null ? "text-primary" : "text-muted-foreground"}`}>הכל</p>
            <p className="text-[10px] text-muted-foreground/60">{total} פוסטים</p>
          </button>
          {categories.map(cat => {
            const Icon = CATEGORY_ICONS[cat.name] ?? MessageCircle;
            const isActive = activeCat === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                className={`rounded-[1.5rem] border p-4 text-center transition-all ${isActive ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,192,55,0.15)]" : `border-white/10 bg-gradient-to-b ${CATEGORY_GRADIENTS[cat.color] ?? CATEGORY_GRADIENTS.gray} hover:border-white/20`}`}>
                <span className="text-2xl block mb-1">{cat.emoji}</span>
                <p className={`text-xs font-bold leading-tight ${isActive ? "text-primary" : "text-white"}`}>{cat.name}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{cat.thread_count} פוסטים</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setSortBy("latest")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold border transition ${sortBy === "latest" ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:text-white"}`}>
              <Clock className="h-3.5 w-3.5" />
              עדכני
            </button>
            <button onClick={() => setSortBy("popular")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold border transition ${sortBy === "popular" ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-muted-foreground hover:text-white"}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              פופולרי
            </button>
          </div>
          <Show when="signed-in">
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground hover:shadow-[0_0_24px_rgba(245,192,55,0.35)] transition">
              <Plus className="h-4 w-4" />
              פוסט חדש
            </button>
          </Show>
          <Show when="signed-out">
            <button onClick={() => setLocation("/sign-in")}
              className="flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 transition">
              <Plus className="h-4 w-4" />
              כתוב פוסט
            </button>
          </Show>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : sorted.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 p-16 text-center space-y-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">עדיין אין פוסטים כאן — היה הראשון לכתוב!</p>
            <Show when="signed-in">
              <button onClick={() => setShowCreate(true)}
                className="rounded-full bg-primary px-6 py-2.5 font-black text-primary-foreground hover:shadow-[0_0_24px_rgba(245,192,55,0.35)] transition text-sm">
                כתוב פוסט ראשון
              </button>
            </Show>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(t => <ThreadCard key={t.id} thread={t} onClick={() => openThread(t.id)} />)}
          </div>
        )}
      </div>

      <Show when="signed-in">
        <button onClick={() => setShowCreate(true)}
          className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-[0_0_30px_rgba(245,192,55,0.4)] hover:shadow-[0_0_40px_rgba(245,192,55,0.55)] transition lg:hidden">
          <Plus className="h-6 w-6 text-primary-foreground" />
        </button>
      </Show>

      {showCreate && (
        <CreateThreadModal
          categories={categories}
          onClose={() => setShowCreate(false)}
          onCreated={(t) => { setThreads(prev => [t, ...prev]); setTotal(prev => prev + 1); }}
        />
      )}

      <Footer />
    </main>
  );
}
