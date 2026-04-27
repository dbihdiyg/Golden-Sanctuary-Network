import { useState, useEffect, useCallback } from "react";
import {
  Megaphone, Image as ImageIcon, Youtube, FileText, Calendar,
  Plus, Trash2, Check, ToggleLeft, ToggleRight,
  Loader2, UploadCloud, Link2, Star,
  AlertTriangle, CheckCircle, Info
} from "lucide-react";

const TOKEN_KEY = "alumni_admin_token";
const adminFetch = (url: string, opts: RequestInit = {}) => {
  const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
  return fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers ?? {}),
    },
  });
};

type SubTab = "announcements" | "gallery" | "videos" | "pdfs" | "events";

const SUBTABS: { key: SubTab; label: string; icon: typeof Megaphone }[] = [
  { key: "announcements", label: "מודעות", icon: Megaphone },
  { key: "gallery",       label: "גלריה",  icon: ImageIcon },
  { key: "videos",        label: "וידאו",  icon: Youtube },
  { key: "pdfs",          label: "עלונים", icon: FileText },
  { key: "events",        label: "אירועים",icon: Calendar },
];

const ANNOUNCEMENT_VARIANTS = [
  { value: "info",    label: "כחול — כללי",   icon: Info },
  { value: "gold",    label: "זהב — חגיגי",   icon: Star },
  { value: "warning", label: "כתום — אזהרה",  icon: AlertTriangle },
  { value: "success", label: "ירוק — בשורה",  icon: CheckCircle },
];

const VIDEO_CATS = ["שיעורים","מפגשים","ברכות","דברי פתיחה","סיפורי בוגרים","כללי"];

