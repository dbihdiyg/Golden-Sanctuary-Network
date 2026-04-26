import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import hadarLogo from "@/assets/logo-hadar.png";
import {
  Lock, Plus, Trash2, Edit2, Eye, Package, ShoppingBag,
  BarChart3, LogOut, Check, X, ImagePlus, GripVertical,
  RefreshCw, ArrowRight, ChevronDown, ChevronUp, Loader2,
  AlertCircle, Users, DollarSign, Clock, ToggleLeft, ToggleRight, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");

async function adminFetch(path: string, token: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...opts,
    headers: { "x-admin-secret": token, "Content-Type": "application/json", ...((opts.headers as any) || {}) },
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminOrder {
  id: number;
  clerkUserId: string;
  templateId: string;
  status: string;
  amount: number | null;
  currency: string;
  createdAt: string;
  designId: number | null;
  designName: string | null;
  fieldValues: Record<string, string> | null;
}

interface AdminStats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalDesigns: number;
}

interface AdminSlot {
  id: string;
  label: string;
  placeholder: string;
  defaultValue: string;
  x: number;
  y: number;
  width: number;
  fontSize: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  fontFamily: "serif" | "sans";
  bold: boolean;
  color: "gold" | "white" | "dark" | "cream";
  align: "center" | "right" | "left";
  multiline: boolean;
}

interface DBTemplate {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  style: string;
  price: number;
  imageUrl: string | null;
  slots: AdminSlot[];
  isActive: boolean;
  createdAt: string;
}

const emptySlot = (): AdminSlot => ({
  id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  label: "שדה חדש",
  placeholder: "",
  defaultValue: "",
  x: 10,
  y: 10,
  width: 80,
  fontSize: "md",
  fontFamily: "serif",
  bold: false,
  color: "gold",
  align: "center",
  multiline: false,
});

const ORDER_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: "ממתין לתשלום", cls: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  paid:      { label: "שולם",         cls: "text-green-400 bg-green-400/10 border-green-400/30" },
  completed: { label: "הושלם",        cls: "text-blue-400  bg-blue-400/10  border-blue-400/30"  },
  cancelled: { label: "בוטל",         cls: "text-red-400   bg-red-400/10   border-red-400/30"   },
};

