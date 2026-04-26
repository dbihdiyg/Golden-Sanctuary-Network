import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import hadarLogo from "@/assets/logo-hadar.png";
import { HEBREW_FONTS, loadGoogleFont, useCombinedFonts } from "@/lib/fonts";
import {
  Lock, Plus, Trash2, Edit2, Eye, Package, ShoppingBag,
  BarChart3, LogOut, Check, X, ImagePlus, GripVertical,
  RefreshCw, ArrowRight, ChevronDown, ChevronUp, Loader2,
  AlertCircle, Users, DollarSign, Clock, ToggleLeft, ToggleRight, Upload,
  AlignCenter, AlignRight, AlignLeft, Type, Palette, Sliders, Layers, Move,
  Maximize2, FileType2,
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

// ─── Dimension presets ────────────────────────────────────────────────────────
const DIMENSION_PRESETS = [
  { label: "A4",     width: 794,  height: 1123, unit: "px" },
  { label: "A5",     width: 559,  height: 794,  unit: "px" },
  { label: "Story",  width: 1080, height: 1920, unit: "px" },
  { label: "Post",   width: 1080, height: 1080, unit: "px" },
  { label: "Banner", width: 1200, height: 628,  unit: "px" },
  { label: "Custom", width: 800,  height: 1100, unit: "px" },
];

interface Dimensions {
  preset: string;
  width: number;
  height: number;
  unit: "px" | "cm";
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
  height?: number;
  zIndex?: number;
  fontSizePx: number;
  fontFamily: string;
  bold: boolean;
  italic?: boolean;
  color: string;
  opacity?: number;
  textShadow?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  align: "center" | "right" | "left";
  multiline: boolean;
  fixed?: boolean;
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
  galleryImageUrl: string | null;
  displayImageUrl: string | null;
  dimensions: Dimensions | null;
  slots: AdminSlot[];
  isActive: boolean;
  createdAt: string;
}

const emptySlot = (): AdminSlot => ({
  id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  label: "שדה חדש",
  placeholder: "",
  defaultValue: "טקסט לדוגמה",
  x: 10, y: 10, width: 80,
  fontSizePx: 18, fontFamily: "Frank Ruhl Libre",
  bold: false, italic: false,
  color: "#D6A84F", opacity: 1,
  textShadow: false, letterSpacing: 0, lineHeight: 1.35,
  align: "center", multiline: false, fixed: false,
});

const ORDER_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: "ממתין לתשלום", cls: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  paid:      { label: "שולם",         cls: "text-green-400 bg-green-400/10 border-green-400/30" },
  completed: { label: "הושלם",        cls: "text-blue-400  bg-blue-400/10  border-blue-400/30"  },
  cancelled: { label: "בוטל",         cls: "text-red-400   bg-red-400/10   border-red-400/30"   },
};