function useList<T extends { id: number }>(listEndpoint: string, itemEndpoint?: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const base = itemEndpoint ?? listEndpoint;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(listEndpoint);
      if (res.ok) setItems(await res.json());
    } catch (_) {}
    finally { setLoading(false); }
  }, [listEndpoint]);

  useEffect(() => { load(); }, [load]);

  const del = useCallback(async (id: number) => {
    if (!confirm("למחוק פריט זה?")) return;
    await adminFetch(`${base}/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  }, [base]);

  const toggle = useCallback(async (id: number, field: string, current: boolean) => {
    await adminFetch(`${base}/${id}`, {
      method: "PUT",
      body: JSON.stringify({ [field]: !current }),
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: !current } : i));
  }, [base]);

  return { items, loading, load, del, toggle, setItems };
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/60 w-full";
const selectCls = `${inputCls} cursor-pointer`;

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      שמור
    </button>
  );
}

interface Announcement {
  id: number;
  title: string | null;
  body: string;
  linkUrl: string | null;
  linkType: string | null;
  linkLabel: string | null;
  variant: string;
  isPinned: boolean;
  isActive: boolean;
  sortOrder: number;
}

function AnnouncementsTab() {
  const { items, loading, load, del, toggle } = useList<Announcement>("/api/cms/admin/announcements", "/api/cms/admin/announcements");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", body: "", linkUrl: "", linkType: "url", linkLabel: "", variant: "info", isPinned: false,
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    if (!form.body.trim()) return;
    setSaving(true);
    await adminFetch("/api/cms/admin/announcements", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        linkUrl: form.linkUrl || null,
        linkLabel: form.linkLabel || null,
        title: form.title || null,
      }),
    });
    setForm({ title: "", body: "", linkUrl: "", linkType: "url", linkLabel: "", variant: "info", isPinned: false });
    setOpen(false);
    await load();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white">מודעות פעילות</h3>
        <button onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> מודעה חדשה
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <FieldRow label="כותרת (אופציונלי)">
            <input className={inputCls} placeholder="כותרת קצרה..." value={form.title} onChange={f("title")} />
          </FieldRow>
          <FieldRow label="טקסט מודעה *">
            <textarea className={inputCls} rows={2} placeholder="הטקסט שיוצג..." value={form.body} onChange={f("body")} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="סגנון">
              <select className={selectCls} value={form.variant} onChange={f("variant")}>
                {ANNOUNCEMENT_VARIANTS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="סוג קישור">
              <select className={selectCls} value={form.linkType} onChange={f("linkType")}>
                <option value="url">קישור רגיל</option>
                <option value="youtube">YouTube</option>
                <option value="audio">אודיו</option>
                <option value="pdf">PDF</option>
              </select>
            </FieldRow>
          </div>
          <FieldRow label="URL קישור (אופציונלי)">
            <input className={inputCls} placeholder="https://..." value={form.linkUrl} onChange={f("linkUrl")} />
          </FieldRow>
          <FieldRow label="תווית כפתור">
            <input className={inputCls} placeholder="לחצו כאן" value={form.linkLabel} onChange={f("linkLabel")} />
          </FieldRow>
          <div className="flex gap-3 pt-1">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-white transition">ביטול</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">אין מודעות עדיין</p>}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3" dir="rtl">
              <div className="flex-1 min-w-0">
                {item.title && <p className="text-sm font-bold text-white">{item.title}</p>}
                <p className="text-sm text-white/70 truncate">{item.body}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.variant === "gold" ? "bg-amber-500/20 text-amber-300" : item.variant === "warning" ? "bg-orange-500/20 text-orange-300" : item.variant === "success" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {ANNOUNCEMENT_VARIANTS.find(v => v.value === item.variant)?.label ?? item.variant}
                  </span>
                  {item.linkUrl && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50 flex items-center gap-1"><Link2 size={10} />{item.linkLabel ?? "קישור"}</span>}
                </div>
              </div>
              <button onClick={() => toggle(item.id, "isActive", item.isActive)} title={item.isActive ? "כבה" : "הדלק"}>
                {item.isActive ? <ToggleRight className="h-6 w-6 text-green-400" /> : <ToggleLeft className="h-6 w-6 text-white/30" />}
              </button>
              <button onClick={() => del(item.id)} className="text-red-400/50 hover:text-red-400 transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface GalleryItem {
  id: number;
  url: string;
  title: string;
  tag: string | null;
  year: string | null;
  isActive: boolean;
  sortOrder: number;
}

function GalleryTab() {
  const { items, loading, load, del, toggle } = useList<GalleryItem>("/api/cms/admin/gallery", "/api/cms/admin/gallery");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", tag: "", year: "", url: "" });
  const [file, setFile] = useState<File | null>(null);
  const [useFile, setUseFile] = useState(true);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      if (useFile && file) {
        const fd = new FormData();
        fd.append("image", file);
        fd.append("title", form.title);
        fd.append("tag", form.tag);
        fd.append("year", form.year);
        const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
        await fetch("/api/cms/admin/gallery", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      } else {
        await adminFetch("/api/cms/admin/gallery", {
          method: "POST",
          body: JSON.stringify({ ...form, url: form.url }),
        });
      }
      setForm({ title: "", tag: "", year: "", url: "" });
      setFile(null);
      setOpen(false);
      await load();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white">גלריית תמונות ({items.length})</h3>
        <button onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> תמונה חדשה
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <div className="flex gap-2">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => setUseFile(v)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${useFile === v ? "bg-primary text-primary-foreground" : "border border-white/15 text-muted-foreground"}`}>
                {v ? <><UploadCloud className="h-4 w-4 inline ml-1" />העלאת קובץ</> : <><Link2 className="h-4 w-4 inline ml-1" />URL חיצוני</>}
              </button>
            ))}
          </div>
          {useFile ? (
            <FieldRow label="קובץ תמונה">
              <input type="file" accept="image/*" className={inputCls}
                onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </FieldRow>
          ) : (
            <FieldRow label="URL תמונה">
              <input className={inputCls} placeholder="https://..." value={form.url} onChange={f("url")} />
            </FieldRow>
          )}
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="כותרת תמונה">
              <input className={inputCls} placeholder="שם האירוע / תיאור" value={form.title} onChange={f("title")} />
            </FieldRow>
            <FieldRow label="תג (אופציונלי)">
              <input className={inputCls} placeholder="מפגש, חתונה..." value={form.tag} onChange={f("tag")} />
            </FieldRow>
          </div>
          <FieldRow label="שנה (אופציונלי)">
            <input className={inputCls} placeholder="תשפ״ה" value={form.year} onChange={f("year")} />
          </FieldRow>
          <div className="flex gap-3 pt-1">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-white transition">ביטול</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {items.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-8">אין תמונות עדיין</p>}
          {items.map(item => (
            <div key={item.id} className="relative group rounded-2xl overflow-hidden border border-white/10 bg-card aspect-square">
              <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white text-xs text-center font-bold line-clamp-2">{item.title}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => toggle(item.id, "isActive", item.isActive)} title={item.isActive ? "הסתר" : "הצג"}>
                    {item.isActive ? <ToggleRight className="h-5 w-5 text-green-400" /> : <ToggleLeft className="h-5 w-5 text-white/40" />}
                  </button>
                  <button onClick={() => del(item.id)} className="text-red-400 hover:text-red-300 transition">
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

interface VideoItem {
  id: number;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  description: string;
  category: string;
  dateLabel: string;
  isActive: boolean;
}

function VideosTab() {
  const { items, loading, load, del, toggle } = useList<VideoItem>("/api/cms/admin/videos", "/api/cms/admin/videos");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ youtubeUrl: "", title: "", description: "", category: "שיעורים", dateLabel: "" });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    if (!form.youtubeUrl || !form.title) return;
    setSaving(true);
    await adminFetch("/api/cms/admin/videos", { method: "POST", body: JSON.stringify(form) });
    setForm({ youtubeUrl: "", title: "", description: "", category: "שיעורים", dateLabel: "" });
    setOpen(false);
    await load();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white">סרטוני YouTube ({items.length})</h3>
        <button onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> סרטון חדש
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <FieldRow label="קישור YouTube *">
            <input className={inputCls} placeholder="https://youtu.be/... או https://www.youtube.com/watch?v=..." value={form.youtubeUrl} onChange={f("youtubeUrl")} />
          </FieldRow>
          <FieldRow label="כותרת *">
            <input className={inputCls} placeholder="שם הסרטון" value={form.title} onChange={f("title")} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="קטגוריה">
              <select className={selectCls} value={form.category} onChange={f("category")}>
                {VIDEO_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="תאריך / תווית">
              <input className={inputCls} placeholder="תשרי תשפ״ה" value={form.dateLabel} onChange={f("dateLabel")} />
            </FieldRow>
          </div>
          <FieldRow label="תיאור קצר (אופציונלי)">
            <input className={inputCls} placeholder="מה רואים בסרטון..." value={form.description} onChange={f("description")} />
          </FieldRow>
          <div className="flex gap-3 pt-1">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-white transition">ביטול</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">אין סרטונים עדיין — הוסיפו סרטונים לשלוט בתוכן הוידאו באתר</p>}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3" dir="rtl">
              <img
                src={`https://img.youtube.com/vi/${item.youtubeId}/default.jpg`}
                alt={item.title}
                className="h-14 w-20 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{item.title}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-xs text-primary/70 font-bold">{item.category}</span>
                  {item.dateLabel && <span className="text-xs text-muted-foreground">{item.dateLabel}</span>}
                </div>
              </div>
              <button onClick={() => toggle(item.id, "isActive", item.isActive)} title={item.isActive ? "הסתר" : "הצג"}>
                {item.isActive ? <ToggleRight className="h-6 w-6 text-green-400" /> : <ToggleLeft className="h-6 w-6 text-white/30" />}
              </button>
              <button onClick={() => del(item.id)} className="text-red-400/50 hover:text-red-400 transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PdfItem {
  id: number;
  title: string;
  dateLabel: string;
  description: string;
  fileUrl: string | null;
  isActive: boolean;
}

function PdfsTab() {
  const { items, loading, load, del, toggle } = useList<PdfItem>("/api/cms/admin/pdfs", "/api/cms/admin/pdfs");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", dateLabel: "", description: "", fileUrl: "" });
  const [file, setFile] = useState<File | null>(null);
  const [useFile, setUseFile] = useState(true);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      if (useFile && file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", form.title);
        fd.append("dateLabel", form.dateLabel);
        fd.append("description", form.description);
        const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
        await fetch("/api/cms/admin/pdfs", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      } else {
        await adminFetch("/api/cms/admin/pdfs", {
          method: "POST",
          body: JSON.stringify({ ...form, fileUrl: form.fileUrl || null }),
        });
      }
      setForm({ title: "", dateLabel: "", description: "", fileUrl: "" });
      setFile(null);
      setOpen(false);
      await load();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white">עלונים ומסמכים ({items.length})</h3>
        <button onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> עלון חדש
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <div className="flex gap-2">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => setUseFile(v)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${useFile === v ? "bg-primary text-primary-foreground" : "border border-white/15 text-muted-foreground"}`}>
                {v ? <><UploadCloud className="h-4 w-4 inline ml-1" />העלאת PDF</> : <><Link2 className="h-4 w-4 inline ml-1" />URL חיצוני</>}
              </button>
            ))}
          </div>
          {useFile ? (
            <FieldRow label="קובץ PDF">
              <input type="file" accept="application/pdf" className={inputCls}
                onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </FieldRow>
          ) : (
            <FieldRow label="קישור ל-PDF">
              <input className={inputCls} placeholder="https://..." value={form.fileUrl} onChange={f("fileUrl")} />
            </FieldRow>
          )}
          <FieldRow label="כותרת *">
            <input className={inputCls} placeholder="שם העלון" value={form.title} onChange={f("title")} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="תאריך / גיליון">
              <input className={inputCls} placeholder="תשרי תשפ״ה" value={form.dateLabel} onChange={f("dateLabel")} />
            </FieldRow>
            <FieldRow label="תיאור (אופציונלי)">
              <input className={inputCls} placeholder="תוכן הגיליון..." value={form.description} onChange={f("description")} />
            </FieldRow>
          </div>
          <div className="flex gap-3 pt-1">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-white transition">ביטול</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">אין מסמכים עדיין</p>}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3" dir="rtl">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{item.title}</p>
                <div className="flex gap-2 mt-0.5">
                  {item.dateLabel && <span className="text-xs text-muted-foreground">{item.dateLabel}</span>}
                  {item.fileUrl ? <span className="text-xs text-green-400">✓ קובץ זמין</span> : <span className="text-xs text-yellow-400">⏳ בקרוב</span>}
                </div>
              </div>
              <button onClick={() => toggle(item.id, "isActive", item.isActive)} title={item.isActive ? "הסתר" : "הצג"}>
                {item.isActive ? <ToggleRight className="h-6 w-6 text-green-400" /> : <ToggleLeft className="h-6 w-6 text-white/30" />}
              </button>
              <button onClick={() => del(item.id)} className="text-red-400/50 hover:text-red-400 transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface EventItem {
  id: number;
  title: string;
  dateLabel: string;
  description: string;
  location: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  isActive: boolean;
}

function EventsTab() {
  const { items, loading, load, del, toggle } = useList<EventItem>("/api/cms/admin/events", "/api/cms/admin/events");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", dateLabel: "", description: "", location: "", linkUrl: "", linkLabel: "" });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    if (!form.title || !form.dateLabel) return;
    setSaving(true);
    await adminFetch("/api/cms/admin/events", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        location: form.location || null,
        linkUrl: form.linkUrl || null,
        linkLabel: form.linkLabel || null,
      }),
    });
    setForm({ title: "", dateLabel: "", description: "", location: "", linkUrl: "", linkLabel: "" });
    setOpen(false);
    await load();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white">אירועים קרובים ({items.length})</h3>
        <button onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> אירוע חדש
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="שם האירוע *">
              <input className={inputCls} placeholder="ערב הכרת הכרת תודה" value={form.title} onChange={f("title")} />
            </FieldRow>
            <FieldRow label="תאריך *">
              <input className={inputCls} placeholder="כ״ג בסיון תשפ״ה" value={form.dateLabel} onChange={f("dateLabel")} />
            </FieldRow>
          </div>
          <FieldRow label="תיאור קצר">
            <textarea className={inputCls} rows={2} placeholder="פרטי האירוע..." value={form.description} onChange={f("description")} />
          </FieldRow>
          <FieldRow label="מיקום">
            <input className={inputCls} placeholder="אולם שמחת לב, בני ברק" value={form.location} onChange={f("location")} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="קישור (אופציונלי)">
              <input className={inputCls} placeholder="https://..." value={form.linkUrl} onChange={f("linkUrl")} />
            </FieldRow>
            <FieldRow label="תווית כפתור">
              <input className={inputCls} placeholder="להרשמה" value={form.linkLabel} onChange={f("linkLabel")} />
            </FieldRow>
          </div>
          <div className="flex gap-3 pt-1">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-white transition">ביטול</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">אין אירועים עדיין</p>}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3" dir="rtl">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{item.title}</p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-primary font-bold">{item.dateLabel}</span>
                  {item.location && <span className="text-xs text-muted-foreground">{item.location}</span>}
                </div>
              </div>
              <button onClick={() => toggle(item.id, "isActive", item.isActive)} title={item.isActive ? "הסתר" : "הצג"}>
                {item.isActive ? <ToggleRight className="h-6 w-6 text-green-400" /> : <ToggleLeft className="h-6 w-6 text-white/30" />}
              </button>
              <button onClick={() => del(item.id)} className="text-red-400/50 hover:text-red-400 transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CmsManager() {
  const [sub, setSub] = useState<SubTab>("announcements");

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-xl font-black text-white">ניהול תוכן</h2>
        <p className="text-sm text-muted-foreground mt-1">עדכן את תוכן האתר ישירות מכאן — ללא תגובת קוד</p>
      </div>

      <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1 overflow-x-auto scrollbar-none">
        {SUBTABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSub(key)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition whitespace-nowrap ${sub === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-white"}`}
          >
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-card p-6">
        {sub === "announcements" && <AnnouncementsTab />}
        {sub === "gallery"       && <GalleryTab />}
        {sub === "videos"        && <VideosTab />}
        {sub === "pdfs"          && <PdfsTab />}
        {sub === "events"        && <EventsTab />}
      </div>
    </div>
  );
}