// ─── Visual Template Editor ───────────────────────────────────────────────────
function TemplateEditor({
  initial,
  token,
  onSave,
  onClose,
}: {
  initial: Partial<DBTemplate> | null;
  token: string;
  onSave: (t: DBTemplate) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<DBTemplate, "id" | "createdAt">>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    category: initial?.category ?? "",
    style: initial?.style ?? "",
    price: initial?.price ?? 4900,
    imageUrl: initial?.imageUrl ?? null,
    slots: (initial?.slots as AdminSlot[]) ?? [],
    isActive: initial?.isActive ?? true,
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{
    id: string; sx: number; sy: number; sl: number; st: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedSlot = form.slots.find(s => s.id === selectedSlotId) ?? null;

  const updateSlot = useCallback((id: string, patch: Partial<AdminSlot>) =>
    setForm(p => ({ ...p, slots: p.slots.map(s => s.id === id ? { ...s, ...patch } : s) })), []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE}/api/hadar/admin/upload`, {
        method: "POST",
        headers: { "x-admin-secret": token },
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setForm(p => ({ ...p, imageUrl: url }));
    } catch (err: any) {
      setError(`שגיאת העלאה: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragging) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-slot]")) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = +((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = +((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    const slot = { ...emptySlot(), x, y };
    setForm(p => ({ ...p, slots: [...p.slots, slot] }));
    setSelectedSlotId(slot.id);
  }

  function onSlotPointerDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    const slot = form.slots.find(s => s.id === id)!;
    setDragging({ id, sx: e.clientX, sy: e.clientY, sl: slot.x, st: slot.y });
    setSelectedSlotId(id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragging.sx) / rect.width * 100;
    const dy = (e.clientY - dragging.sy) / rect.height * 100;
    updateSlot(dragging.id, {
      x: Math.max(0, Math.min(95, dragging.sl + dx)),
      y: Math.max(0, Math.min(95, dragging.st + dy)),
    });
  }

  async function handleSave() {
    if (!form.slug || !form.title) { setError("slug וכותרת הם חובה"); return; }
    setSaving(true);
    setError(null);
    try {
      let result: DBTemplate;
      if ((initial as DBTemplate)?.id) {
        result = await adminFetch(`/hadar/admin/templates/${(initial as DBTemplate).id}`, token, {
          method: "PUT", body: JSON.stringify(form),
        });
      } else {
        result = await adminFetch("/hadar/admin/templates", token, {
          method: "POST", body: JSON.stringify(form),
        });
      }
      onSave(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-primary/10 bg-card/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1 text-muted-foreground">
            <ArrowRight className="w-4 h-4" /> חזרה
          </Button>
          <span className="text-foreground font-semibold">{form.title || "תבנית חדשה"}</span>
          {form.imageUrl && (
            <span className="text-xs text-muted-foreground">לחץ על התמונה להוספת שדה | גרור שדה לשינוי מיקום</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-destructive">{error}</span>}
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            שמור
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Canvas ── */}
        <div className="flex-1 bg-gray-900 overflow-auto flex items-start justify-center p-8">
          {form.imageUrl ? (
            <div
              ref={canvasRef}
              className="relative select-none"
              style={{ cursor: "crosshair", maxWidth: 640 }}
              onClick={handleCanvasClick}
              onPointerMove={onPointerMove}
              onPointerUp={() => setDragging(null)}
              onPointerLeave={() => setDragging(null)}
            >
              <img
                src={form.imageUrl}
                alt="תמונת תבנית"
                className="block w-full"
                style={{ maxHeight: "75vh", objectFit: "contain" }}
                draggable={false}
              />
              {form.slots.map(slot => (
                <div
                  key={slot.id}
                  data-slot={slot.id}
                  onPointerDown={e => onSlotPointerDown(e, slot.id)}
                  onClick={e => { e.stopPropagation(); setSelectedSlotId(slot.id); }}
                  style={{
                    position: "absolute",
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `${slot.width}%`,
                    border: `2px ${selectedSlotId === slot.id ? "solid #D6A84F" : "dashed rgba(214,168,79,0.55)"}`,
                    background: selectedSlotId === slot.id ? "rgba(214,168,79,0.18)" : "rgba(214,168,79,0.06)",
                    cursor: "move",
                    padding: "3px 8px",
                    borderRadius: 4,
                    minHeight: 22,
                    touchAction: "none",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#D6A84F", direction: "rtl", display: "block", userSelect: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <label className="cursor-pointer">
              <div className="w-80 h-80 border-2 border-dashed border-primary/40 rounded-2xl flex flex-col items-center justify-center gap-4 text-primary/60 hover:border-primary/70 hover:text-primary/80 transition-colors">
                {uploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <ImagePlus className="w-10 h-10" />}
                <span className="text-sm">{uploading ? "מעלה תמונה..." : "לחץ להעלאת תמונת הרקע"}</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="w-80 border-r border-primary/10 bg-card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">

            {/* Image upload (if already has one) */}
            {form.imageUrl && (
              <section className="p-4 border-b border-primary/10">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">תמונת רקע</p>
                <label className="cursor-pointer block">
                  <div className="border border-dashed border-primary/30 rounded-lg p-2 text-center text-xs text-muted-foreground hover:border-primary/60 transition-colors flex items-center justify-center gap-2">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
                    {uploading ? "מעלה..." : "החלף תמונה"}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </section>
            )}

            {/* Template metadata */}
            <section className="p-4 border-b border-primary/10 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">פרטי התבנית</p>
              {[
                { key: "title", label: "כותרת" },
                { key: "subtitle", label: "תת-כותרת" },
                { key: "slug", label: "מזהה (slug)", dir: "ltr" },
                { key: "category", label: "קטגוריה" },
                { key: "style", label: "סגנון" },
              ].map(({ key, label, dir }) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    dir={dir as any}
                    className="mt-1 h-8 text-sm bg-background border-primary/20"
                    value={(form as any)[key] ?? ""}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <Label className="text-xs text-muted-foreground">מחיר (אגורות, ₪49 = 4900)</Label>
                <Input
                  type="number"
                  dir="ltr"
                  className="mt-1 h-8 text-sm bg-background border-primary/20"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex-1">תבנית פעילה</Label>
                <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))} className="text-primary">
                  {form.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                </button>
              </div>
            </section>

            {/* Slots management */}
            <section className="p-4 border-b border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">שדות טקסט ({form.slots.length})</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                  onClick={() => {
                    const slot = emptySlot();
                    setForm(p => ({ ...p, slots: [...p.slots, slot] }));
                    setSelectedSlotId(slot.id);
                  }}
                >
                  <Plus className="w-3 h-3" /> הוסף שדה
                </Button>
              </div>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {form.slots.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    {form.imageUrl ? "לחץ על התמונה להוספת שדה" : "העלה תמונה קודם"}
                  </p>
                )}
                {form.slots.map(slot => (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${selectedSlotId === slot.id ? "bg-primary/10 text-primary" : "hover:bg-primary/5 text-foreground"}`}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 truncate">{slot.label}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setForm(p => ({ ...p, slots: p.slots.filter(s => s.id !== slot.id) }));
                        if (selectedSlotId === slot.id) setSelectedSlotId(null);
                      }}
                      className="text-destructive/60 hover:text-destructive p-0.5 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Selected slot properties */}
            {selectedSlot && (
              <section className="p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground">הגדרות שדה: {selectedSlot.label}</p>
                {[
                  { key: "label", label: "תווית" },
                  { key: "placeholder", label: "טקסט עזר" },
                  { key: "defaultValue", label: "ערך ברירת מחדל" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Input
                      className="mt-1 h-8 text-sm bg-background border-primary/20"
                      value={(selectedSlot as any)[key] ?? ""}
                      onChange={e => updateSlot(selectedSlot.id, { [key]: e.target.value })}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "x", label: "X%" },
                    { key: "y", label: "Y%" },
                    { key: "width", label: "רוחב%" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label className="text-[10px] text-muted-foreground">{label}</Label>
                      <Input
                        type="number"
                        dir="ltr"
                        className="mt-1 h-7 text-xs bg-background border-primary/20 px-2"
                        value={Math.round((selectedSlot as any)[key])}
                        onChange={e => updateSlot(selectedSlot.id, { [key]: Number(e.target.value) })}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">גודל</Label>
                    <select
                      className="mt-1 w-full h-8 px-2 bg-background border border-primary/20 rounded-md text-sm text-foreground"
                      value={selectedSlot.fontSize}
                      onChange={e => updateSlot(selectedSlot.id, { fontSize: e.target.value as any })}
                    >
                      {["xs", "sm", "md", "lg", "xl", "2xl"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">צבע</Label>
                    <select
                      className="mt-1 w-full h-8 px-2 bg-background border border-primary/20 rounded-md text-sm text-foreground"
                      value={selectedSlot.color}
                      onChange={e => updateSlot(selectedSlot.id, { color: e.target.value as any })}
                    >
                      {["gold", "cream", "white", "dark"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">יישור</Label>
                    <select
                      className="mt-1 w-full h-8 px-2 bg-background border border-primary/20 rounded-md text-sm text-foreground"
                      value={selectedSlot.align}
                      onChange={e => updateSlot(selectedSlot.id, { align: e.target.value as any })}
                    >
                      {[["center", "מרכז"], ["right", "ימין"], ["left", "שמאל"]].map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">פונט</Label>
                    <select
                      className="mt-1 w-full h-8 px-2 bg-background border border-primary/20 rounded-md text-sm text-foreground"
                      value={selectedSlot.fontFamily}
                      onChange={e => updateSlot(selectedSlot.id, { fontFamily: e.target.value as any })}
                    >
                      <option value="serif">סריף</option>
                      <option value="sans">סאנס</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSlot.bold}
                      onChange={e => updateSlot(selectedSlot.id, { bold: e.target.checked })}
                      className="accent-primary"
                    />
                    מודגש
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSlot.multiline}
                      onChange={e => updateSlot(selectedSlot.id, { multiline: e.target.checked })}
                      className="accent-primary"
                    />
                    מספר שורות
                  </label>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline-editable price cell ───────────────────────────────────────────────
function PriceCell({ tmpl, token, onUpdate }: { tmpl: DBTemplate; token: string; onUpdate: (id: number, price: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(Math.round(tmpl.price / 100)));
  const [saving, setSaving] = useState(false);

  async function save() {
    const priceShekels = parseFloat(val);
    if (isNaN(priceShekels) || priceShekels <= 0) { setEditing(false); setVal(String(Math.round(tmpl.price / 100))); return; }
    setSaving(true);
    try {
      await adminFetch(`/hadar/admin/templates/${tmpl.id}`, token, {
        method: "PATCH", body: JSON.stringify({ price: Math.round(priceShekels * 100) }),
      });
      onUpdate(tmpl.id, Math.round(priceShekels * 100));
    } finally { setSaving(false); setEditing(false); }
  }

  if (editing) return (
    <div className="flex items-center gap-1">
      <span className="text-primary text-sm">₪</span>
      <input
        type="number" value={val} onChange={e => setVal(e.target.value)} autoFocus
        onBlur={save} onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setEditing(false); setVal(String(Math.round(tmpl.price / 100))); } }}
        className="w-20 bg-background border border-primary/40 rounded px-2 py-1 text-sm text-foreground outline-none"
      />
      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
    </div>
  );

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 group" title="לחץ לעריכת מחיר">
      <span className="font-bold text-primary text-sm group-hover:underline">₪{Math.round(tmpl.price / 100)}</span>
      <Edit2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

// ─── Elements manager component ──────────────────────────────────────────────
interface LibEl { id: number; name: string; category: string; fileContent: string; mimeType: string; isActive: boolean; }

function ElementsManager({ token }: { token: string }) {
  const [elements, setElements] = useState<LibEl[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("קישוטים");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const d = await adminFetch("/hadar/admin/elements", token);
      setElements(d);
    } catch { setError("שגיאה בטעינה"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    if (!name.trim()) { setError("הכניסו שם לאלמנט"); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name);
      fd.append("category", category);
      const res = await fetch(`${API_BASE}/api/hadar/admin/elements`, {
        method: "POST",
        headers: { "x-admin-secret": token },
        body: fd,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "שגיאה");
      setElements(prev => [d, ...prev]);
      setName(""); setError(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      setError(e.message);
    } finally { setUploading(false); }
  };

  const toggleActive = async (el: LibEl) => {
    const updated = await adminFetch(`/hadar/admin/elements/${el.id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !el.isActive }),
    });
    setElements(prev => prev.map(e => e.id === el.id ? updated : e));
  };

  const deleteEl = async (id: number) => {
    if (!confirm("למחוק?")) return;
    await adminFetch(`/hadar/admin/elements/${id}`, token, { method: "DELETE" });
    setElements(prev => prev.filter(e => e.id !== id));
  };

  const CATEGORIES = ["קישוטים", "מסגרות", "כוכבים", "פרחים", "אותיות", "אחר"];

  return (
    <motion.div key="elements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      {/* Upload form */}
      <div className="bg-card border border-primary/10 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-primary" /> העלאת אלמנט חדש
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs mb-1 block">שם האלמנט</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="כוכב זהב" className="h-8 text-sm" dir="rtl" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">קטגוריה</Label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 text-foreground"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all hover:bg-primary/5"
        >
          <Upload className="w-6 h-6 text-primary/50" />
          <p className="text-xs text-muted-foreground">גרור או לחץ להעלאת SVG / PNG / JPG</p>
          {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
        <input
          ref={fileRef} type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }}
        />
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {/* Elements grid */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : elements.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 text-sm">אין אלמנטים עדיין</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {elements.map(el => (
            <div key={el.id} className={`bg-card border rounded-xl p-3 flex flex-col gap-2 transition-all ${el.isActive ? "border-primary/20" : "border-primary/5 opacity-50"}`}>
              <div className="aspect-square bg-background/60 rounded-lg flex items-center justify-center p-3 border border-primary/10">
                <img src={el.fileContent} alt={el.name} className="w-full h-full object-contain" />
              </div>
              <p className="text-xs font-medium text-foreground truncate text-center">{el.name}</p>
              <p className="text-[10px] text-muted-foreground text-center">{el.category}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleActive(el)}
                  className={`flex-1 text-[10px] py-1 rounded-md font-medium transition-colors ${el.isActive ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
                >
                  {el.isActive ? "פעיל" : "לא פעיל"}
                </button>
                <button
                  onClick={() => deleteEl(el.id)}
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
type Tab = "orders" | "templates" | "elements" | "stats";

export default function Admin() {
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem("hadar_admin_token"));
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [templates, setTemplates] = useState<DBTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<DBTemplate> | null | "new">(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  async function login() {
    if (!pw.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) { setPwError("סיסמה שגויה"); return; }
      const { token: t } = await res.json();
      setToken(t);
      sessionStorage.setItem("hadar_admin_token", t);
    } catch {
      setPwError("שגיאת חיבור");
    }
  }

  function logout() {
    setToken(null);
    sessionStorage.removeItem("hadar_admin_token");
  }

  async function loadData(t: string) {
    setLoading(true);
    try {
      const [ord, st, tmpl] = await Promise.all([
        adminFetch("/hadar/admin/orders", t),
        adminFetch("/hadar/admin/stats", t),
        adminFetch("/hadar/admin/templates", t),
      ]);
      setOrders(ord);
      setStats(st);
      setTemplates(tmpl);
    } catch (err: any) {
      if (err.message.startsWith("401")) { logout(); }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadData(token);
  }, [token]);

  async function updateOrderStatus(id: number, status: string) {
    if (!token) return;
    await adminFetch(`/hadar/admin/orders/${id}/status`, token, {
      method: "PUT", body: JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  async function deleteTemplate(id: number) {
    if (!token || !confirm("למחוק את התבנית?")) return;
    await adminFetch(`/hadar/admin/templates/${id}`, token, { method: "DELETE" });
    setTemplates(prev => prev.filter(t => t.id !== id));
  }

  async function toggleActive(id: number, current: boolean) {
    if (!token) return;
    const updated = await adminFetch(`/hadar/admin/templates/${id}`, token, {
      method: "PATCH", body: JSON.stringify({ isActive: !current }),
    });
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: updated.isActive } : t));
  }

  async function seedTemplates() {
    if (!token) return;
    setSeeding(true);
    setSeedMsg(null);
    try {
      const result = await adminFetch("/hadar/admin/seed", token, { method: "POST" });
      if (result.message === "already_seeded") {
        setSeedMsg(`כבר קיימות ${result.count} תבניות — ריבוי ייבוא אינו נחוץ`);
      } else {
        setSeedMsg(`יובאו ${result.seeded} תבניות ברירת מחדל בהצלחה!`);
        await loadData(token);
      }
    } catch (err: any) {
      setSeedMsg(`שגיאה: ${err.message}`);
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(null), 5000);
    }
  }

  // ── Login screen ──
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-primary/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={hadarLogo} alt="הדר" style={{ height: 64, width: "auto", objectFit: "contain" }} />
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Lock className="w-4 h-4" />
              <span>כניסה לממשק ניהול</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>סיסמת אדמין</Label>
              <Input
                type="password"
                dir="ltr"
                value={pw}
                onChange={e => { setPw(e.target.value); setPwError(""); }}
                onKeyDown={e => e.key === "Enter" && login()}
                className={`h-11 bg-background border ${pwError ? "border-red-500" : "border-primary/20"}`}
                placeholder="הכניסו סיסמה"
              />
              {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
            </div>
            <Button onClick={login} className="w-full h-11 bg-primary text-primary-foreground font-bold">כניסה</Button>
            <Link href="/"><p className="text-center text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">חזרה לאתר</p></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Template editor overlay ──
  if (editingTemplate !== null) {
    return (
      <TemplateEditor
        initial={editingTemplate === "new" ? null : editingTemplate}
        token={token}
        onSave={saved => {
          setTemplates(prev => {
            const idx = prev.findIndex(t => t.id === saved.id);
            return idx >= 0 ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev];
          });
          setEditingTemplate(null);
        }}
        onClose={() => setEditingTemplate(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">
      {/* Header */}
      <header className="border-b border-primary/10 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={hadarLogo} alt="הדר" style={{ height: 32, width: "auto", objectFit: "contain" }} />
            <span className="text-muted-foreground text-sm border-r border-primary/20 pr-3 mr-1">ממשק ניהול</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => token && loadData(token)} disabled={loading} className="gap-2 text-muted-foreground">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> רענן
            </Button>
            <Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><Eye className="w-4 h-4" /> צפה באתר</Button></Link>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-destructive"><LogOut className="w-4 h-4" /> יציאה</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "הזמנות סה״כ", value: stats.totalOrders, icon: ShoppingBag, color: "text-primary" },
              { label: "ששולמו", value: stats.paidOrders, icon: Check, color: "text-green-400" },
              { label: "ממתינות", value: stats.pendingOrders, icon: Clock, color: "text-amber-400" },
              { label: "הכנסות (₪)", value: `${(stats.totalRevenue / 100).toLocaleString("he")}`, icon: DollarSign, color: "text-primary" },
              { label: "עיצובים", value: stats.totalDesigns, icon: Package, color: "text-blue-400" },
            ].map(s => (
              <div key={s.label} className="bg-card border border-primary/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-xs">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-primary/10 overflow-x-auto">
          {([["orders", "הזמנות"], ["templates", "תבניות"], ["elements", "אלמנטים"], ["stats", "סטטיסטיקות"]] as [Tab, string][]).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Orders ── */}
          {tab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card border border-primary/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                  <h2 className="font-semibold">הזמנות ({orders.length})</h2>
                </div>
                {orders.length === 0 && !loading && (
                  <p className="text-muted-foreground text-center py-12 text-sm">אין הזמנות עדיין</p>
                )}
                <div className="divide-y divide-primary/5">
                  {orders.map(order => {
                    const statusInfo = ORDER_STATUS_LABELS[order.status] ?? { label: order.status, cls: "text-muted-foreground bg-muted/10 border-muted/30" };
                    const fieldVals = order.fieldValues ?? {};
                    const primaryName = fieldVals["groom_name"] || fieldVals["boy_name"] || fieldVals["host_name"] || "";
                    return (
                      <div key={order.id} className="p-4 hover:bg-primary/5 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{order.designName || `הזמנה #${order.id}`}</span>
                              {primaryName && <span className="text-xs text-muted-foreground">— {primaryName}</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span>תבנית: {order.templateId}</span>
                              <span>·</span>
                              <span>{new Date(order.createdAt).toLocaleDateString("he-IL")}</span>
                              {order.amount && <><span>·</span><span className="text-primary font-medium">₪{order.amount / 100}</span></>}
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">משתמש: {order.clerkUserId}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusInfo.cls}`}>{statusInfo.label}</span>
                            <select
                              value={order.status}
                              onChange={e => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs bg-background border border-primary/20 rounded-lg px-2 py-1.5 text-foreground cursor-pointer"
                            >
                              <option value="pending">ממתין לתשלום</option>
                              <option value="paid">שולם</option>
                              <option value="completed">הושלם</option>
                              <option value="cancelled">בוטל</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Templates ── */}
          {tab === "templates" && (
            <motion.div key="templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">{templates.length} תבניות בגלריה</span>
                  {seedMsg && (
                    <span className={`text-xs px-3 py-1 rounded-full border ${seedMsg.startsWith("שגיאה") ? "text-red-400 border-red-400/30 bg-red-400/10" : "text-green-400 border-green-400/30 bg-green-400/10"}`}>
                      {seedMsg}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {templates.length === 0 && (
                    <Button size="sm" variant="outline" onClick={seedTemplates} disabled={seeding}
                      className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                      {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      ייבא 12 תבניות ברירת מחדל
                    </Button>
                  )}
                  {templates.length > 0 && (
                    <Button size="sm" variant="outline" onClick={seedTemplates} disabled={seeding}
                      className="gap-1.5 border-muted text-muted-foreground hover:text-foreground text-xs">
                      {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      בדוק ייבוא
                    </Button>
                  )}
                  <Button size="sm" className="bg-primary text-primary-foreground gap-2" onClick={() => setEditingTemplate("new")}>
                    <Plus className="w-4 h-4" /> תבנית חדשה
                  </Button>
                </div>
              </div>

              {/* Empty state */}
              {templates.length === 0 && !loading && (
                <div className="bg-card border border-dashed border-primary/20 rounded-xl p-16 text-center">
                  <Package className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">אין תבניות עדיין</p>
                  <p className="text-xs text-muted-foreground/60 mb-6">לחץ "ייבא 12 תבניות ברירת מחדל" כדי להתחיל, או צור תבנית חדשה ידנית</p>
                </div>
              )}

              {/* Gallery grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {templates.map(tmpl => {
                  const isGrad = !tmpl.imageUrl || /gradient|linear|radial/i.test(tmpl.imageUrl);
                  return (
                    <div key={tmpl.id} className="bg-card border border-primary/10 rounded-xl overflow-hidden hover:border-primary/30 transition-colors group">

                      {/* Thumbnail */}
                      <div className="relative h-40 bg-secondary/30 overflow-hidden">
                        {tmpl.imageUrl
                          ? isGrad
                            ? <div className="w-full h-full" style={{ background: tmpl.imageUrl }} />
                            : <img src={tmpl.imageUrl} alt={tmpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #0B1833, #1a2d54)" }}>
                              <Package className="w-8 h-8 text-primary/40" />
                              <span className="text-[10px] text-primary/30">ללא תמונה</span>
                            </div>
                          )
                        }
                        {/* Active toggle overlay */}
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => toggleActive(tmpl.id, tmpl.isActive)}
                            className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-all ${
                              tmpl.isActive
                                ? "bg-green-400/20 text-green-400 border-green-400/40 hover:bg-red-400/20 hover:text-red-400 hover:border-red-400/40"
                                : "bg-red-400/20 text-red-400 border-red-400/40 hover:bg-green-400/20 hover:text-green-400 hover:border-green-400/40"
                            }`}
                          >
                            {tmpl.isActive ? "פעיל ✓" : "כבוי"}
                          </button>
                        </div>
                        {/* Edit button overlay */}
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 bg-background/80 backdrop-blur-sm" onClick={() => setEditingTemplate(tmpl)}>
                            <Edit2 className="w-3 h-3" /> ערוך
                          </Button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{tmpl.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{tmpl.subtitle}</p>
                          </div>
                          {token && <PriceCell tmpl={tmpl} token={token} onUpdate={(id, price) => setTemplates(prev => prev.map(t => t.id === id ? { ...t, price } : t))} />}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary/5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{tmpl.category}</span>
                            <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">{tmpl.style}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground/50">{tmpl.slots.length} שדות</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10" onClick={() => deleteTemplate(tmpl.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Elements ── */}
          {tab === "elements" && token && <ElementsManager token={token} />}

          {/* ── Stats ── */}
          {tab === "stats" && stats && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-primary/10 rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> סיכום הזמנות</h3>
                  {[
                    { label: "הזמנות סה״כ", value: stats.totalOrders },
                    { label: "ששולמו", value: stats.paidOrders },
                    { label: "ממתינות לתשלום", value: stats.pendingOrders },
                    { label: "עיצובים שנשמרו", value: stats.totalDesigns },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm border-b border-primary/5 py-2">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-primary/10 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">הכנסות</h3>
                  <p className="text-4xl font-bold text-primary mb-1">₪{(stats.totalRevenue / 100).toLocaleString("he")}</p>
                  <p className="text-sm text-muted-foreground mb-6">סה״כ הכנסות ממוזמנות ששולמו</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ממוצע לעסקה</span>
                    <span className="font-semibold">
                      {stats.paidOrders > 0 ? `₪${Math.round(stats.totalRevenue / stats.paidOrders / 100)}` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