// ─── Image upload button ──────────────────────────────────────────────────────
function ImageUploadButton({ token, label, value, onChange }: {
  token: string; label: string;
  value: string | null;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API_BASE}/api/hadar/admin/upload`, {
        method: "POST", headers: { "x-admin-secret": token }, body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      onChange(url);
    } catch (err: any) {
      setError(err.message);
    } finally { setUploading(false); }
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5 font-semibold">{label}</p>
      {value && !/gradient|linear|radial/i.test(value) && (
        <div className="mb-1.5 relative rounded-lg overflow-hidden h-20 bg-secondary/30">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange("")}
            className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <label className="cursor-pointer block">
        <div className="border border-dashed border-primary/30 rounded-lg p-2 text-center text-xs text-muted-foreground hover:border-primary/60 transition-colors flex items-center justify-center gap-2">
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
          {uploading ? "מעלה..." : value ? "החלף" : "העלה תמונה"}
        </div>
        <input type="file" className="hidden" accept="image/*" onChange={handleFile} disabled={uploading} />
      </label>
      {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ─── Dimensions picker ────────────────────────────────────────────────────────
function DimensionsPicker({ value, onChange }: {
  value: Dimensions | null;
  onChange: (d: Dimensions) => void;
}) {
  const dim = value || { preset: "Custom", width: 800, height: 1100, unit: "px" as const };

  function selectPreset(p: typeof DIMENSION_PRESETS[0]) {
    onChange({ preset: p.label, width: p.width, height: p.height, unit: "px" });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1"><Maximize2 className="w-3 h-3" /> מידות תבנית</p>
      <div className="flex flex-wrap gap-1.5">
        {DIMENSION_PRESETS.map(p => (
          <button key={p.label}
            onClick={() => selectPreset(p)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${dim.preset === p.label ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] text-muted-foreground">רוחב (px)</Label>
          <Input type="number" dir="ltr" min={100} max={5000}
            className="mt-0.5 h-7 text-xs bg-background border-primary/20"
            value={dim.width}
            onChange={e => onChange({ ...dim, preset: "Custom", width: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground">גובה (px)</Label>
          <Input type="number" dir="ltr" min={100} max={5000}
            className="mt-0.5 h-7 text-xs bg-background border-primary/20"
            value={dim.height}
            onChange={e => onChange({ ...dim, preset: "Custom", height: Number(e.target.value) })}
          />
        </div>
      </div>
      {dim.width > 0 && dim.height > 0 && (
        <p className="text-[10px] text-muted-foreground/60 text-center">
          {dim.width}×{dim.height}px — {Math.round((dim.width / dim.height) * 100) / 100}:1
        </p>
      )}
    </div>
  );
}

// ─── Visual Template Editor ───────────────────────────────────────────────────
function TemplateEditor({
  initial, token, onSave, onClose,
}: {
  initial: Partial<DBTemplate> | null;
  token: string;
  onSave: (t: DBTemplate) => void;
  onClose: () => void;
}) {
  const combinedFonts = useCombinedFonts();

  const [form, setForm] = useState<Omit<DBTemplate, "id" | "createdAt">>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    subtitle: initial?.subtitle ?? "",
    category: initial?.category ?? "",
    style: initial?.style ?? "",
    price: initial?.price ?? 4900,
    imageUrl: initial?.imageUrl ?? null,
    galleryImageUrl: initial?.galleryImageUrl ?? null,
    displayImageUrl: initial?.displayImageUrl ?? null,
    dimensions: initial?.dimensions ?? { preset: "Custom", width: 800, height: 1100, unit: "px" },
    slots: (initial?.slots as AdminSlot[]) ?? [],
    isActive: initial?.isActive ?? true,
  });

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; sx: number; sy: number; sl: number; st: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedSlot = form.slots.find(s => s.id === selectedSlotId) ?? null;
  const updateSlot = useCallback((id: string, patch: Partial<AdminSlot>) =>
    setForm(p => ({ ...p, slots: p.slots.map(s => s.id === id ? { ...s, ...patch } : s) })), []);

  useEffect(() => {
    form.slots.forEach(s => { if (s.fontFamily) loadGoogleFont(s.fontFamily); });
  }, [form.slots]);

  const canvasBg = form.displayImageUrl || form.imageUrl;

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
    setSaving(true); setError(null);
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
          {canvasBg && <span className="text-xs text-muted-foreground">לחץ על התמונה להוספת שדה | גרור שדה לשינוי מיקום</span>}
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
          {canvasBg ? (
            <div ref={canvasRef} className="relative select-none"
              style={{ cursor: "crosshair", maxWidth: 640 }}
              onClick={handleCanvasClick}
              onPointerMove={onPointerMove}
              onPointerUp={() => setDragging(null)}
              onPointerLeave={() => setDragging(null)}
            >
              {/gradient|linear|radial/i.test(canvasBg)
                ? <div className="w-full rounded-lg" style={{ background: canvasBg, minHeight: 400, height: 640 }} />
                : <img src={canvasBg} alt="תמונת תבנית" className="block w-full" style={{ maxHeight: "75vh", objectFit: "contain" }} draggable={false} />
              }
              {form.slots.map(slot => {
                const isSelected = selectedSlotId === slot.id;
                const fontFamily = slot.fontFamily && slot.fontFamily !== "serif" && slot.fontFamily !== "sans"
                  ? `'${slot.fontFamily}', serif`
                  : slot.fontFamily === "sans" ? "sans-serif" : "serif";
                return (
                  <div key={slot.id} data-slot={slot.id}
                    onPointerDown={e => onSlotPointerDown(e, slot.id)}
                    onClick={e => { e.stopPropagation(); setSelectedSlotId(slot.id); }}
                    style={{
                      position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, width: `${slot.width}%`,
                      outline: isSelected ? "2px solid #D6A84F" : "1.5px dashed rgba(214,168,79,0.5)",
                      background: isSelected ? "rgba(214,168,79,0.1)" : "transparent",
                      cursor: "move", padding: "2px 4px", borderRadius: 3, minHeight: 18,
                      touchAction: "none", opacity: slot.opacity ?? 1, zIndex: slot.zIndex ?? undefined,
                      textAlign: slot.align ?? "center", direction: "rtl",
                    }}
                  >
                    <span style={{
                      fontSize: slot.fontSizePx ?? 14, fontFamily,
                      fontWeight: slot.bold ? 700 : 400, fontStyle: slot.italic ? "italic" : "normal",
                      color: slot.color || "#D6A84F",
                      letterSpacing: slot.letterSpacing ? `${slot.letterSpacing}px` : undefined,
                      lineHeight: slot.lineHeight ?? 1.35,
                      textShadow: slot.textShadow ? "1px 1px 4px rgba(0,0,0,0.7)" : undefined,
                      userSelect: "none", display: "block", whiteSpace: "pre-line", pointerEvents: "none",
                    }}>
                      {slot.defaultValue || slot.label}
                    </span>
                    {isSelected && (
                      <span style={{ position: "absolute", top: -18, right: 0, fontSize: 9, color: "#D6A84F", background: "rgba(0,0,0,0.7)", padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap", pointerEvents: "none" }}>
                        {slot.label}{slot.fixed ? " 🔒" : ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="text-center text-primary/40 text-sm">העלה תמונת תצוגה כדי להתחיל לערוך שדות</div>
              <div className="w-64 h-64 border-2 border-dashed border-primary/20 rounded-2xl flex items-center justify-center">
                <ImagePlus className="w-12 h-12 text-primary/20" />
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="w-80 border-r border-primary/10 bg-card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto divide-y divide-primary/10">

            {/* ── Images section ── */}
            <section className="p-4 space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <ImagePlus className="w-3 h-3" /> תמונות
              </p>
              <ImageUploadButton token={token} label="תמונת עורך (רקע לשדות)" value={form.displayImageUrl || form.imageUrl}
                onChange={url => setForm(p => ({ ...p, displayImageUrl: url, imageUrl: url || p.imageUrl }))} />
              <ImageUploadButton token={token} label="תמונת גלריה (כרטיסייה בגלריה)" value={form.galleryImageUrl}
                onChange={url => setForm(p => ({ ...p, galleryImageUrl: url }))} />
            </section>

            {/* ── Dimensions ── */}
            <section className="p-4">
              <DimensionsPicker value={form.dimensions} onChange={d => setForm(p => ({ ...p, dimensions: d }))} />
            </section>

            {/* ── Template metadata ── */}
            <section className="p-4 space-y-3">
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
                  <Input dir={dir as any} className="mt-1 h-8 text-sm bg-background border-primary/20"
                    value={(form as any)[key] ?? ""}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <Label className="text-xs text-muted-foreground">מחיר (אגורות, ₪49 = 4900)</Label>
                <Input type="number" dir="ltr" className="mt-1 h-8 text-sm bg-background border-primary/20"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex-1">תבנית פעילה</Label>
                <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
                  {form.isActive ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                </button>
              </div>
            </section>

            {/* ── Slots management ── */}
            <section className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">שדות טקסט ({form.slots.length})</p>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                  onClick={() => { const slot = emptySlot(); setForm(p => ({ ...p, slots: [...p.slots, slot] })); setSelectedSlotId(slot.id); }}>
                  <Plus className="w-3 h-3" /> הוסף שדה
                </Button>
              </div>
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {form.slots.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    {canvasBg ? "לחץ על התמונה להוספת שדה" : "העלה תמונה קודם"}
                  </p>
                )}
                {form.slots.map(slot => (
                  <div key={slot.id} onClick={() => setSelectedSlotId(slot.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors ${selectedSlotId === slot.id ? "bg-primary/10 text-primary" : "hover:bg-primary/5 text-foreground"}`}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 truncate">{slot.label}{slot.fixed ? " 🔒" : ""}</span>
                    <button onClick={e => {
                      e.stopPropagation();
                      setForm(p => ({ ...p, slots: p.slots.filter(s => s.id !== slot.id) }));
                      if (selectedSlotId === slot.id) setSelectedSlotId(null);
                    }} className="text-destructive/60 hover:text-destructive p-0.5 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Selected slot properties ── */}
            {selectedSlot && (
              <section className="p-4 space-y-5" dir="rtl">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-primary" />
                  עריכת שדה: <span className="text-primary">{selectedSlot.label}</span>
                </p>

                {/* Content */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Type className="w-3 h-3" /> תוכן</p>
                  {[
                    { key: "label", label: "תווית (לניהול)" },
                    { key: "placeholder", label: "טקסט עזר ללקוח" },
                    { key: "defaultValue", label: "ערך ברירת מחדל" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label className="text-[10px] text-muted-foreground">{label}</Label>
                      <Input className="mt-0.5 h-7 text-xs bg-background border-primary/20"
                        value={(selectedSlot as any)[key] ?? ""}
                        onChange={e => updateSlot(selectedSlot.id, { [key]: e.target.value })} />
                    </div>
                  ))}
                </div>

                <hr className="border-primary/10" />

                {/* Typography */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Type className="w-3 h-3" /> טיפוגרפיה</p>

                  <div>
                    <Label className="text-[10px] text-muted-foreground">פונט</Label>
                    <select className="mt-0.5 w-full h-8 px-2 bg-background border border-primary/20 rounded-md text-sm text-foreground"
                      value={selectedSlot.fontFamily}
                      onChange={e => { loadGoogleFont(e.target.value); updateSlot(selectedSlot.id, { fontFamily: e.target.value }); }}>
                      {combinedFonts.filter(f => f.category === "custom").length > 0 && (
                        <optgroup label="── פונטים מותאמים ──">
                          {combinedFonts.filter(f => f.category === "custom").map(f => (
                            <option key={f.family} value={f.family}>{f.name}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="── סריף ──">
                        {combinedFonts.filter(f => f.category === "serif").map(f => (
                          <option key={f.family} value={f.family}>{f.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="── סאנס-סריף ──">
                        {combinedFonts.filter(f => f.category === "sans").map(f => (
                          <option key={f.family} value={f.family}>{f.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="── מיוחד ──">
                        {combinedFonts.filter(f => f.category === "local").map(f => (
                          <option key={f.family} value={f.family}>{f.name}</option>
                        ))}
                      </optgroup>
                    </select>
                    <div className="mt-1.5 px-3 py-1.5 bg-background/60 border border-primary/10 rounded-md text-center text-sm"
                      style={{ fontFamily: `'${selectedSlot.fontFamily}', serif`, direction: "rtl", color: selectedSlot.color || "#D6A84F", fontSize: Math.min(selectedSlot.fontSizePx ?? 18, 22) }}>
                      {selectedSlot.defaultValue || "תצוגה מקדימה של הפונט"}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <Label className="text-[10px] text-muted-foreground">גודל פונט</Label>
                      <span className="text-[10px] font-mono text-primary">{selectedSlot.fontSizePx ?? 18}px</span>
                    </div>
                    <input type="range" min={6} max={120} step={1}
                      value={selectedSlot.fontSizePx ?? 18}
                      onChange={e => updateSlot(selectedSlot.id, { fontSizePx: Number(e.target.value) })}
                      className="w-full accent-primary h-1.5 rounded" />
                  </div>

                  <div className="flex gap-2">
                    {[
                      { key: "bold",       label: "B",  title: "מודגש",    style: { fontWeight: 700 } },
                      { key: "italic",     label: "I",  title: "נטוי",     style: { fontStyle: "italic" } },
                      { key: "textShadow", label: "S",  title: "צל טקסט", style: {} },
                    ].map(({ key, label, title, style }) => (
                      <button key={key} title={title}
                        onClick={() => updateSlot(selectedSlot.id, { [key]: !(selectedSlot as any)[key] })}
                        className={`flex-1 h-8 rounded-md border text-sm transition-all ${(selectedSlot as any)[key] ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground hover:border-primary/40"}`}
                        style={style as any}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-primary/10" />

                {/* Color & Opacity */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Palette className="w-3 h-3" /> צבע ושקיפות</p>
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">צבע טקסט</Label>
                    <div className="flex items-center gap-2">
                      <input type="color"
                        value={selectedSlot.color?.startsWith("#") ? selectedSlot.color : "#D6A84F"}
                        onChange={e => updateSlot(selectedSlot.id, { color: e.target.value })}
                        className="w-9 h-8 rounded border border-primary/20 cursor-pointer bg-transparent p-0.5" />
                      <Input dir="ltr" className="flex-1 h-8 text-xs bg-background border-primary/20 font-mono"
                        value={selectedSlot.color || "#D6A84F"}
                        onChange={e => updateSlot(selectedSlot.id, { color: e.target.value })} />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {["#D6A84F","#F8F1E3","#FFFFFF","#0B1833","#B8860B","#E8D5A3"].map(hex => (
                        <button key={hex} title={hex} onClick={() => updateSlot(selectedSlot.id, { color: hex })}
                          className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedSlot.color === hex ? "border-primary scale-110" : "border-white/20"}`}
                          style={{ background: hex }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <Label className="text-[10px] text-muted-foreground">אטימות</Label>
                      <span className="text-[10px] font-mono text-primary">{Math.round((selectedSlot.opacity ?? 1) * 100)}%</span>
                    </div>
                    <input type="range" min={0} max={1} step={0.01}
                      value={selectedSlot.opacity ?? 1}
                      onChange={e => updateSlot(selectedSlot.id, { opacity: Number(e.target.value) })}
                      className="w-full accent-primary h-1.5 rounded" />
                  </div>
                </div>

                <hr className="border-primary/10" />

                {/* Spacing */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Sliders className="w-3 h-3" /> ריווח</p>
                  {[
                    { key: "letterSpacing", label: "ריווח אותיות", min: -3, max: 20, step: 0.5, unit: "px" },
                    { key: "lineHeight",    label: "גובה שורה",    min: 0.8, max: 3, step: 0.05 },
                  ].map(({ key, label, min, max, step, unit }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-0.5">
                        <Label className="text-[10px] text-muted-foreground">{label}</Label>
                        <span className="text-[10px] font-mono text-primary">{((selectedSlot as any)[key] ?? (key === "lineHeight" ? 1.35 : 0)).toFixed(key === "lineHeight" ? 2 : 1)}{unit ?? ""}</span>
                      </div>
                      <input type="range" min={min} max={max} step={step}
                        value={(selectedSlot as any)[key] ?? (key === "lineHeight" ? 1.35 : 0)}
                        onChange={e => updateSlot(selectedSlot.id, { [key]: Number(e.target.value) })}
                        className="w-full accent-primary h-1.5 rounded" />
                    </div>
                  ))}
                </div>

                <hr className="border-primary/10" />

                {/* Layout */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Move className="w-3 h-3" /> פריסה</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: "x",      label: "X%",   min: 0,  max: 100 },
                      { key: "y",      label: "Y%",   min: 0,  max: 100 },
                      { key: "width",  label: "רוחב%", min: 1, max: 100 },
                      { key: "zIndex", label: "שכבה", min: 0,  max: 99  },
                    ].map(({ key, label, min, max }) => (
                      <div key={key}>
                        <Label className="text-[9px] text-muted-foreground">{label}</Label>
                        <Input type="number" dir="ltr" min={min} max={max}
                          className="mt-0.5 h-7 text-xs bg-background border-primary/20 px-1.5"
                          value={Math.round((selectedSlot as any)[key] ?? 0)}
                          onChange={e => updateSlot(selectedSlot.id, { [key]: Number(e.target.value) })} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">יישור</Label>
                    <div className="flex gap-1">
                      {[
                        { v: "right",  Icon: AlignRight,  title: "ימין" },
                        { v: "center", Icon: AlignCenter, title: "מרכז" },
                        { v: "left",   Icon: AlignLeft,   title: "שמאל" },
                      ].map(({ v, Icon, title }) => (
                        <button key={v} title={title}
                          onClick={() => updateSlot(selectedSlot.id, { align: v as any })}
                          className={`flex-1 h-8 flex items-center justify-center rounded-md border transition-all ${selectedSlot.align === v ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground hover:border-primary/40"}`}>
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <hr className="border-primary/10" />

                {/* Behavior */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Layers className="w-3 h-3" /> התנהגות</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "multiline", label: "מספר שורות", desc: "ללקוח" },
                      { key: "fixed",     label: "🔒 קבוע",    desc: "לקוח לא יכול לערוך" },
                    ].map(({ key, label, desc }) => (
                      <label key={key} className={`flex flex-col gap-0.5 p-2 rounded-lg border cursor-pointer transition-all ${(selectedSlot as any)[key] ? "border-primary/50 bg-primary/10" : "border-primary/10 hover:border-primary/30"}`}>
                        <div className="flex items-center gap-1.5">
                          <input type="checkbox" checked={(selectedSlot as any)[key] ?? false}
                            onChange={e => updateSlot(selectedSlot.id, { [key]: e.target.checked })}
                            className="accent-primary" />
                          <span className="text-xs font-medium text-foreground">{label}</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground mr-4">{desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="ghost" size="sm"
                  className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 gap-1 h-8"
                  onClick={() => { setForm(p => ({ ...p, slots: p.slots.filter(s => s.id !== selectedSlot.id) })); setSelectedSlotId(null); }}>
                  <Trash2 className="w-3.5 h-3.5" /> מחק שדה זה
                </Button>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Price cell ───────────────────────────────────────────────────────────────
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
      <input type="number" value={val} onChange={e => setVal(e.target.value)} autoFocus
        onBlur={save}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setEditing(false); setVal(String(Math.round(tmpl.price / 100))); } }}
        className="w-20 bg-background border border-primary/40 rounded px-2 py-1 text-sm text-foreground outline-none" />
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

// ─── Elements manager ─────────────────────────────────────────────────────────
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
    try { const d = await adminFetch("/hadar/admin/elements", token); setElements(d); }
    catch { setError("שגיאה בטעינה"); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    if (!name.trim()) { setError("הכניסו שם לאלמנט"); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("name", name); fd.append("category", category);
      const res = await fetch(`${API_BASE}/api/hadar/admin/elements`, { method: "POST", headers: { "x-admin-secret": token }, body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "שגיאה");
      setElements(prev => [d, ...prev]); setName(""); setError(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) { setError(e.message); } finally { setUploading(false); }
  };

  const toggleActive = async (el: LibEl) => {
    const updated = await adminFetch(`/hadar/admin/elements/${el.id}`, token, { method: "PATCH", body: JSON.stringify({ isActive: !el.isActive }) });
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
      <div className="bg-card border border-primary/10 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><ImagePlus className="w-4 h-4 text-primary" /> העלאת אלמנט חדש</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs mb-1 block">שם האלמנט</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="כוכב זהב" className="h-8 text-sm" dir="rtl" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">קטגוריה</Label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full h-8 text-sm rounded-md border border-input bg-background px-2 text-foreground">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all hover:bg-primary/5">
          <Upload className="w-6 h-6 text-primary/50" />
          <p className="text-xs text-muted-foreground">גרור או לחץ להעלאת SVG / PNG / JPG</p>
          {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
        <input ref={fileRef} type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
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
                <button onClick={() => toggleActive(el)}
                  className={`flex-1 text-[10px] py-1 rounded-md font-medium transition-colors ${el.isActive ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                  {el.isActive ? "פעיל" : "לא פעיל"}
                </button>
                <button onClick={() => deleteEl(el.id)}
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
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

// ─── Fonts manager ────────────────────────────────────────────────────────────
interface AdminFont { id: number; name: string; displayName: string; fileUrl: string; mimeType: string; isActive: boolean; }

function FontsManager({ token }: { token: string }) {
  const [fonts, setFonts] = useState<AdminFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { const d = await adminFetch("/hadar/admin/fonts", token); setFonts(d); }
    catch { setError("שגיאה בטעינה"); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const upload = async (file: File) => {
    if (!name.trim() || !displayName.trim()) { setError("מלאו שם ושם תצוגה"); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("font", file); fd.append("name", name); fd.append("displayName", displayName);
      const res = await fetch(`${API_BASE}/api/hadar/admin/upload-font`, { method: "POST", headers: { "x-admin-secret": token }, body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "שגיאה");
      setFonts(prev => [d, ...prev]); setName(""); setDisplayName(""); setError(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) { setError(e.message); } finally { setUploading(false); }
  };

  const toggleActive = async (f: AdminFont) => {
    const updated = await adminFetch(`/hadar/admin/fonts/${f.id}`, token, { method: "PATCH", body: JSON.stringify({ isActive: !f.isActive }) });
    setFonts(prev => prev.map(x => x.id === f.id ? updated : x));
  };

  const saveDisplayName = async (f: AdminFont) => {
    if (!editName.trim()) return;
    const updated = await adminFetch(`/hadar/admin/fonts/${f.id}`, token, { method: "PATCH", body: JSON.stringify({ displayName: editName }) });
    setFonts(prev => prev.map(x => x.id === f.id ? updated : x));
    setEditId(null);
  };

  const deleteFont = async (id: number) => {
    if (!confirm("למחוק?")) return;
    await adminFetch(`/hadar/admin/fonts/${id}`, token, { method: "DELETE" });
    setFonts(prev => prev.filter(x => x.id !== id));
  };

  return (
    <motion.div key="fonts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="bg-card border border-primary/10 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><FileType2 className="w-4 h-4 text-primary" /> העלאת פונט חדש</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs mb-1 block">שם פנימי (ללא רווחים, לאנגלית)</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="MyHebrewFont" dir="ltr" className="h-8 text-sm font-mono" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">שם תצוגה (עברי)</Label>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="פונט ייחודי" dir="rtl" className="h-8 text-sm" />
          </div>
        </div>
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all hover:bg-primary/5">
          <Upload className="w-6 h-6 text-primary/50" />
          <p className="text-xs text-muted-foreground">גרור או לחץ להעלאת קובץ פונט (TTF / OTF / WOFF / WOFF2)</p>
          {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
        <input ref={fileRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : fonts.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 text-sm">אין פונטים מותאמים עדיין</p>
      ) : (
        <div className="space-y-3">
          {fonts.map(f => (
            <div key={f.id} className={`bg-card border rounded-xl p-4 transition-all ${f.isActive ? "border-primary/20" : "border-primary/5 opacity-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {editId === f.id ? (
                    <div className="flex items-center gap-2">
                      <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-7 text-sm" dir="rtl"
                        onKeyDown={e => { if (e.key === "Enter") saveDisplayName(f); if (e.key === "Escape") setEditId(null); }} />
                      <button onClick={() => saveDisplayName(f)} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditId(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{f.displayName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{f.name}</span>
                      <button onClick={() => { setEditId(f.id); setEditName(f.displayName); }} className="text-muted-foreground/50 hover:text-primary">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">{f.mimeType}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(f)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${f.isActive ? "bg-green-500/10 text-green-400 border-green-400/30" : "bg-secondary text-muted-foreground border-primary/10"}`}>
                    {f.isActive ? "פעיל" : "כבוי"}
                  </button>
                  <button onClick={() => deleteFont(f.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
type Tab = "orders" | "templates" | "elements" | "fonts" | "stats";

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
      const res = await fetch(`${API_BASE}/api/hadar/admin/auth`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (!res.ok) { setPwError("סיסמה שגויה"); return; }
      const { token: t } = await res.json();
      setToken(t); sessionStorage.setItem("hadar_admin_token", t);
    } catch { setPwError("שגיאת חיבור"); }
  }

  function logout() { setToken(null); sessionStorage.removeItem("hadar_admin_token"); }

  async function loadData(t: string) {
    setLoading(true);
    try {
      const [ord, st, tmpl] = await Promise.all([
        adminFetch("/hadar/admin/orders", t),
        adminFetch("/hadar/admin/stats", t),
        adminFetch("/hadar/admin/templates", t),
      ]);
      setOrders(ord); setStats(st); setTemplates(tmpl);
    } catch (err: any) {
      if (err.message.startsWith("401")) { logout(); }
    } finally { setLoading(false); }
  }

  useEffect(() => { if (token) loadData(token); }, [token]);

  async function updateOrderStatus(id: number, status: string) {
    if (!token) return;
    await adminFetch(`/hadar/admin/orders/${id}/status`, token, { method: "PUT", body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  async function deleteTemplate(id: number) {
    if (!token || !confirm("למחוק את התבנית?")) return;
    await adminFetch(`/hadar/admin/templates/${id}`, token, { method: "DELETE" });
    setTemplates(prev => prev.filter(t => t.id !== id));
  }

  async function toggleActive(id: number, current: boolean) {
    if (!token) return;
    const updated = await adminFetch(`/hadar/admin/templates/${id}`, token, { method: "PATCH", body: JSON.stringify({ isActive: !current }) });
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: updated.isActive } : t));
  }

  async function seedTemplates() {
    if (!token) return;
    setSeeding(true); setSeedMsg(null);
    try {
      const result = await adminFetch("/hadar/admin/seed", token, { method: "POST" });
      if (result.message === "already_seeded") {
        setSeedMsg(`כבר קיימות ${result.count} תבניות`);
      } else {
        setSeedMsg(`יובאו ${result.seeded} תבניות בהצלחה!`);
        await loadData(token);
      }
    } catch (err: any) {
      setSeedMsg(`שגיאה: ${err.message}`);
    } finally { setSeeding(false); setTimeout(() => setSeedMsg(null), 5000); }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-primary/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={hadarLogo} alt="הדר" style={{ height: 64, width: "auto", objectFit: "contain" }} />
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Lock className="w-4 h-4" /><span>כניסה לממשק ניהול</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>סיסמת אדמין</Label>
              <Input type="password" dir="ltr" value={pw}
                onChange={e => { setPw(e.target.value); setPwError(""); }}
                onKeyDown={e => e.key === "Enter" && login()}
                className={`h-11 bg-background border ${pwError ? "border-red-500" : "border-primary/20"}`}
                placeholder="הכניסו סיסמה" />
              {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
            </div>
            <Button onClick={login} className="w-full h-11 bg-primary text-primary-foreground font-bold">כניסה</Button>
            <Link href="/"><p className="text-center text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">חזרה לאתר</p></Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "הזמנות סה״כ", value: stats.totalOrders,  icon: ShoppingBag, color: "text-primary" },
              { label: "ששולמו",       value: stats.paidOrders,   icon: Check,       color: "text-green-400" },
              { label: "ממתינות",      value: stats.pendingOrders, icon: Clock,       color: "text-amber-400" },
              { label: "הכנסות (₪)",  value: `${(stats.totalRevenue / 100).toLocaleString("he")}`, icon: DollarSign, color: "text-primary" },
              { label: "עיצובים",      value: stats.totalDesigns, icon: Package,     color: "text-blue-400" },
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

        <div className="flex gap-0 mb-6 border-b border-primary/10 overflow-x-auto">
          {([["orders","הזמנות"],["templates","תבניות"],["elements","אלמנטים"],["fonts","פונטים"],["stats","סטטיסטיקות"]] as [Tab,string][]).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card border border-primary/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-primary/10">
                  <h2 className="font-semibold">הזמנות ({orders.length})</h2>
                </div>
                {orders.length === 0 && !loading && <p className="text-muted-foreground text-center py-12 text-sm">אין הזמנות עדיין</p>}
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
                              <span>תבנית: {order.templateId}</span><span>·</span>
                              <span>{new Date(order.createdAt).toLocaleDateString("he-IL")}</span>
                              {order.amount && <><span>·</span><span className="text-primary font-medium">₪{order.amount / 100}</span></>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusInfo.cls}`}>{statusInfo.label}</span>
                            <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs bg-background border border-primary/20 rounded-lg px-2 py-1.5 text-foreground cursor-pointer">
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

          {tab === "templates" && (
            <motion.div key="templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
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
                  <Button size="sm" variant="outline" onClick={seedTemplates} disabled={seeding}
                    className="gap-1.5 border-muted text-muted-foreground hover:text-foreground text-xs">
                    {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    {templates.length === 0 ? "ייבא 12 תבניות" : "בדוק ייבוא"}
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground gap-2" onClick={() => setEditingTemplate("new")}>
                    <Plus className="w-4 h-4" /> תבנית חדשה
                  </Button>
                </div>
              </div>

              {templates.length === 0 && !loading && (
                <div className="bg-card border border-dashed border-primary/20 rounded-xl p-16 text-center">
                  <Package className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">אין תבניות עדיין</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {templates.map(tmpl => {
                  const galleryImg = tmpl.galleryImageUrl || tmpl.imageUrl;
                  const isGrad = !galleryImg || /gradient|linear|radial/i.test(galleryImg);
                  const dim = tmpl.dimensions;
                  return (
                    <div key={tmpl.id} className="bg-card border border-primary/10 rounded-xl overflow-hidden hover:border-primary/30 transition-colors group">
                      <div className="relative h-44 bg-secondary/30 overflow-hidden">
                        {galleryImg
                          ? isGrad
                            ? <div className="w-full h-full" style={{ background: galleryImg }} />
                            : <img src={galleryImg} alt={tmpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #0B1833, #1a2d54)" }}>
                              <Package className="w-8 h-8 text-primary/40" />
                            </div>
                          )
                        }
                        {dim && (
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[9px] text-white/80 px-1.5 py-0.5 rounded font-mono">
                            {dim.preset !== "Custom" ? dim.preset : `${dim.width}×${dim.height}`}
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <button onClick={() => toggleActive(tmpl.id, tmpl.isActive)}
                            className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-all ${tmpl.isActive ? "bg-green-400/20 text-green-400 border-green-400/40 hover:bg-red-400/20 hover:text-red-400 hover:border-red-400/40" : "bg-red-400/20 text-red-400 border-red-400/40 hover:bg-green-400/20 hover:text-green-400 hover:border-green-400/40"}`}>
                            {tmpl.isActive ? "פעיל ✓" : "כבוי"}
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 bg-background/80 backdrop-blur-sm" onClick={() => setEditingTemplate(tmpl)}>
                            <Edit2 className="w-3 h-3" /> ערוך
                          </Button>
                        </div>
                      </div>
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

          {tab === "elements" && token && <ElementsManager token={token} />}
          {tab === "fonts"    && token && <FontsManager    token={token} />}

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