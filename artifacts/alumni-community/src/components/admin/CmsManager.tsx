import { useState, useEffect, useCallback } from "react";
import {
  Megaphone, Image as ImageIcon, Youtube, FileText, Calendar,
  Plus, Trash2, Check, ToggleLeft, ToggleRight,
  Loader2, UploadCloud, Link2, Star,
  AlertTriangle, CheckCircle, Info, Pencil, X, Music,
  Radio, MapPin, PartyPopper
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

type SubTab = "banners" | "announcements" | "community-events" | "featured-shiur" | "gallery" | "videos" | "pdfs" | "events";

const SUBTABS: { key: SubTab; label: string; icon: typeof Megaphone }[] = [
  { key: "banners",          label: "כרזות",       icon: Star },
  { key: "announcements",    label: "מודעות",      icon: Megaphone },
  { key: "community-events", label: "אירועי קהילה", icon: PartyPopper },
  { key: "featured-shiur",   label: "שיעור מוצג",  icon: Music },
  { key: "gallery",          label: "גלריה",       icon: ImageIcon },
  { key: "videos",           label: "וידאו",       icon: Youtube },
  { key: "pdfs",             label: "עלונים",      icon: FileText },
  { key: "events",           label: "יומן",        icon: Calendar },
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
  type: string;
  eventDate: string | null;
  locationText: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
}

const EMPTY_ANN = {
  title: "", body: "", linkUrl: "", linkType: "url", linkLabel: "",
  variant: "info", type: "regular",
  eventDate: "", locationText: "", imageUrl: "", ctaText: "", ctaUrl: "",
};

function AnnouncementsTab() {
  const { items, loading, load, del, toggle } = useList<Announcement>("/api/cms/admin/announcements", "/api/cms/admin/announcements");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_ANN });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const openNew = () => { setEditId(null); setForm({ ...EMPTY_ANN }); setOpen(true); };

  const openEdit = (item: Announcement) => {
    setEditId(item.id);
    setForm({
      title: item.title ?? "", body: item.body,
      linkUrl: item.linkUrl ?? "", linkType: item.linkType ?? "url", linkLabel: item.linkLabel ?? "",
      variant: item.variant, type: item.type ?? "regular",
      eventDate: item.eventDate ?? "", locationText: item.locationText ?? "",
      imageUrl: item.imageUrl ?? "", ctaText: item.ctaText ?? "", ctaUrl: item.ctaUrl ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.body.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      linkUrl: form.linkUrl || null,
      linkLabel: form.linkLabel || null,
      title: form.title || null,
      eventDate: form.eventDate || null,
      locationText: form.locationText || null,
      imageUrl: form.imageUrl || null,
      ctaText: form.ctaText || null,
      ctaUrl: form.ctaUrl || null,
    };
    if (editId !== null) {
      await adminFetch(`/api/cms/admin/announcements/${editId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await adminFetch("/api/cms/admin/announcements", { method: "POST", body: JSON.stringify(payload) });
    }
    setForm({ ...EMPTY_ANN }); setEditId(null); setOpen(false);
    await load(); setSaving(false);
  };

  const isEvent = form.type === "event";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white">מודעות ({items.length})</h3>
          <p className="text-xs text-muted-foreground mt-0.5">מודעה רגילה = פס צבעוני · אירוע מיוחד = כרטיס גדול עם תמונה</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> מודעה חדשה
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">{editId ? "עריכת מודעה" : "מודעה חדשה"}</p>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition"><X size={16} /></button>
          </div>

          {/* Type Toggle */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2">סוג תבנית</p>
            <div className="flex gap-2">
              {[
                { value: "regular", label: "📢 מודעה רגילה", desc: "פס צבעוני קטן" },
                { value: "event",   label: "🎉 אירוע מיוחד", desc: "כרטיס גדול עם תמונה" },
              ].map(t => (
                <button key={t.value} onClick={() => setForm(p => ({ ...p, type: t.value }))}
                  className={`flex-1 rounded-xl p-3 text-right transition border ${form.type === t.value ? "border-primary/60 bg-primary/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                  <p className="text-sm font-bold text-white">{t.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="כותרת / שם האירוע">
              <input className={inputCls} placeholder={isEvent ? "שם האירוע..." : "כותרת קצרה (אופציונלי)"} value={form.title} onChange={f("title")} />
            </FieldRow>
            <FieldRow label="סגנון צבע">
              <select className={selectCls} value={form.variant} onChange={f("variant")}>
                {ANNOUNCEMENT_VARIANTS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </FieldRow>
          </div>

          <FieldRow label={isEvent ? "תיאור האירוע *" : "טקסט המודעה *"}>
            <textarea className={inputCls} rows={isEvent ? 4 : 2}
              placeholder={isEvent ? "פרטים על האירוע — תאריך, מה יקרה, מדוע חשוב..." : "הטקסט שיוצג..."}
              value={form.body} onChange={f("body")} />
          </FieldRow>

          {isEvent && (
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="תאריך האירוע">
                <input className={inputCls} placeholder='ה׳ באייר תשפ"ו' value={form.eventDate} onChange={f("eventDate")} />
              </FieldRow>
              <FieldRow label="מיקום">
                <input className={inputCls} placeholder="אולמי הדודאים, בני ברק" value={form.locationText} onChange={f("locationText")} />
              </FieldRow>
              <FieldRow label="קישור תמונה (URL)">
                <input className={inputCls} placeholder="/brit-grossman.png או https://..." value={form.imageUrl} onChange={f("imageUrl")} />
              </FieldRow>
              <FieldRow label="טקסט כפתור קריאה לפעולה">
                <input className={inputCls} placeholder="הצטרפו אלינו" value={form.ctaText} onChange={f("ctaText")} />
              </FieldRow>
              <FieldRow label="קישור הכפתור">
                <input className={inputCls} placeholder="https://..." value={form.ctaUrl} onChange={f("ctaUrl")} />
              </FieldRow>
            </div>
          )}

          {!isEvent && (
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="סוג קישור">
                <select className={selectCls} value={form.linkType} onChange={f("linkType")}>
                  <option value="url">קישור רגיל</option>
                  <option value="youtube">YouTube</option>
                  <option value="audio">אודיו</option>
                  <option value="pdf">PDF</option>
                </select>
              </FieldRow>
              <FieldRow label="URL קישור">
                <input className={inputCls} placeholder="https://..." value={form.linkUrl} onChange={f("linkUrl")} />
              </FieldRow>
              <FieldRow label="תווית כפתור">
                <input className={inputCls} placeholder="לחצו כאן" value={form.linkLabel} onChange={f("linkLabel")} />
              </FieldRow>
            </div>
          )}

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
            <div key={item.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${item.isActive ? "border-white/12 bg-white/[0.05]" : "border-white/6 bg-white/[0.02] opacity-60"}`} dir="rtl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === "event" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {item.type === "event" ? "🎉 אירוע" : "📢 רגילה"}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.variant === "gold" ? "bg-amber-500/15 text-amber-400" : item.variant === "warning" ? "bg-orange-500/15 text-orange-400" : item.variant === "success" ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"}`}>
                    {ANNOUNCEMENT_VARIANTS.find(v => v.value === item.variant)?.label ?? item.variant}
                  </span>
                </div>
                {item.title && <p className="text-sm font-bold text-white">{item.title}</p>}
                <p className="text-xs text-white/55 truncate mt-0.5">{item.body}</p>
                {item.type === "event" && (item.eventDate || item.locationText) && (
                  <p className="text-[10px] text-white/35 mt-0.5 flex items-center gap-1">
                    {item.eventDate && <><Calendar size={9} />{item.eventDate}</>}
                    {item.locationText && <><MapPin size={9} className="mr-1" />{item.locationText}</>}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(item)} title="ערוך" className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition">
                  <Pencil size={14} />
                </button>
                <button onClick={() => toggle(item.id, "isActive", item.isActive)} title={item.isActive ? "כבה" : "הדלק"}>
                  {item.isActive ? <ToggleRight className="h-6 w-6 text-green-400" /> : <ToggleLeft className="h-6 w-6 text-white/30" />}
                </button>
                <button onClick={() => del(item.id)} className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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

const LABEL_ICONS = [
  { value: "flame",   label: "🔥 להבה" },
  { value: "star",    label: "⭐ כוכב" },
  { value: "bell",    label: "🔔 פעמון" },
  { value: "heart",   label: "❤️ לב" },
  { value: "book",    label: "📖 ספר" },
  { value: "warning", label: "⚠️ אזהרה" },
];

interface SpecialBannerItem {
  id: number;
  label: string;
  labelIcon: string;
  dateLabel: string;
  headline: string;
  subtitle: string;
  bodyText: string;
  footerText: string;
  youtubeId: string | null;
  audioUrl: string | null;
  audioLabel: string;
  audioSublabel: string;
  expiresAt: string | null;
  isActive: boolean;
}

function SpecialBannersTab() {
  const { items, loading, load, del, toggle } = useList<SpecialBannerItem>(
    "/api/cms/admin/special-banners",
    "/api/cms/admin/special-banners"
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [useAudioFile, setUseAudioFile] = useState(false);
  const [form, setForm] = useState({
    label: "יום הפטירה",
    labelIcon: "flame",
    dateLabel: "",
    headline: "",
    subtitle: "",
    bodyText: "",
    footerText: "",
    youtubeId: "",
    audioUrl: "",
    audioLabel: "",
    audioSublabel: "",
    expiresAt: "",
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    if (!form.headline.trim()) return;
    setSaving(true);
    try {
      if (useAudioFile && audioFile) {
        const fd = new FormData();
        fd.append("audio", audioFile);
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
        await fetch("/api/cms/admin/special-banners", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      } else {
        await adminFetch("/api/cms/admin/special-banners", {
          method: "POST",
          body: JSON.stringify({
            ...form,
            youtubeId: form.youtubeId || null,
            audioUrl: form.audioUrl || null,
            expiresAt: form.expiresAt || null,
          }),
        });
      }
      setForm({
        label: "יום הפטירה", labelIcon: "flame", dateLabel: "", headline: "", subtitle: "",
        bodyText: "", footerText: "", youtubeId: "", audioUrl: "", audioLabel: "", audioSublabel: "", expiresAt: "",
      });
      setAudioFile(null);
      setOpen(false);
      await load();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white">כרזות מיוחדות ({items.length})</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            כרזות עם עיצוב זהב-כהה כמו שאר האתר — לימי פטירה, אירועים, בשורות חשובות
          </p>
        </div>
        <button onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> כרזה חדשה
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="תווית הכרזה *">
              <input className={inputCls} placeholder='יום הפטירה / אירוע מיוחד...' value={form.label} onChange={f("label")} />
            </FieldRow>
            <FieldRow label="אייקון תווית">
              <select className={selectCls} value={form.labelIcon} onChange={f("labelIcon")}>
                {LABEL_ICONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="כותרת ראשית *">
              <input className={inputCls} placeholder='לעילוי נשמת...' value={form.headline} onChange={f("headline")} />
            </FieldRow>
            <FieldRow label="תאריך (עברי)">
              <input className={inputCls} placeholder='י׳ באייר תשפ״ו' value={form.dateLabel} onChange={f("dateLabel")} />
            </FieldRow>
          </div>

          <FieldRow label="כותרת משנה">
            <input className={inputCls} placeholder='פנייה מרגשת לבוגרי...' value={form.subtitle} onChange={f("subtitle")} />
          </FieldRow>

          <FieldRow label="גוף הטקסט (ישמר עם ירידות שורה)">
            <textarea className={inputCls} rows={6} placeholder='הטקסט המלא שיוצג...' value={form.bodyText} onChange={f("bodyText")} />
          </FieldRow>

          <FieldRow label="שורת פסקה בתחתית">
            <input className={inputCls} placeholder='תהא נשמתו צרורה בצרור החיים...' value={form.footerText} onChange={f("footerText")} />
          </FieldRow>

          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="ID יוטיוב (אופציונלי)">
              <input className={inputCls} placeholder='g3xmmp9k0gE' value={form.youtubeId} onChange={f("youtubeId")} />
            </FieldRow>
            <FieldRow label="תפוגה (השתק אחרי תאריך)">
              <input type="datetime-local" className={inputCls} value={form.expiresAt} onChange={f("expiresAt")} />
            </FieldRow>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground">קובץ אודיו (אופציונלי)</p>
            <div className="flex gap-2">
              {[false, true].map(v => (
                <button key={String(v)} onClick={() => setUseAudioFile(v)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${useAudioFile === v ? "bg-primary text-primary-foreground" : "border border-white/15 text-muted-foreground"}`}>
                  {v ? <><UploadCloud className="h-4 w-4 inline ml-1" />העלאה</> : <><Link2 className="h-4 w-4 inline ml-1" />URL</>}
                </button>
              ))}
            </div>
            {useAudioFile ? (
              <FieldRow label="קובץ שמע">
                <input type="file" accept="audio/*" className={inputCls} onChange={e => setAudioFile(e.target.files?.[0] ?? null)} />
              </FieldRow>
            ) : (
              <FieldRow label="קישור אודיו">
                <input className={inputCls} placeholder="/hesped.wav או https://..." value={form.audioUrl} onChange={f("audioUrl")} />
              </FieldRow>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="כותרת השמע">
                <input className={inputCls} placeholder='ספד על חברינו...' value={form.audioLabel} onChange={f("audioLabel")} />
              </FieldRow>
              <FieldRow label="תת-כותרת השמע">
                <input className={inputCls} placeholder='הספד מרגש...' value={form.audioSublabel} onChange={f("audioSublabel")} />
              </FieldRow>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-white transition">ביטול</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-white/40 text-sm">אין כרזות עדיין</p>
              <p className="text-white/25 text-xs">צרו כרזה מיוחדת עם עיצוב יום הפטירה</p>
            </div>
          )}
          {items.map(item => (
            <div
              key={item.id}
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: item.isActive ? "rgba(201,169,110,0.3)" : "rgba(255,255,255,0.08)",
                background: item.isActive
                  ? "linear-gradient(135deg, rgba(45,26,0,0.6) 0%, rgba(26,13,0,0.6) 100%)"
                  : "rgba(255,255,255,0.03)",
              }}
            >
              <div className="p-4" dir="rtl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(201,169,110,0.15)", color: "#c9a96e", border: "1px solid rgba(201,169,110,0.3)" }}
                      >
                        {item.label}
                      </span>
                      {item.dateLabel && (
                        <span className="text-xs text-white/40">{item.dateLabel}</span>
                      )}
                      {item.expiresAt && (
                        <span className="text-xs text-orange-400/60">
                          תפוגה: {new Date(item.expiresAt).toLocaleDateString("he-IL")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white truncate">{item.headline}</p>
                    {item.subtitle && <p className="text-xs text-white/50 mt-0.5 truncate">{item.subtitle}</p>}
                    <div className="flex gap-3 mt-2 text-xs text-white/30">
                      {item.youtubeId && <span className="flex items-center gap-1"><Youtube size={11} />וידאו</span>}
                      {item.audioUrl && <span className="flex items-center gap-1"><CheckCircle size={11} />אודיו</span>}
                      {item.bodyText && <span>טקסט ✓</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggle(item.id, "isActive", item.isActive)} title={item.isActive ? "כבה" : "הדלק"}>
                      {item.isActive
                        ? <ToggleRight className="h-7 w-7 text-amber-400" />
                        : <ToggleLeft className="h-7 w-7 text-white/20" />
                      }
                    </button>
                    <button onClick={() => del(item.id)} className="text-red-400/40 hover:text-red-400 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              {item.isActive && (
                <div className="h-0.5" style={{ background: "linear-gradient(90deg, transparent, #c9a028, transparent)" }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// FEATURED SHIUR TAB
// ─────────────────────────────────────────────
interface ShiurItem {
  id: number;
  title: string;
  subtitle: string;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  rabbiName: string;
  parasha: string;
  durationLabel: string;
  isActive: boolean;
}

const EMPTY_SHIUR = {
  title: "", subtitle: "", rabbiName: 'הרב שניאור גרוסמן שליט"א',
  parasha: "", durationLabel: "", audioUrl: "", thumbnailUrl: "",
};

function FeaturedShiurTab() {
  const { items, loading, load, del, toggle } = useList<ShiurItem>("/api/cms/admin/featured-shiur", "/api/cms/admin/featured-shiur");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_SHIUR });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const openEdit = (item: ShiurItem) => {
    setEditId(item.id);
    setForm({
      title: item.title, subtitle: item.subtitle, rabbiName: item.rabbiName,
      parasha: item.parasha, durationLabel: item.durationLabel,
      audioUrl: item.audioUrl ?? "", thumbnailUrl: item.thumbnailUrl ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (audioFile || thumbFile) {
        const fd = new FormData();
        if (audioFile) fd.append("audio", audioFile);
        if (thumbFile) fd.append("thumbnail", thumbFile);
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
        const url = editId ? `/api/cms/admin/featured-shiur/${editId}` : "/api/cms/admin/featured-shiur";
        await fetch(url, { method: editId ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      } else {
        const url = editId ? `/api/cms/admin/featured-shiur/${editId}` : "/api/cms/admin/featured-shiur";
        await adminFetch(url, { method: editId ? "PUT" : "POST", body: JSON.stringify(form) });
      }
      setForm({ ...EMPTY_SHIUR }); setEditId(null); setOpen(false); setAudioFile(null); setThumbFile(null);
      await load();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white">שיעורים מוצגים ({items.length})</h3>
          <p className="text-xs text-muted-foreground mt-0.5">השיעור הראשון הפעיל יוצג בבאנר הבולט באתר</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ ...EMPTY_SHIUR }); setOpen(o => !o); }}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> שיעור חדש
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">{editId ? "עריכת שיעור" : "שיעור חדש"}</p>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
          </div>
          <FieldRow label="כותרת השיעור *">
            <input className={inputCls} placeholder='שיעור פרשת תזריע–מצורע · כ"ז ניסן תשפ"ו' value={form.title} onChange={f("title")} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="שם הרב">
              <input className={inputCls} placeholder='הרב שניאור גרוסמן שליט"א' value={form.rabbiName} onChange={f("rabbiName")} />
            </FieldRow>
            <FieldRow label="פרשה / נושא">
              <input className={inputCls} placeholder="תזריע–מצורע · תשפ״ו" value={form.parasha} onChange={f("parasha")} />
            </FieldRow>
          </div>
          <FieldRow label="קישור שמע (URL) — או העלה קובץ למטה">
            <input className={inputCls} placeholder="/shiur.mp3 או https://..." value={form.audioUrl} onChange={f("audioUrl")} />
          </FieldRow>
          <FieldRow label="קובץ שמע להעלאה (מחליף URL אם נבחר)">
            <input type="file" accept="audio/*" className={inputCls} onChange={e => setAudioFile(e.target.files?.[0] ?? null)} />
          </FieldRow>
          <FieldRow label="תמונה ממוזערת (URL)">
            <input className={inputCls} placeholder="/rabbi-thumb.jpg או https://..." value={form.thumbnailUrl} onChange={f("thumbnailUrl")} />
          </FieldRow>
          <FieldRow label="קובץ תמונה להעלאה">
            <input type="file" accept="image/*" className={inputCls} onChange={e => setThumbFile(e.target.files?.[0] ?? null)} />
          </FieldRow>
          <div className="flex gap-3 pt-1">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-white transition">ביטול</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="space-y-2">
          {items.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-white/40 text-sm">אין שיעורים עדיין</p>
              <p className="text-white/25 text-xs">הוסף שיעור — הוא יופיע בבאנר הגדול בעמוד הבית</p>
            </div>
          )}
          {items.map(item => (
            <div key={item.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${item.isActive ? "border-white/12 bg-white/[0.05]" : "border-white/6 bg-white/[0.02] opacity-55"}`} dir="rtl">
              {item.thumbnailUrl && (
                <img src={item.thumbnailUrl} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{item.rabbiName}</p>
                <p className="text-xs text-white/50 truncate">{item.title}</p>
                <div className="flex gap-2 mt-1">
                  {item.parasha && <span className="text-[10px] text-white/30">{item.parasha}</span>}
                  {item.audioUrl && <span className="text-[10px] text-green-400/60 flex items-center gap-1"><Radio size={9} />אודיו</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition">
                  <Pencil size={14} />
                </button>
                <button onClick={() => toggle(item.id, "isActive", item.isActive)}>
                  {item.isActive ? <ToggleRight className="h-6 w-6 text-green-400" /> : <ToggleLeft className="h-6 w-6 text-white/30" />}
                </button>
                <button onClick={() => del(item.id)} className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMMUNITY EVENTS TAB
// ─────────────────────────────────────────────
interface CommunityEventItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  imageUrl: string | null;
  ctaText: string;
  ctaLink: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

const EMPTY_CEV = {
  title: "", subtitle: "שמחת הקהילה", description: "",
  eventDate: "", eventTime: "", location: "",
  imageUrl: "", ctaText: "הצטרפו אלינו", ctaLink: "", expiresAt: "",
};

function CommunityEventsTab() {
  const { items, loading, load, del, toggle } = useList<CommunityEventItem>("/api/cms/admin/community-events", "/api/cms/admin/community-events");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_CEV });
  const [imgFile, setImgFile] = useState<File | null>(null);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const openEdit = (item: CommunityEventItem) => {
    setEditId(item.id);
    setForm({
      title: item.title, subtitle: item.subtitle, description: item.description,
      eventDate: item.eventDate, eventTime: item.eventTime, location: item.location,
      imageUrl: item.imageUrl ?? "", ctaText: item.ctaText, ctaLink: item.ctaLink ?? "",
      expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 16) : "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const url = editId ? `/api/cms/admin/community-events/${editId}` : "/api/cms/admin/community-events";
      const method = editId ? "PUT" : "POST";
      if (imgFile && !editId) {
        const fd = new FormData();
        fd.append("image", imgFile);
        Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
        const token = sessionStorage.getItem(TOKEN_KEY) ?? "";
        await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      } else {
        await adminFetch(url, {
          method, body: JSON.stringify({
            ...form,
            imageUrl: form.imageUrl || null,
            ctaLink: form.ctaLink || null,
            expiresAt: form.expiresAt || null,
          })
        });
      }
      setForm({ ...EMPTY_CEV }); setEditId(null); setOpen(false); setImgFile(null);
      await load();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white">אירועי קהילה ({items.length})</h3>
          <p className="text-xs text-muted-foreground mt-0.5">כרטיסי אירוע גדולים עם תמונה — יופיעו בעמוד הבית</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ ...EMPTY_CEV }); setOpen(o => !o); }}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition">
          <Plus className="h-4 w-4" /> אירוע חדש
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4" dir="rtl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">{editId ? "עריכת אירוע" : "אירוע חדש"}</p>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
          </div>
          <FieldRow label="שם האירוע *">
            <input className={inputCls} placeholder='סנדקאות מורינו הרב גרוסמן שליט"א' value={form.title} onChange={f("title")} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="תגית (בתווית)">
              <input className={inputCls} placeholder="שמחת הקהילה" value={form.subtitle} onChange={f("subtitle")} />
            </FieldRow>
            <FieldRow label="תאריך האירוע (עברי)">
              <input className={inputCls} placeholder='ה׳ באייר תשפ"ו' value={form.eventDate} onChange={f("eventDate")} />
            </FieldRow>
            <FieldRow label="שעה">
              <input className={inputCls} placeholder="19:30" value={form.eventTime} onChange={f("eventTime")} />
            </FieldRow>
            <FieldRow label="מיקום">
              <input className={inputCls} placeholder="אולמי הדודאים, בני ברק" value={form.location} onChange={f("location")} />
            </FieldRow>
          </div>
          <FieldRow label="תיאור האירוע">
            <textarea className={inputCls} rows={4} placeholder="פרטים על האירוע..." value={form.description} onChange={f("description")} />
          </FieldRow>
          <FieldRow label="תמונה (URL) — או העלה קובץ למטה">
            <input className={inputCls} placeholder="/brit-grossman.png או https://..." value={form.imageUrl} onChange={f("imageUrl")} />
          </FieldRow>
          <FieldRow label="קובץ תמונה להעלאה">
            <input type="file" accept="image/*" className={inputCls} onChange={e => setImgFile(e.target.files?.[0] ?? null)} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="טקסט כפתור">
              <input className={inputCls} placeholder="לכל תמונות הקהילה" value={form.ctaText} onChange={f("ctaText")} />
            </FieldRow>
            <FieldRow label="קישור כפתור">
              <input className={inputCls} placeholder="/gallery או https://..." value={form.ctaLink} onChange={f("ctaLink")} />
            </FieldRow>
          </div>
          <FieldRow label="תפוגה (הכרטיס יעלם אחרי תאריך זה)">
            <input type="datetime-local" className={inputCls} value={form.expiresAt} onChange={f("expiresAt")} />
          </FieldRow>
          <div className="flex gap-3 pt-1">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-white transition">ביטול</button>
          </div>
        </div>
      )}

      {loading ? <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="space-y-2">
          {items.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-white/40 text-sm">אין אירועים עדיין</p>
              <p className="text-white/25 text-xs">הוסף אירוע קהילה — יופיע בכרטיס גדול בעמוד הבית</p>
            </div>
          )}
          {items.map(item => (
            <div key={item.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${item.isActive ? "border-white/12 bg-white/[0.05]" : "border-white/6 bg-white/[0.02] opacity-55"}`} dir="rtl">
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" className="h-12 w-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{item.title}</p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  {item.eventDate && <span className="text-[10px] text-white/40 flex items-center gap-0.5"><Calendar size={9} />{item.eventDate}</span>}
                  {item.location && <span className="text-[10px] text-white/40 flex items-center gap-0.5"><MapPin size={9} />{item.location}</span>}
                  {item.expiresAt && <span className="text-[10px] text-orange-400/60">פג: {new Date(item.expiresAt).toLocaleDateString("he-IL")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition">
                  <Pencil size={14} />
                </button>
                <button onClick={() => toggle(item.id, "isActive", item.isActive)}>
                  {item.isActive ? <ToggleRight className="h-6 w-6 text-green-400" /> : <ToggleLeft className="h-6 w-6 text-white/30" />}
                </button>
                <button onClick={() => del(item.id)} className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CmsManager() {
  const [sub, setSub] = useState<SubTab>("banners");

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
        {sub === "banners"          && <SpecialBannersTab />}
        {sub === "announcements"    && <AnnouncementsTab />}
        {sub === "community-events" && <CommunityEventsTab />}
        {sub === "featured-shiur"   && <FeaturedShiurTab />}
        {sub === "gallery"          && <GalleryTab />}
        {sub === "videos"           && <VideosTab />}
        {sub === "pdfs"             && <PdfsTab />}
        {sub === "events"           && <EventsTab />}
      </div>
    </div>
  );
}
