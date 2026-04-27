import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import hadarLogo from "@/assets/logo-hadar.png";
import { useCombinedFonts, loadAnyFont } from "@/lib/fonts";
import { SlotStylePanel, SlotStyle } from "@/components/SlotStylePanel";
import { SvgWarpText, WarpType } from "@/components/SvgWarpText";
import { buildTextCSS, buildAdminWrapperCSS as _buildAdminWrapperCSS } from "@/lib/designRenderer";
import {
  Lock, Unlock, Plus, Trash2, Edit2, Eye, EyeOff, Copy, Package, ShoppingBag,
  BarChart3, LogOut, Check, X, ImagePlus, GripVertical,
  RefreshCw, ArrowRight, ChevronDown, ChevronUp, Loader2,
  AlertCircle, Users, DollarSign, Clock, ToggleLeft, ToggleRight, Upload,
  AlignCenter, AlignRight, AlignLeft, Type, Layers, Move,
  Maximize2, FileType2, Send, MessageSquare, Film, Download,
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

interface AdminSlot extends SlotStyle {
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
  color: string;
  align: "center" | "right" | "left";
  multiline: boolean;
  fixed?: boolean;
  visible?: boolean;
  locked?: boolean;
}

function slotToStyle(s: AdminSlot): SlotStyle {
  return {
    ...s,
    fontSize: s.fontSize ?? s.fontSizePx,
    shadow: s.shadow ?? (s as any).textShadow,
  };
}

function patchFromStyle(patch: Partial<SlotStyle>): Partial<AdminSlot> {
  const r: Partial<AdminSlot> = { ...patch } as any;
  if (patch.fontSize !== undefined) r.fontSizePx = patch.fontSize;
  return r;
}

// ─── Admin slot CSS renderers — delegates to the shared design engine ──────────
function buildAdminSlotCSS(slot: AdminSlot): React.CSSProperties {
  const baseColor = slot.color || "#D6A84F";
  const styleData = { ...slot, fontSize: slot.fontSizePx ?? (slot as any).fontSize ?? 18 } as any;
  return buildTextCSS(styleData, baseColor);
}

function buildAdminWrapperCSS(slot: AdminSlot): React.CSSProperties {
  return _buildAdminWrapperCSS({ ...slot, fontSize: slot.fontSizePx ?? (slot as any).fontSize ?? 18 } as any, slot.opacity);
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
  x: 50, y: 50, width: 80,
  fontSizePx: 28, fontFamily: "Frank Ruhl Libre",
  bold: false, italic: false,
  color: "#D6A84F", opacity: 1,
  shadow: false, letterSpacing: 0, lineHeight: 1.35,
  align: "center", multiline: false, fixed: false,
  visible: true, locked: false,
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
    slug:            initial?.slug ?? "",
    title:           initial?.title ?? "",
    subtitle:        initial?.subtitle ?? "",
    category:        initial?.category ?? "",
    style:           initial?.style ?? "",
    price:           initial?.price ?? 4900,
    imageUrl:        initial?.imageUrl ?? null,
    galleryImageUrl: initial?.galleryImageUrl ?? null,
    displayImageUrl: initial?.displayImageUrl ?? null,
    dimensions:      initial?.dimensions ?? { preset: "Custom", width: 800, height: 1100, unit: "px" },
    slots:           (initial?.slots as AdminSlot[]) ?? [],
    isActive:        initial?.isActive ?? true,
  });

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; sx: number; sy: number; sl: number; st: number } | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedSlot = form.slots.find(s => s.id === selectedSlotId) ?? null;

  const updateSlot = useCallback((id: string, patch: Partial<AdminSlot>) =>
    setForm(p => ({ ...p, slots: p.slots.map(s => s.id === id ? { ...s, ...patch } : s) })), []);

  const duplicateSlot = useCallback((id: string) => {
    setForm(p => {
      const slot = p.slots.find(s => s.id === id);
      if (!slot) return p;
      const dup: AdminSlot = { ...slot, id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, label: `${slot.label} (עותק)`, x: Math.min(95, slot.x + 3), y: Math.min(95, slot.y + 3) };
      return { ...p, slots: [...p.slots, dup] };
    });
  }, []);

  const deleteSlot = useCallback((id: string) => {
    setForm(p => ({ ...p, slots: p.slots.filter(s => s.id !== id) }));
    setSelectedSlotId(prev => prev === id ? null : prev);
  }, []);

  const reorderSlot = useCallback((id: string, dir: -1 | 1) => {
    setForm(p => {
      const idx = p.slots.findIndex(s => s.id === id);
      const newIdx = idx + dir;
      if (idx < 0 || newIdx < 0 || newIdx >= p.slots.length) return p;
      const next = [...p.slots];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return { ...p, slots: next };
    });
  }, []);

  useEffect(() => {
    form.slots.forEach(s => { if (s.fontFamily) loadAnyFont(s.fontFamily); });
  }, [form.slots]);

  const canvasBg = form.displayImageUrl || form.imageUrl;
  const isGradientBg = canvasBg ? /gradient|linear|radial/i.test(canvasBg) : false;

  // ── Canvas aspect ratio based on template dimensions ──────────────────────
  const tmplW = form.dimensions?.width ?? 800;
  const tmplH = form.dimensions?.height ?? 1100;
  const aspectRatio = `${tmplW} / ${tmplH}`;

  // ── Canvas click → add a new slot centered at the click point ─────────────
  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (dragging) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-slot-admin]")) return;
    if (!canvasBg) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = +((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = +((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    const slot: AdminSlot = { ...emptySlot(), x, y };
    setForm(p => ({ ...p, slots: [...p.slots, slot] }));
    setSelectedSlotId(slot.id);
  }

  function onSlotPointerDown(e: React.PointerEvent, id: string) {
    const slot = form.slots.find(s => s.id === id);
    if (!slot || slot.locked) return;
    e.stopPropagation();
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
      x: +Math.max(0, Math.min(100, dragging.sl + dx)).toFixed(1),
      y: +Math.max(0, Math.min(100, dragging.st + dy)).toFixed(1),
    });
  }

  async function handleSave(attempt = 1) {
    if (!form.slug || !form.title) { setSaveError("חסרים: slug וכותרת"); setSaveState("error"); return; }
    setSaveState("saving"); setSaveError(null);
    try {
      const id = (initial as DBTemplate)?.id;
      const result: DBTemplate = id
        ? await adminFetch(`/hadar/admin/templates/${id}`, token, { method: "PUT",  body: JSON.stringify(form) })
        : await adminFetch("/hadar/admin/templates",           token, { method: "POST", body: JSON.stringify(form) });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
      onSave(result);
    } catch (err: any) {
      const msg: string = err.message || "שגיאה לא ידועה";
      // Auto-retry once on gateway/network errors (502, 503, 504, ECONNRESET)
      if (attempt === 1 && /50[234]|ECONN|network/i.test(msg)) {
        await new Promise(r => setTimeout(r, 1500));
        return handleSave(2);
      }
      setSaveError(msg);
      setSaveState("error");
    }
  }

  // ── Sorted layers (top z-index first for layers panel) ────────────────────
  const layersSorted = [...form.slots].sort((a, b) => (b.zIndex ?? 10) - (a.zIndex ?? 10));

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" dir="rtl">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-primary/10 bg-card/90 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1 text-muted-foreground">
            <ArrowRight className="w-4 h-4" /> חזרה
          </Button>
          <span className="text-foreground font-semibold">{form.title || "תבנית חדשה"}</span>
          {canvasBg && <span className="text-[11px] text-muted-foreground">לחץ על הקנבס להוספת שדה | גרור שדה לשינוי מיקום</span>}
        </div>
        <div className="flex items-center gap-2">
          {saveError && (
            <div className="flex flex-col items-end gap-0.5 max-w-xs">
              <span className="text-[10px] font-semibold text-destructive">שגיאת שמירה:</span>
              <span className="text-[10px] text-destructive/80 break-all leading-tight" title={saveError}>
                {saveError.length > 80 ? saveError.slice(0, 80) + "…" : saveError}
              </span>
            </div>
          )}
          <Button
            onClick={() => handleSave()}
            disabled={saveState === "saving"}
            className={`gap-2 transition-all min-w-24 ${
              saveState === "saved" ? "bg-green-600 hover:bg-green-700 text-white" :
              saveState === "error" ? "bg-destructive hover:bg-destructive/80 text-white" :
              "bg-primary text-primary-foreground"
            }`}
          >
            {saveState === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> :
             saveState === "saved"  ? <Check className="w-4 h-4" /> :
             saveState === "error"  ? <X className="w-4 h-4" /> :
             <Check className="w-4 h-4" />}
            {saveState === "saving" ? "שומר..." :
             saveState === "saved"  ? "נשמר ✓" :
             saveState === "error"  ? "נסה שוב" : "שמור"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ══ Canvas area ══════════════════════════════════════════════════════ */}
        <div className="flex-1 bg-[#0a0f1e] overflow-auto flex items-start justify-center p-8">
          <div
            ref={canvasRef}
            className="relative select-none rounded-xl border border-primary/20 shadow-2xl overflow-hidden"
            style={{
              width: "100%",
              maxWidth: 520,
              aspectRatio,
              cursor: canvasBg ? "crosshair" : "default",
            }}
            onClick={handleCanvasClick}
            onPointerMove={onPointerMove}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
          >
            {/* Background */}
            {canvasBg ? (
              isGradientBg
                ? <div className="absolute inset-0" style={{ background: canvasBg }} />
                : <img src={canvasBg} alt="רקע" className="absolute inset-0 w-full h-full pointer-events-none" style={{ objectFit: "contain" }} draggable={false} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0B1833]">
                <ImagePlus className="w-14 h-14 text-primary/20" />
                <p className="text-sm text-primary/30">העלה תמונת תצוגה מהפאנל מימין</p>
              </div>
            )}

            {/* ── Slot overlays ── */}
            {form.slots.map(slot => {
              if (slot.visible === false) return null;
              const isSelected = selectedSlotId === slot.id;
              const css = buildAdminSlotCSS(slot);
              const wrapCSS = buildAdminWrapperCSS(slot);
              const hasWarp = !!(slot.warpType && slot.warpType !== "none");
              const warpAmt = (slot as any).warpAmount ?? (slot.arcDegrees != null ? Math.abs(slot.arcDegrees) : 40);
              const zIdx = slot.zIndex ?? 10;

              return (
                <div
                  key={slot.id}
                  data-slot-admin={slot.id}
                  onPointerDown={e => onSlotPointerDown(e, slot.id)}
                  onClick={e => { e.stopPropagation(); setSelectedSlotId(slot.id); }}
                  style={{
                    position: "absolute",
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    width: `${slot.width}%`,
                    ...wrapCSS,
                    cursor: slot.locked ? "not-allowed" : "move",
                    zIndex: zIdx,
                    textAlign: slot.align ?? "center",
                    direction: "rtl",
                    userSelect: "none",
                    touchAction: "none",
                    outline: isSelected ? "2px solid #D6A84F" : "1.5px dashed rgba(214,168,79,0.35)",
                    outlineOffset: 2,
                  }}
                >
                  {hasWarp ? (
                    <SvgWarpText
                      text={slot.defaultValue || slot.label}
                      warpType={slot.warpType as WarpType}
                      warpAmount={warpAmt}
                      cssStyle={css}
                      pathWidth={Math.round(slot.width / 100 * tmplW * 0.9)}
                    />
                  ) : (
                    <span style={{ ...css, display: "block", whiteSpace: "pre-line", pointerEvents: "none" }}>
                      {slot.defaultValue || slot.label}
                    </span>
                  )}

                  {/* Selection label */}
                  {isSelected && (
                    <span style={{
                      position: "absolute", bottom: "100%", right: 0,
                      fontSize: 9, color: "#D6A84F",
                      background: "rgba(0,0,0,0.75)",
                      padding: "1px 5px", borderRadius: "3px 3px 0 0",
                      whiteSpace: "nowrap", pointerEvents: "none",
                    }}>
                      {slot.label}{slot.fixed ? " 🔒" : ""}{slot.locked ? " ⚓" : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ Right panel ══════════════════════════════════════════════════════ */}
        <div className="w-80 border-r border-primary/10 bg-card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto divide-y divide-primary/10">

            {/* ── Images ── */}
            <section className="p-4 space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ImagePlus className="w-3 h-3" /> תמונות
              </p>
              <ImageUploadButton token={token} label="תמונת עורך (רקע לשדות)" value={form.displayImageUrl || form.imageUrl}
                onChange={url => setForm(p => ({ ...p, displayImageUrl: url, imageUrl: url || p.imageUrl }))} />
              <ImageUploadButton token={token} label="תמונת גלריה (כרטיסייה)" value={form.galleryImageUrl}
                onChange={url => setForm(p => ({ ...p, galleryImageUrl: url }))} />
            </section>

            {/* ── Dimensions ── */}
            <section className="p-4">
              <DimensionsPicker value={form.dimensions} onChange={d => setForm(p => ({ ...p, dimensions: d }))} />
            </section>

            {/* ── Template metadata ── */}
            <section className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">פרטי התבנית</p>
              {(([
                { key: "title",    label: "כותרת",          dir: undefined },
                { key: "subtitle", label: "תת-כותרת",       dir: undefined },
                { key: "slug",     label: "מזהה (slug)",    dir: "ltr" as const },
                { key: "category", label: "קטגוריה",        dir: undefined },
                { key: "style",    label: "סגנון",          dir: undefined },
              ]) as { key: string; label: string; dir?: "ltr" }[]).map(({ key, label, dir }) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input dir={dir} className="mt-1 h-8 text-sm bg-background border-primary/20"
                    value={(form as any)[key] ?? ""}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <Label className="text-xs text-muted-foreground">מחיר (אגורות — ₪49 = 4900)</Label>
                <Input type="number" dir="ltr" className="mt-1 h-8 text-sm bg-background border-primary/20"
                  value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground flex-1">תבנית פעילה</Label>
                <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
                  {form.isActive ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                </button>
              </div>
            </section>

            {/* ══ Layers panel ════════════════════════════════════════════════ */}
            <section className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> שכבות ({form.slots.length})
                </p>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                  onClick={() => {
                    const slot = emptySlot();
                    setForm(p => ({ ...p, slots: [...p.slots, slot] }));
                    setSelectedSlotId(slot.id);
                  }}>
                  <Plus className="w-3 h-3" /> הוסף שכבה
                </Button>
              </div>

              {form.slots.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {canvasBg ? "לחץ על הקנבס להוספת שכבה" : "העלה תמונה קודם"}
                </p>
              )}

              {/* Layer rows — shown in reverse z-order (highest z = top in list) */}
              <div className="space-y-0.5">
                {layersSorted.map((slot, lIdx) => {
                  const origIdx = form.slots.findIndex(s => s.id === slot.id);
                  const isVis = slot.visible !== false;
                  const isLocked = !!slot.locked;
                  const isSel = selectedSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer border transition-all ${
                        isSel ? "bg-primary/10 border-primary/40" : "border-transparent hover:bg-primary/5 hover:border-primary/10"
                      }`}
                    >
                      {/* Eye */}
                      <button title="הצג/הסתר"
                        onClick={e => { e.stopPropagation(); updateSlot(slot.id, { visible: !isVis }); }}
                        className={`shrink-0 p-0.5 rounded transition-colors ${isVis ? "text-primary/70 hover:text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"}`}>
                        {isVis ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Lock */}
                      <button title={isLocked ? "שחרר נעילה" : "נעל שכבה"}
                        onClick={e => { e.stopPropagation(); updateSlot(slot.id, { locked: !isLocked }); }}
                        className={`shrink-0 p-0.5 rounded transition-colors ${isLocked ? "text-amber-400 hover:text-amber-300" : "text-muted-foreground/30 hover:text-muted-foreground"}`}>
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      {/* Label */}
                      <span className={`flex-1 text-xs truncate ${isSel ? "text-primary font-medium" : "text-foreground"} ${!isVis ? "opacity-40 line-through" : ""}`}>
                        {slot.label}{slot.fixed ? " 🔒" : ""}
                      </span>

                      {/* Reorder */}
                      <button title="העלה שכבה"
                        onClick={e => { e.stopPropagation(); reorderSlot(slot.id, -1); }}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-all">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button title="הורד שכבה"
                        onClick={e => { e.stopPropagation(); reorderSlot(slot.id, 1); }}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-all">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate */}
                      <button title="שכפל"
                        onClick={e => { e.stopPropagation(); duplicateSlot(slot.id); }}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-muted-foreground hover:text-primary transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button title="מחק"
                        onClick={e => { e.stopPropagation(); deleteSlot(slot.id); }}
                        className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-destructive/50 hover:text-destructive transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ══ Selected slot properties ════════════════════════════════════ */}
            {selectedSlot && (
              <section className="p-4 space-y-5" dir="rtl">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-primary" />
                  עריכת שכבה: <span className="text-primary">{selectedSlot.label}</span>
                </p>

                {/* Content */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Type className="w-3 h-3" /> תוכן
                  </p>
                  {([
                    { key: "label",        label: "שם שכבה (לניהול)" },
                    { key: "placeholder",  label: "טקסט עזר ללקוח" },
                    { key: "defaultValue", label: "ערך ברירת מחדל (מה שיופיע)" },
                  ] as const).map(({ key, label }) => (
                    <div key={key}>
                      <Label className="text-[10px] text-muted-foreground">{label}</Label>
                      <Input className="mt-0.5 h-7 text-xs bg-background border-primary/20"
                        value={(selectedSlot as any)[key] ?? ""}
                        onChange={e => updateSlot(selectedSlot.id, { [key]: e.target.value })} />
                    </div>
                  ))}
                </div>

                <hr className="border-primary/10" />

                {/* Full style panel */}
                <SlotStylePanel
                  slotId={selectedSlot.id}
                  style={slotToStyle(selectedSlot)}
                  onChange={patch => updateSlot(selectedSlot.id, patchFromStyle(patch))}
                  fonts={combinedFonts}
                />

                <hr className="border-primary/10" />

                {/* Layout — position/size/z-index */}
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Move className="w-3 h-3" /> מיקום ופריסה
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([
                      { key: "x",      label: "מרכז X%", min: 0,  max: 100 },
                      { key: "y",      label: "עליון Y%", min: 0,  max: 100 },
                      { key: "width",  label: "רוחב%",   min: 1,  max: 100 },
                      { key: "zIndex", label: "שכבה Z",  min: 0,  max: 99  },
                    ] as const).map(({ key, label, min, max }) => (
                      <div key={key}>
                        <Label className="text-[9px] text-muted-foreground leading-tight block mb-0.5">{label}</Label>
                        <Input type="number" dir="ltr" min={min} max={max}
                          className="h-7 text-xs bg-background border-primary/20 px-1.5"
                          value={Math.round((selectedSlot as any)[key] ?? 0)}
                          onChange={e => updateSlot(selectedSlot.id, { [key]: Number(e.target.value) })} />
                      </div>
                    ))}
                  </div>
                  {/* Alignment */}
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">יישור טקסט</Label>
                    <div className="flex gap-1">
                      {([
                        { v: "right",  Icon: AlignRight,  title: "ימין" },
                        { v: "center", Icon: AlignCenter, title: "מרכז" },
                        { v: "left",   Icon: AlignLeft,   title: "שמאל" },
                      ] as const).map(({ v, Icon, title }) => (
                        <button key={v} title={title}
                          onClick={() => updateSlot(selectedSlot.id, { align: v })}
                          className={`flex-1 h-8 flex items-center justify-center rounded-md border transition-all ${selectedSlot.align === v ? "border-primary bg-primary/20 text-primary" : "border-primary/20 text-muted-foreground hover:border-primary/40"}`}>
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <hr className="border-primary/10" />

                {/* Behavior flags */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">אפשרויות</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: "multiline", label: "מספר שורות",  desc: "ללקוח" },
                      { key: "fixed",     label: "🔒 קבוע",      desc: "לקוח לא יכול לערוך" },
                    ] as const).map(({ key, label, desc }) => (
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
                  onClick={() => deleteSlot(selectedSlot.id)}>
                  <Trash2 className="w-3.5 h-3.5" /> מחק שכבה זו
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

  const LOCAL_FONTS_PREVIEW = [
    { name: "אילנות הלבנון – כבד",   family: "BA-Arzey-Bold",      file: "BAArzeyHalevanon-Bold.ttf"   },
    { name: "אילנות הלבנון – עדין",  family: "BA-Arzey-Light",     file: "BAArzeyHalevanon-Light.ttf"  },
    { name: "ברקאי",                  family: "BA-Barkai",          file: "BABarkai-Regular.otf"         },
    { name: "קזבלנקה",               family: "BA-Casablanca",      file: "BA-Casablanca-Light.otf"      },
    { name: "פונטוב – כבד",          family: "BA-Fontov-Bold",     file: "BA-Fontov-Bold.otf"           },
    { name: "פונטוב – רגיל",         family: "BA-Fontov",          file: "BA-Fontov-Regular.otf"        },
    { name: "היצירה – עדין",         family: "BA-HaYetzira-Light", file: "BA-HaYetzira-Light.otf"       },
    { name: "היצירה – רגיל",         family: "BA-HaYetzira",       file: "BA-HaYetzira-Regular.otf"     },
    { name: "קרית קודש",             family: "BA-Kiriat-Kodesh",   file: "BA-Kiriat-Kodesh-Bold.otf"    },
    { name: "מים חיים",              family: "BA-Maim-Haim",       file: "BA-Maim-Haim-Regular.otf"     },
    { name: "מסובין",                family: "BA-Mesubin",         file: "BA-Mesubin-Rolltext.otf"      },
    { name: "מומנט",                 family: "BA-Moment",          file: "BA-Moment-Original.otf"       },
    { name: "נפלאות",                family: "BA-Niflaot",         file: "BANiflaot-Black.ttf"          },
    { name: "פלטפורמה – שחור",       family: "BA-Platforma-Black", file: "BAPlatforma-Black.otf"        },
    { name: "פלטפורמה – כבד",        family: "BA-Platforma-Bold",  file: "BAPlatforma-Bold.otf"         },
    { name: "פלטפורמה – עדין",       family: "BA-Platforma-Light", file: "BAPlatforma-Light.otf"        },
    { name: "ראדלהיים",              family: "BA-Radlheim",        file: "BARadlheim-Bold.otf"          },
    { name: "ראשון לציון",           family: "BA-Rishon",          file: "BARishonLezion-Regular.ttf"   },
  ];

  useEffect(() => {
    LOCAL_FONTS_PREVIEW.forEach(f => loadAnyFont(f.family));
  }, []);

  return (
    <motion.div key="fonts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

      {/* ── BA local fonts (pre-installed) ─────────────────────────────── */}
      <div className="bg-card border border-primary/10 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
          <FileType2 className="w-4 h-4 text-primary" /> פונטי BA מותקנים ({LOCAL_FONTS_PREVIEW.length})
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">פונטים מקומיים זמינים לכל התבניות — ניתן לבחור בהם בעורך</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LOCAL_FONTS_PREVIEW.map(f => (
            <div key={f.family} className="flex flex-col gap-1 p-3 rounded-lg border border-primary/10 bg-background/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">{f.name}</span>
                <span className="text-[9px] text-muted-foreground font-mono bg-primary/5 px-1.5 py-0.5 rounded">{f.file.split(".").pop()?.toUpperCase()}</span>
              </div>
              <div dir="rtl" className="text-lg leading-tight truncate" style={{ fontFamily: `'${f.family}', serif`, color: "#D6A84F" }}>
                אבגדהוזחטי
              </div>
              <div dir="rtl" className="text-sm leading-tight truncate text-muted-foreground" style={{ fontFamily: `'${f.family}', serif` }}>
                שמחת חתן וכלה
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Uploaded custom fonts ─────────────────────────────────────── */}
      <div className="bg-card border border-primary/10 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><FileType2 className="w-4 h-4 text-primary" /> העלאת פונט נוסף</h3>
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

// ─── Tickets Manager ──────────────────────────────────────────────────────────
interface AdminTicket {
  id: number;
  clerkUserId: string;
  userEmail: string;
  subject: string;
  status: string;
  unreadAdmin: number;
  unreadUser: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminTicketMessage {
  id: number;
  ticketId: number;
  senderType: "user" | "admin";
  senderLabel: string;
  message: string;
  attachmentUrl: string | null;
  createdAt: string;
}

const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "פתוחה",
  in_progress: "בטיפול",
  closed: "סגורה",
};

const QUICK_REPLIES = [
  "תודה על פנייתך! הצוות שלנו יבחן את הבעיה ויחזור אליך בהקדם.",
  "הבעיה תוקנה! אנא נסו שוב וספרו לנו אם הכל תקין.",
  "על מנת לסייע לך, נשמח אם תוכלו לשלוח צילום מסך של הבעיה.",
  "הקובץ שלכם מוכן להורדה — אנא היכנסו לעיצוב ולחצו על כפתור ההורדה.",
];

function TicketsManager({ token }: { token: string }) {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<AdminTicket | null>(null);
  const [messages, setMessages] = useState<AdminTicketMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/tickets`, {
        headers: { "x-admin-secret": token },
      });
      if (res.ok) setTickets(await res.json());
    } catch {}
    setLoading(false);
  };

  const loadTicket = async (ticket: AdminTicket) => {
    setActiveTicket(ticket);
    setMsgLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/tickets/${ticket.id}`, {
        headers: { "x-admin-secret": token },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTicket(data.ticket);
        setMessages(data.messages || []);
        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, unreadAdmin: 0 } : t));
      }
    } catch {}
    setMsgLoading(false);
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeTicket) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/tickets/${activeTicket.id}/messages`, {
        method: "POST",
        headers: { "x-admin-secret": token, "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setReply("");
        setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, status: "in_progress", updatedAt: new Date().toISOString() } : t));
      }
    } catch {}
    setSending(false);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "x-admin-secret": token, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? updated : t));
        if (activeTicket?.id === id) setActiveTicket(updated);
      }
    } catch {}
  };

  useEffect(() => { loadTickets(); }, []);

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.subject.includes(search) || t.userEmail.includes(search);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalUnread = tickets.reduce((n, t) => n + (t.unreadAdmin || 0), 0);

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-4 h-[620px]">
      {/* ── Ticket list ── */}
      <div className="bg-card border border-primary/10 rounded-xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-primary/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">פניות ({filtered.length})</span>
            {totalUnread > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-2 py-0.5">{totalUnread} חדש</span>
            )}
            <button onClick={loadTickets} className="text-muted-foreground hover:text-foreground p-1">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש פניות..."
            className="w-full border border-primary/10 rounded-lg px-2.5 py-1.5 text-xs bg-background focus:outline-none"
          />
          <div className="flex gap-1">
            {["all", "open", "in_progress", "closed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-primary/15 hover:border-primary/30"}`}>
                {s === "all" ? "הכל" : TICKET_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-primary/5">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-12">אין פניות</p>
          ) : (
            filtered.map(ticket => (
              <button key={ticket.id} onClick={() => loadTicket(ticket)}
                className={`w-full text-right px-3 py-2.5 hover:bg-primary/5 transition-colors ${activeTicket?.id === ticket.id ? "bg-primary/10" : ""}`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="font-medium text-xs truncate">{ticket.subject}</span>
                      {ticket.unreadAdmin > 0 && (
                        <span className="bg-primary text-primary-foreground text-[9px] font-bold rounded-full px-1.5 py-0.5">{ticket.unreadAdmin}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="truncate">{ticket.userEmail || ticket.clerkUserId.slice(0, 10)}</span>
                      <span className={`px-1.5 py-px rounded-full border ${
                        ticket.status === "open" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        ticket.status === "in_progress" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-green-50 text-green-700 border-green-200"
                      }`}>{TICKET_STATUS_LABELS[ticket.status] || ticket.status}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                      {new Date(ticket.updatedAt).toLocaleDateString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat pane ── */}
      {activeTicket ? (
        <div className="bg-card border border-primary/10 rounded-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-primary/10 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{activeTicket.subject}</p>
              <p className="text-xs text-muted-foreground">{activeTicket.userEmail} · #{activeTicket.id}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {["open", "in_progress", "closed"].map(s => (
                <button key={s} onClick={() => updateStatus(activeTicket.id, s)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    activeTicket.status === s
                      ? s === "closed" ? "bg-green-500/20 text-green-700 border-green-400/40"
                        : s === "in_progress" ? "bg-amber-500/20 text-amber-700 border-amber-400/40"
                        : "bg-blue-500/20 text-blue-700 border-blue-400/40"
                      : "text-muted-foreground border-primary/15 hover:border-primary/30"
                  }`}>
                  {TICKET_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {msgLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
            ) : messages.map(msg => {
              const isUser = msg.senderType === "user";
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    isUser ? "bg-secondary/60 rounded-tr-sm" : "bg-primary text-primary-foreground rounded-tl-sm"
                  }`}>
                    {!isUser && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{msg.senderLabel}</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-[9px] mt-1 opacity-50">
                      {new Date(msg.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick replies */}
          <div className="px-3 py-1.5 border-t border-primary/5 flex gap-1.5 overflow-x-auto">
            {QUICK_REPLIES.map((qr, i) => (
              <button key={i} onClick={() => setReply(qr)}
                className="text-[10px] whitespace-nowrap px-2 py-0.5 border border-primary/15 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors shrink-0">
                {qr.slice(0, 28)}…
              </button>
            ))}
          </div>

          {/* Reply box */}
          {activeTicket.status !== "closed" ? (
            <div className="border-t border-primary/10 flex gap-2 p-3">
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={2}
                placeholder="כתבו תגובה..."
                className="flex-1 border border-primary/15 rounded-xl px-3 py-2 text-sm bg-background resize-none focus:outline-none"
              />
              <Button size="sm" onClick={sendReply} disabled={sending || !reply.trim()}
                className="self-end gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                שלח
              </Button>
            </div>
          ) : (
            <div className="border-t border-primary/10 p-3 text-center text-xs text-muted-foreground">פנייה זו סגורה</div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-primary/10 rounded-xl flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">בחרו פנייה מהרשימה לצפייה ומענה</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Video Templates Manager ──────────────────────────────────────────────────

interface VideoFieldDef { id: string; label: string; type: "text" | "textarea"; defaultValue: string; placeholder: string; maxLength: number; required: boolean; }
interface VideoOverlay { fieldId: string; x: number; y: number; fontSize: number; fontColor: string; shadowColor: string; align: "left"|"center"|"right"; startTime: number; endTime: number; }
interface AeLayerMapping { fieldId: string; aeLayerName: string; aeProperty?: string; }
interface AdminVideoTemplate {
  id: number; slug: string; title: string; description: string; category: string; price: number;
  baseVideoUrl: string|null; previewVideoUrl: string|null; previewImageUrl: string|null;
  aeProjectUrl: string|null;
  fields: VideoFieldDef[]; overlays: VideoOverlay[];
  renderType: "ffmpeg" | "aefx";
  aeCompositionName: string|null;
  aeLayerMappings: AeLayerMapping[];
  tier: "standard" | "premium";
  maxRenderSeconds: number|null;
  renderPreset: string;
  renderCrf: number|null;
  videoDuration: number|null; videoWidth: number|null; videoHeight: number|null; isActive: boolean;
}

interface AdminVideoJob {
  id: number; status: string; userEmail: string|null; userName: string|null;
  templateId: number; templateTitle: string|null; templateSlug: string|null;
  stripePaymentIntentId: string|null; priority: string;
  progressPct: number; rendererUsed: string|null;
  outputUrl: string|null; errorMessage: string|null;
  createdAt: string; renderStartedAt: string|null; renderCompletedAt: string|null;
  queuePosition: number|null; isRendering: boolean;
}

function emptyField(): VideoFieldDef { return { id: crypto.randomUUID().slice(0,8), label: "", type: "text", defaultValue: "", placeholder: "", maxLength: 50, required: false }; }
function emptyOverlay(fieldId: string): VideoOverlay { return { fieldId, x: 50, y: 50, fontSize: 60, fontColor: "#FFFFFF", shadowColor: "#000000", align: "center", startTime: 0, endTime: 0 }; }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:           { label: "טיוטה",          color: "bg-gray-100 text-gray-600 border-gray-200" },
  pending_payment: { label: "ממתין לתשלום",    color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  paid:            { label: "שולם",            color: "bg-blue-50 text-blue-700 border-blue-200" },
  queued:          { label: "בתור",            color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  rendering:       { label: "מרנדר",           color: "bg-orange-50 text-orange-700 border-orange-200" },
  ready:           { label: "מוכן",            color: "bg-green-50 text-green-700 border-green-200" },
  failed:          { label: "נכשל",            color: "bg-red-50 text-red-700 border-red-200" },
};

function VideoTemplatesManager({ token }: { token: string }) {
  const api = import.meta.env.VITE_API_BASE_URL ?? "";
  const [templates, setTemplates] = useState<AdminVideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AdminVideoTemplate> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState<null | "base" | "preview" | "thumb" | "ae">(null);
  const [msg, setMsg] = useState<string|null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<number|null>(null);

  const headers = { "Content-Type": "application/json", "x-admin-secret": token };

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${api}/api/hadar/admin/video-templates`, { headers });
      if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
      const data = await res.json();
      setTemplates(data);
    } catch (e: any) {
      setMsg(`שגיאה: ${e.message}`);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    setMsg(null);
    try {
      const isNew = !editing.id;
      const res = await fetch(
        isNew ? `${api}/api/hadar/admin/video-templates` : `${api}/api/hadar/admin/video-templates/${editing.id}`,
        { method: isNew ? "POST" : "PUT", headers, body: JSON.stringify(editing) }
      );
      if (!res.ok) throw new Error((await res.json()).error);
      const saved = await res.json();
      setMsg("נשמר בהצלחה ✓");
      setEditing(null);
      await load();
      if (isNew) setActiveTemplateId(saved.id);
    } catch (e: any) { setMsg(`שגיאה: ${e.message}`); }
    finally { setSaving(false); }
  }

  async function uploadVideo(id: number, type: "base"|"preview"|"thumb", file: File) {
    setUploadingVideo(type);
    const fd = new FormData();
    fd.append("video", file);
    fd.append("type", type);
    try {
      const res = await fetch(`${api}/api/hadar/admin/video-templates/${id}/upload-video`, { method: "POST", headers: { "x-admin-secret": token }, body: fd });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg("קובץ הועלה ✓");
      await load();
    } catch (e: any) { setMsg(`שגיאת העלאה: ${e.message}`); }
    finally { setUploadingVideo(null); }
  }

  async function uploadAeProject(id: number, file: File) {
    setUploadingVideo("ae");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${api}/api/hadar/admin/video-templates/${id}/upload-ae-project`, { method: "POST", headers: { "x-admin-secret": token }, body: fd });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg("פרויקט AE הועלה ✓");
      await load();
    } catch (e: any) { setMsg(`שגיאת העלאה: ${e.message}`); }
    finally { setUploadingVideo(null); }
  }

  async function toggleActive(t: AdminVideoTemplate) {
    await fetch(`${api}/api/hadar/admin/video-templates/${t.id}`, { method: "PUT", headers, body: JSON.stringify({ isActive: !t.isActive }) });
    await load();
  }

  const isNew = editing && !editing.id;

  // Field editor helpers
  function setField(idx: number, patch: Partial<VideoFieldDef>) {
    setEditing(prev => {
      if (!prev) return prev;
      const fields = [...(prev.fields ?? [])];
      fields[idx] = { ...fields[idx], ...patch };
      return { ...prev, fields };
    });
  }
  function addField() {
    setEditing(prev => prev ? { ...prev, fields: [...(prev.fields ?? []), emptyField()] } : prev);
  }
  function removeField(idx: number) {
    setEditing(prev => {
      if (!prev) return prev;
      const fields = (prev.fields ?? []).filter((_, i) => i !== idx);
      return { ...prev, fields };
    });
  }

  // Overlay editor helpers
  function setOverlay(idx: number, patch: Partial<VideoOverlay>) {
    setEditing(prev => {
      if (!prev) return prev;
      const overlays = [...(prev.overlays ?? [])];
      overlays[idx] = { ...overlays[idx], ...patch };
      return { ...prev, overlays };
    });
  }
  function addOverlay(fieldId: string) {
    setEditing(prev => prev ? { ...prev, overlays: [...(prev.overlays ?? []), emptyOverlay(fieldId)] } : prev);
  }
  function removeOverlay(idx: number) {
    setEditing(prev => {
      if (!prev) return prev;
      const overlays = (prev.overlays ?? []).filter((_, i) => i !== idx);
      return { ...prev, overlays };
    });
  }

  const activeTemplate = activeTemplateId != null ? templates.find(t => t.id === activeTemplateId) : null;

  return (
    <div className="space-y-4" dir="rtl">
      {msg && (
        <div className={`text-sm p-3 rounded-lg flex items-center justify-between gap-2 ${msg.startsWith("שגיא") ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          <span>{msg}</span>
          {msg.startsWith("שגיא") && (
            <button onClick={load} className="text-xs underline opacity-70 hover:opacity-100 whitespace-nowrap">נסה שוב</button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">תבניות וידאו ({templates.length})</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setEditing({ fields: [], overlays: [], price: 4900, videoDuration: 15, videoWidth: 1920, videoHeight: 1080, isActive: true, renderType: "ffmpeg", tier: "standard", maxRenderSeconds: 300, renderPreset: "fast", renderCrf: 22, aeLayerMappings: [] })}>
          <Plus className="w-4 h-4" /> תבנית חדשה
        </Button>
      </div>

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-card border border-primary/15 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-primary">{isNew ? "תבנית חדשה" : `עריכה: ${editing.title}`}</h3>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["slug","כתובת (slug)"],["title","כותרת"],["description","תיאור"],["category","קטגוריה"],
              ].map(([k,l]) => (
                <div key={k as string}>
                  <Label className="text-xs text-muted-foreground mb-0.5">{l as string}</Label>
                  <Input dir="rtl" value={(editing as any)[k as string] ?? ""} onChange={e => setEditing(p => p ? ({ ...p, [k as string]: e.target.value }) : p)} className="h-8 text-sm" />
                </div>
              ))}
              <div>
                <Label className="text-xs text-muted-foreground mb-0.5">מחיר (אגורות, ₪49=4900)</Label>
                <Input type="number" value={editing.price ?? 4900} onChange={e => setEditing(p => p ? ({ ...p, price: Number(e.target.value) }) : p)} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-0.5">משך (שניות)</Label>
                <Input type="number" value={editing.videoDuration ?? 15} onChange={e => setEditing(p => p ? ({ ...p, videoDuration: Number(e.target.value) }) : p)} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-0.5">רוחב (px)</Label>
                <Input type="number" value={editing.videoWidth ?? 1920} onChange={e => setEditing(p => p ? ({ ...p, videoWidth: Number(e.target.value) }) : p)} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-0.5">גובה (px)</Label>
                <Input type="number" value={editing.videoHeight ?? 1080} onChange={e => setEditing(p => p ? ({ ...p, videoHeight: Number(e.target.value) }) : p)} className="h-8 text-sm" />
              </div>
            </div>

            {/* Render Engine */}
            <div className="border border-primary/10 rounded-xl p-4 space-y-3 bg-muted/10">
              <Label className="font-semibold text-sm flex items-center gap-1.5">⚙️ מנוע רינדור</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-0.5">סוג רינדור</Label>
                  <select
                    value={editing.renderType ?? "ffmpeg"}
                    onChange={e => setEditing(p => p ? { ...p, renderType: e.target.value as "ffmpeg"|"aefx" } : p)}
                    className="border rounded-lg h-8 text-xs px-2 w-full bg-background"
                  >
                    <option value="ffmpeg">FFmpeg — שכבות טקסט פשוטות</option>
                    <option value="aefx">After Effects — פרימיום (Nexrender)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-0.5">רמת שירות (Tier)</Label>
                  <select
                    value={editing.tier ?? "standard"}
                    onChange={e => setEditing(p => p ? { ...p, tier: e.target.value as "standard"|"premium" } : p)}
                    className="border rounded-lg h-8 text-xs px-2 w-full bg-background"
                  >
                    <option value="standard">Standard — תור רגיל</option>
                    <option value="premium">Premium — תעדוף גבוה</option>
                  </select>
                </div>
                {editing.renderType !== "aefx" && <>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-0.5">FFmpeg Preset</Label>
                    <select value={editing.renderPreset ?? "fast"} onChange={e => setEditing(p => p ? { ...p, renderPreset: e.target.value } : p)} className="border rounded-lg h-8 text-xs px-2 w-full bg-background">
                      {["ultrafast","superfast","veryfast","faster","fast","medium","slow"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-0.5">CRF (איכות, 0-51)</Label>
                    <Input type="number" min={0} max={51} value={editing.renderCrf ?? 22} onChange={e => setEditing(p => p ? { ...p, renderCrf: Number(e.target.value) } : p)} className="h-8 text-xs" />
                  </div>
                </>}
                <div>
                  <Label className="text-xs text-muted-foreground mb-0.5">זמן רינדור מקסימלי (שניות)</Label>
                  <Input type="number" value={editing.maxRenderSeconds ?? 300} onChange={e => setEditing(p => p ? { ...p, maxRenderSeconds: Number(e.target.value) } : p)} className="h-8 text-xs" />
                </div>
              </div>

              {/* AE-specific settings */}
              {editing.renderType === "aefx" && (
                <div className="border border-primary/10 rounded-lg p-3 space-y-3 bg-primary/3">
                  <p className="text-xs font-semibold text-primary">הגדרות After Effects</p>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-0.5">שם Composition (ב-AE)</Label>
                    <Input dir="ltr" placeholder="MAIN_COMP" value={editing.aeCompositionName ?? ""} onChange={e => setEditing(p => p ? { ...p, aeCompositionName: e.target.value } : p)} className="h-8 text-xs font-mono" />
                  </div>

                  {/* AE Layer Mapping */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold">מיפוי שדות → שכבות AE</Label>
                      <Button size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={() => {
                        setEditing(p => p ? { ...p, aeLayerMappings: [...(p.aeLayerMappings ?? []), { fieldId: "", aeLayerName: "", aeProperty: "Source Text" }] } : p);
                      }}><Plus className="w-3 h-3" />הוסף</Button>
                    </div>
                    {(editing.aeLayerMappings ?? []).length === 0 && (
                      <p className="text-xs text-muted-foreground">הוסיפו מיפוי עבור כל שדה טקסט</p>
                    )}
                    <div className="space-y-1.5">
                      {(editing.aeLayerMappings ?? []).map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5 flex-wrap">
                          <select
                            value={m.fieldId}
                            onChange={e => {
                              const maps = [...(editing.aeLayerMappings ?? [])];
                              maps[i] = { ...maps[i], fieldId: e.target.value };
                              setEditing(p => p ? { ...p, aeLayerMappings: maps } : p);
                            }}
                            className="border rounded h-7 text-xs px-1.5 flex-1 bg-background"
                          >
                            <option value="">— שדה —</option>
                            {(editing.fields ?? []).map(f => <option key={f.id} value={f.id}>{f.label || f.id}</option>)}
                          </select>
                          <span className="text-xs text-muted-foreground">→</span>
                          <Input
                            dir="ltr"
                            placeholder="AE_LAYER_NAME"
                            value={m.aeLayerName}
                            onChange={e => {
                              const maps = [...(editing.aeLayerMappings ?? [])];
                              maps[i] = { ...maps[i], aeLayerName: e.target.value };
                              setEditing(p => p ? { ...p, aeLayerMappings: maps } : p);
                            }}
                            className="h-7 text-xs font-mono flex-1"
                          />
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => {
                            const maps = (editing.aeLayerMappings ?? []).filter((_,j) => j !== i);
                            setEditing(p => p ? { ...p, aeLayerMappings: maps } : p);
                          }}><X className="w-3 h-3" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fields */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold text-sm">שדות טקסט למשתמש</Label>
                <Button size="sm" variant="outline" onClick={addField} className="h-7 gap-1 text-xs"><Plus className="w-3 h-3" />הוסף שדה</Button>
              </div>
              <div className="space-y-2">
                {(editing.fields ?? []).map((f, i) => (
                  <div key={f.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input dir="rtl" placeholder="תווית שדה" value={f.label} onChange={e => setField(i, { label: e.target.value })} className="h-7 text-sm flex-1" />
                      <select value={f.type} onChange={e => setField(i, { type: e.target.value as "text"|"textarea" })} className="border rounded h-7 text-xs px-1">
                        <option value="text">שדה קצר</option>
                        <option value="textarea">שדה ארוך</option>
                      </select>
                      <Input type="number" placeholder="max" value={f.maxLength} onChange={e => setField(i, { maxLength: Number(e.target.value) })} className="h-7 text-xs w-16" />
                      <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                        <input type="checkbox" checked={f.required} onChange={e => setField(i, { required: e.target.checked })} />
                        חובה
                      </label>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => removeField(i)}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                    <Input dir="rtl" placeholder="placeholder" value={f.placeholder} onChange={e => setField(i, { placeholder: e.target.value })} className="h-7 text-xs" />
                  </div>
                ))}
              </div>
            </div>

            {/* Overlays */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold text-sm">מיקומי טקסט (Overlays)</Label>
              </div>
              {(editing.fields ?? []).length === 0 && <p className="text-xs text-muted-foreground">הוסיפו שדות קודם</p>}
              <div className="space-y-2">
                {(editing.overlays ?? []).map((ov, i) => {
                  const fieldLabel = (editing.fields ?? []).find(f => f.id === ov.fieldId)?.label ?? ov.fieldId;
                  return (
                    <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-primary">{fieldLabel}</span>
                        <div className="flex items-center gap-1 text-xs"><span>X%</span><Input type="number" value={ov.x} onChange={e => setOverlay(i, { x: Number(e.target.value) })} className="h-6 w-14 text-xs" /></div>
                        <div className="flex items-center gap-1 text-xs"><span>Y%</span><Input type="number" value={ov.y} onChange={e => setOverlay(i, { y: Number(e.target.value) })} className="h-6 w-14 text-xs" /></div>
                        <div className="flex items-center gap-1 text-xs"><span>גודל</span><Input type="number" value={ov.fontSize} onChange={e => setOverlay(i, { fontSize: Number(e.target.value) })} className="h-6 w-16 text-xs" /></div>
                        <div className="flex items-center gap-1 text-xs"><span>צבע</span><input type="color" value={ov.fontColor} onChange={e => setOverlay(i, { fontColor: e.target.value })} className="h-6 w-8 rounded border-0 cursor-pointer" /></div>
                        <div className="flex items-center gap-1 text-xs"><span>צל</span><input type="color" value={ov.shadowColor} onChange={e => setOverlay(i, { shadowColor: e.target.value })} className="h-6 w-8 rounded border-0 cursor-pointer" /></div>
                        <select value={ov.align} onChange={e => setOverlay(i, { align: e.target.value as "left"|"center"|"right" })} className="border rounded h-6 text-xs px-1">
                          <option value="center">מרכז</option>
                          <option value="right">ימין</option>
                          <option value="left">שמאל</option>
                        </select>
                        <div className="flex items-center gap-1 text-xs"><span>מ-</span><Input type="number" value={ov.startTime} onChange={e => setOverlay(i, { startTime: Number(e.target.value) })} className="h-6 w-14 text-xs" /></div>
                        <div className="flex items-center gap-1 text-xs"><span>עד</span><Input type="number" value={ov.endTime} onChange={e => setOverlay(i, { endTime: Number(e.target.value) })} className="h-6 w-14 text-xs" /><span className="text-muted-foreground">(0=סוף)</span></div>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => removeOverlay(i)}><X className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  );
                })}
                {/* Add overlay for a field */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(editing.fields ?? []).map(f => (
                    <Button key={f.id} size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => addOverlay(f.id)}>
                      <Plus className="w-3 h-3" /> {f.label || f.id}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                שמור
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(null); setMsg(null); }}>ביטול</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template list */}
      {loading && <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}
      {!loading && templates.length === 0 && <p className="text-muted-foreground text-center py-12 text-sm">אין תבניות וידאו עדיין</p>}

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="bg-card border border-primary/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 cursor-pointer select-none" onClick={() => setActiveTemplateId(prev => prev === t.id ? null : t.id)}>
              <div className="w-16 h-10 bg-[#0B1833] rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                {t.previewImageUrl ? <img src={`${import.meta.env.VITE_API_BASE_URL ?? ""}${t.previewImageUrl}`} className="w-full h-full object-cover" /> : <Film className="w-5 h-5 text-[#D6A84F]/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{t.title}</p>
                <p className="text-xs text-muted-foreground">/{t.slug} · ₪{(t.price/100).toFixed(0)} · {t.fields.length} שדות
                <span className={`mr-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${t.renderType === "aefx" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {t.renderType === "aefx" ? "AE" : "FFmpeg"}
                </span>
                <span className={`mr-0.5 px-1.5 py-0.5 rounded text-[10px] border ${t.tier === "premium" ? "bg-[#D6A84F]/10 text-[#D6A84F] border-[#D6A84F]/30" : "bg-muted text-muted-foreground border-border"}`}>
                  {t.tier === "premium" ? "פרימיום" : "סטנדרט"}
                </span>
              </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); toggleActive(t); }} className={`text-xs px-2 py-0.5 rounded-full border ${t.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  {t.isActive ? "פעיל" : "מוסתר"}
                </button>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={e => { e.stopPropagation(); setEditing(t); }}>
                  <Edit2 className="w-3 h-3" /> עריכה
                </Button>
              </div>
            </div>

            {activeTemplateId === t.id && (
              <div className="border-t border-primary/10 p-4 space-y-3 bg-muted/20">
                <p className="text-xs font-semibold text-muted-foreground mb-2">העלאת קבצים</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { type: "base" as const, label: "וידאו בסיס (MP4)", accept: "video/*" },
                    { type: "preview" as const, label: "תצוגה מקדימה (MP4 קצר)", accept: "video/*" },
                    { type: "thumb" as const, label: "תמונה ממוזערת", accept: "image/*" },
                  ].map(({ type, label, accept }) => (
                    <label key={type} className={`cursor-pointer flex items-center gap-1.5 text-xs border rounded-lg px-3 py-2 transition-colors ${uploadingVideo === type ? "opacity-50" : "hover:bg-primary/5 border-primary/20"}`}>
                      {uploadingVideo === type ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {label}
                      <input type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadVideo(t.id, type, f); e.target.value = ""; }} />
                    </label>
                  ))}
                  {t.renderType === "aefx" && (
                    <label className={`cursor-pointer flex items-center gap-1.5 text-xs border rounded-lg px-3 py-2 transition-colors ${uploadingVideo === "ae" ? "opacity-50" : "hover:bg-primary/5 border-primary/30 text-primary"}`}>
                      {uploadingVideo === "ae" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      פרויקט AE (.aep / .zip)
                      <input type="file" accept=".aep,.zip" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadAeProject(t.id, f); e.target.value = ""; }} />
                    </label>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {t.baseVideoUrl && <p>✓ וידאו בסיס: <span className="text-foreground font-mono">{t.baseVideoUrl.slice(0, 50)}…</span></p>}
                  {t.previewVideoUrl && <p>✓ תצוגה מקדימה: <span className="text-foreground font-mono">{t.previewVideoUrl.slice(0, 50)}…</span></p>}
                  {t.previewImageUrl && <p>✓ תמונה: <span className="text-foreground font-mono">{t.previewImageUrl.slice(0, 50)}…</span></p>}
                  {t.aeProjectUrl && <p>✓ פרויקט AE: <span className="text-foreground font-mono">{t.aeProjectUrl.slice(0, 50)}…</span></p>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Video Jobs Manager ───────────────────────────────────────────────────────

function VideoJobsManager({ token }: { token: string }) {
  const api = import.meta.env.VITE_API_BASE_URL ?? "";
  const headers = { "x-admin-secret": token };
  const [jobs, setJobs] = useState<AdminVideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [retrying, setRetrying] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const url = `${api}/api/hadar/admin/video-jobs${statusFilter ? `?status=${statusFilter}` : ""}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
      const data = await res.json();
      setJobs(data);
    } catch (e: any) {
      setMsg(`שגיאה: ${e.message}`);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => {
    const active = jobs.some(j => j.status === "queued" || j.status === "rendering" || j.status === "paid");
    if (!active) return;
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, [jobs]);

  async function retryJob(id: number) {
    setRetrying(id);
    try {
      const res = await fetch(`${api}/api/hadar/admin/video-jobs/${id}/retry`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" } });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg(`עבודה #${id} נשלחה מחדש לתור ✓`);
      await load();
    } catch (e: any) { setMsg(`שגיאה: ${e.message}`); }
    finally { setRetrying(null); }
  }

  function fmtTime(s: string | null) {
    if (!s) return "—";
    const d = new Date(s);
    return d.toLocaleDateString("he-IL") + " " + d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-4" dir="rtl">
      {msg && (
        <div className={`text-sm p-3 rounded-lg flex items-center justify-between gap-2 ${msg.startsWith("שגיא") ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          <span>{msg}</span>
          {msg.startsWith("שגיא") && (
            <button onClick={load} className="text-xs underline opacity-70 hover:opacity-100 whitespace-nowrap">נסה שוב</button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-bold text-lg">עבודות וידאו ({jobs.length})</h2>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg h-8 text-xs px-2 bg-background">
          <option value="">כל הסטטוסים</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={load}>
          <Loader2 className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> רענן
        </Button>
      </div>

      {loading && jobs.length === 0 && <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}
      {!loading && jobs.length === 0 && <p className="text-muted-foreground text-center py-12 text-sm">אין עבודות {statusFilter ? STATUS_LABELS[statusFilter]?.label : ""} עדיין</p>}

      <div className="space-y-2">
        {jobs.map(job => {
          const st = STATUS_LABELS[job.status] ?? { label: job.status, color: "bg-gray-100 text-gray-600 border-gray-200" };
          const isExpanded = expandedId === job.id;
          return (
            <div key={job.id} className="bg-card border border-primary/10 rounded-xl overflow-hidden">
              <div className="p-3 flex items-start gap-3 flex-wrap cursor-pointer" onClick={() => setExpandedId(p => p === job.id ? null : job.id)}>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-mono">#{job.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                    {job.rendererUsed && <span className="text-[10px] px-1.5 py-0.5 rounded border bg-muted text-muted-foreground font-mono">{job.rendererUsed}</span>}
                    {job.isRendering && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 animate-pulse">מרנדר {job.progressPct}%</span>}
                    {job.queuePosition !== null && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">תור #{job.queuePosition}</span>}
                  </div>
                  <p className="text-sm font-medium truncate">{job.templateTitle ?? `תבנית #${job.templateId}`}</p>
                  <p className="text-xs text-muted-foreground">{job.userEmail ?? "—"} {job.userName ? `(${job.userName})` : ""}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtTime(job.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {job.status === "failed" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50" disabled={retrying === job.id} onClick={e => { e.stopPropagation(); retryJob(job.id); }}>
                      {retrying === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      נסה שוב
                    </Button>
                  )}
                  {job.outputUrl && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild onClick={e => e.stopPropagation()}>
                      <a href={`${api}${job.outputUrl}`} target="_blank" rel="noreferrer"><Download className="w-3 h-3" />הורד</a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded error / details */}
              {isExpanded && (
                <div className="border-t border-primary/10 p-3 space-y-2 bg-muted/10 text-xs">
                  {job.stripePaymentIntentId && <p className="text-muted-foreground font-mono">Stripe: {job.stripePaymentIntentId}</p>}
                  {job.renderStartedAt && <p className="text-muted-foreground">התחיל: {fmtTime(job.renderStartedAt)} | הושלם: {fmtTime(job.renderCompletedAt)}</p>}
                  {job.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-red-700 font-semibold mb-0.5">שגיאה:</p>
                      <pre className="text-[10px] text-red-600 whitespace-pre-wrap break-all leading-relaxed">{job.errorMessage}</pre>
                    </div>
                  )}
                  {!job.errorMessage && !job.renderStartedAt && <p className="text-muted-foreground">אין מידע נוסף</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Video Section (sub-tabs: templates / jobs) ───────────────────────────────

function VideoSection({ token }: { token: string }) {
  const [sub, setSub] = useState<"templates" | "jobs">("templates");
  return (
    <div className="space-y-4">
      <div className="flex border-b border-primary/10 gap-0" dir="rtl">
        {([["templates","תבניות"], ["jobs","עבודות"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setSub(k)}
            className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${sub === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >{l}</button>
        ))}
      </div>
      {sub === "templates" && <VideoTemplatesManager token={token} />}
      {sub === "jobs"      && <VideoJobsManager      token={token} />}
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
type Tab = "orders" | "templates" | "elements" | "fonts" | "stats" | "tickets" | "videos";

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
          {([["orders","הזמנות"],["tickets","פניות"],["templates","תבניות"],["videos","וידאו"],["elements","אלמנטים"],["fonts","פונטים"],["stats","סטטיסטיקות"]] as [Tab,string][]).map(([t, l]) => (
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

          {tab === "tickets"  && token && <motion.div key="tickets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><TicketsManager token={token} /></motion.div>}
          {tab === "elements" && token && <ElementsManager token={token} />}
          {tab === "fonts"    && token && <FontsManager    token={token} />}
          {tab === "videos" && token && (
            <motion.div key="videos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <VideoSection token={token} />
            </motion.div>
          )}

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