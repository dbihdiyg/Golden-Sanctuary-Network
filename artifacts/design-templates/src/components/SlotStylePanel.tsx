import { useState } from "react";
import { Bold, Italic, Underline, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { FontEntry } from "@/lib/fonts";

export interface SlotStyle {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  shadow?: boolean;
  glow?: boolean;
  outline?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  gradientEnabled?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  arcDegrees?: number;
  warpType?: "none" | "arc-up" | "arc-down" | "wave" | "circle";
  rotation?: number;
  opacity?: number;
}

const PRESET_COLORS = [
  { label: "ברירת מחדל", value: "" },
  { label: "זהב", value: "#D6A84F" },
  { label: "שמנת", value: "#F8F1E3" },
  { label: "לבן", value: "#FFFFFF" },
  { label: "שחור", value: "#000000" },
  { label: "נייבי", value: "#0B1833" },
  { label: "אדום", value: "#C0392B" },
  { label: "כחול", value: "#2471A3" },
  { label: "ירוק", value: "#1E8449" },
  { label: "סגול", value: "#7D3C98" },
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 60, 72, 96];

const WARP_OPTIONS = [
  { value: "none",     label: "ישר" },
  { value: "arc-up",   label: "קשת ↑" },
  { value: "arc-down", label: "קשת ↓" },
  { value: "wave",     label: "גל" },
  { value: "circle",   label: "עיגול" },
] as const;

interface Props {
  slotId: string;
  style: SlotStyle;
  onChange: (patch: Partial<SlotStyle>) => void;
  fonts?: FontEntry[];
}

function ColorSwatch({ value, onChange, presets = PRESET_COLORS, label = "צבע" }: {
  value?: string;
  onChange: (v: string) => void;
  presets?: typeof PRESET_COLORS;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 h-7 px-2 rounded-md border border-primary/15 hover:border-primary/40 bg-background text-xs text-foreground transition-colors"
      >
        <span className="w-4 h-4 rounded-sm border border-white/20 shrink-0"
          style={{ background: value || "transparent", boxShadow: !value ? "inset 0 0 0 1px rgba(200,200,200,0.3)" : undefined }} />
        <span className="text-xs">{label}</span>
        {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-[60] bg-card border border-primary/20 rounded-xl shadow-2xl p-2 w-44">
          <div className="grid grid-cols-5 gap-1 mb-2">
            {presets.map(c => (
              <button key={c.value} onClick={() => { onChange(c.value); setOpen(false); }} title={c.label}
                className={`w-full aspect-square rounded-md border-2 transition-all ${value === c.value ? "border-primary scale-110" : "border-transparent hover:scale-105"}`}
                style={{ background: c.value || "transparent", boxShadow: !c.value ? "inset 0 0 0 1px rgba(200,200,200,0.3)" : undefined }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted-foreground shrink-0">מותאם:</label>
            <input type="color" value={value || "#ffffff"} onChange={e => onChange(e.target.value)}
              className="h-7 w-full rounded cursor-pointer border border-primary/15" />
          </div>
        </div>
      )}
    </div>
  );
}

function SliderRow({ label, min, max, step, value, defaultValue = 0, onChange, unit = "", width = "flex-1" }: {
  label: string; min: number; max: number; step: number;
  value?: number; defaultValue?: number; onChange: (v: number) => void;
  unit?: string; width?: string;
}) {
  const v = value ?? defaultValue;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{label}:</span>
      <input type="range" min={min} max={max} step={step} value={v}
        onChange={e => onChange(Number(e.target.value))}
        className={`${width} h-1 accent-primary`} />
      <span className="text-[10px] text-muted-foreground w-10 text-left shrink-0">{v}{unit}</span>
      {v !== defaultValue && (
        <button onClick={() => onChange(defaultValue)}
          className="text-[10px] text-primary/60 hover:text-primary shrink-0" title="אפס">
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export function SlotStylePanel({ slotId: _slotId, style, onChange, fonts = [] }: Props) {
  const [fontOpen, setFontOpen] = useState(false);
  const s = style;

  const allFonts = fonts.length > 0 ? fonts : [];

  const customFonts = allFonts.filter(f => f.category === "custom");
  const serifFonts  = allFonts.filter(f => f.category === "serif");
  const sansFonts   = allFonts.filter(f => f.category === "sans");
  const localFonts  = allFonts.filter(f => f.category === "local");

  return (
    <div className="mt-2 border-t border-primary/10 pt-2 space-y-2" dir="rtl">

      {/* ── Row 1: Font + Size ─────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <button
            onClick={() => setFontOpen(o => !o)}
            className="w-full flex items-center justify-between gap-1 h-7 px-2 rounded-md border border-primary/15 hover:border-primary/40 bg-background text-xs text-foreground transition-colors"
          >
            <span className="truncate" style={{ fontFamily: s.fontFamily ? `'${s.fontFamily}', serif` : undefined }}>
              {s.fontFamily || "גופן..."}
            </span>
            {fontOpen ? <ChevronUp className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />}
          </button>
          {fontOpen && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-card border border-primary/20 rounded-xl shadow-2xl overflow-y-auto w-52" style={{ maxHeight: 240 }}>
              <button className="w-full text-right px-3 py-1.5 hover:bg-primary/10 text-xs text-muted-foreground border-b border-primary/10"
                onClick={() => { onChange({ fontFamily: undefined }); setFontOpen(false); }}>
                ברירת מחדל
              </button>
              {customFonts.length > 0 && (
                <>
                  <div className="px-3 py-1 text-[10px] text-primary/60 font-medium bg-primary/5 sticky top-0">גופנים מותאמים</div>
                  {customFonts.map(f => (
                    <button key={f.family} className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                      style={{ fontFamily: `'${f.family}', serif` }}
                      onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}>
                      {f.name}
                    </button>
                  ))}
                </>
              )}
              {serifFonts.length > 0 && (
                <>
                  <div className="px-3 py-1 text-[10px] text-primary/60 font-medium bg-primary/5 sticky top-0">סריף</div>
                  {serifFonts.map(f => (
                    <button key={f.family} className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                      style={{ fontFamily: `'${f.family}', serif` }}
                      onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}>
                      {f.name}
                    </button>
                  ))}
                </>
              )}
              {sansFonts.length > 0 && (
                <>
                  <div className="px-3 py-1 text-[10px] text-primary/60 font-medium bg-primary/5 sticky top-0">סאנס</div>
                  {sansFonts.map(f => (
                    <button key={f.family} className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                      style={{ fontFamily: `'${f.family}', sans-serif` }}
                      onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}>
                      {f.name}
                    </button>
                  ))}
                </>
              )}
              {localFonts.length > 0 && (
                <>
                  <div className="px-3 py-1 text-[10px] text-primary/60 font-medium bg-primary/5 sticky top-0">מיוחד</div>
                  {localFonts.map(f => (
                    <button key={f.family} className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                      style={{ fontFamily: `'${f.family}', serif` }}
                      onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}>
                      {f.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => {
            const idx = FONT_SIZES.indexOf(s.fontSize ?? 0);
            const prev = idx > 0 ? FONT_SIZES[idx - 1] : Math.max(8, (s.fontSize ?? 14) - 2);
            onChange({ fontSize: prev });
          }} className="w-5 h-7 flex items-center justify-center rounded border border-primary/15 hover:bg-primary/10 text-primary font-bold text-sm transition-colors">−</button>
          <select value={s.fontSize ?? ""} onChange={e => onChange({ fontSize: e.target.value ? Number(e.target.value) : undefined })}
            className="h-7 w-12 text-center text-xs rounded border border-primary/15 bg-background text-foreground px-0">
            <option value="">גודל</option>
            {FONT_SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
          </select>
          <button onClick={() => {
            const idx = FONT_SIZES.indexOf(s.fontSize ?? 0);
            const next = idx >= 0 && idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : Math.min(120, (s.fontSize ?? 14) + 2);
            onChange({ fontSize: next });
          }} className="w-5 h-7 flex items-center justify-center rounded border border-primary/15 hover:bg-primary/10 text-primary font-bold text-sm transition-colors">+</button>
        </div>
      </div>

      {/* ── Row 2: Color + B/I/U ──────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <ColorSwatch value={s.color} onChange={v => onChange({ color: v || undefined })} />

        <div className="flex items-center gap-1">
          {([
            { key: "bold" as const, icon: <Bold className="w-3 h-3" />, label: "מודגש" },
            { key: "italic" as const, icon: <Italic className="w-3 h-3" />, label: "נטוי" },
            { key: "underline" as const, icon: <Underline className="w-3 h-3" />, label: "קו תחתון" },
          ]).map(({ key, icon, label }) => (
            <button key={key} title={label} onClick={() => onChange({ [key]: !s[key] })}
              className={`w-7 h-7 flex items-center justify-center rounded border transition-all ${s[key] ? "bg-primary text-primary-foreground border-primary" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 3: Letter spacing + Line height ───────────────── */}
      <SliderRow label="רווח אותיות" min={-5} max={20} step={1} value={s.letterSpacing} defaultValue={0} onChange={v => onChange({ letterSpacing: v })} unit="px" />
      <SliderRow label="גובה שורה" min={0.8} max={3} step={0.1} value={s.lineHeight} defaultValue={1.35} onChange={v => onChange({ lineHeight: Math.round(v * 10) / 10 })} />
      <SliderRow label="שקיפות" min={0} max={1} step={0.05} value={s.opacity} defaultValue={1} onChange={v => onChange({ opacity: Math.round(v * 100) / 100 })} />
      <SliderRow label="סיבוב" min={-180} max={180} step={1} value={s.rotation} defaultValue={0} onChange={v => onChange({ rotation: v })} unit="°" />

      {/* ── Row 4: Effects ────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground">אפקטים:</span>
        {([
          { key: "shadow" as const, label: "צל" },
          { key: "glow" as const, label: "זוהר" },
          { key: "outline" as const, label: "מסגרת" },
        ]).map(({ key, label }) => (
          <button key={key} onClick={() => onChange({ [key]: !s[key] })}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${s[key] ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Stroke ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">מסגרת:</span>
        <ColorSwatch value={s.strokeColor} onChange={v => onChange({ strokeColor: v || undefined })} label="צבע" />
        <input type="range" min={0} max={8} step={0.5} value={s.strokeWidth ?? 0}
          onChange={e => onChange({ strokeWidth: Number(e.target.value) })}
          className="flex-1 h-1 accent-primary" />
        <span className="text-[10px] text-muted-foreground w-8 shrink-0">{s.strokeWidth ?? 0}px</span>
      </div>

      {/* ── Gradient ──────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">גרדיאנט:</span>
          <button onClick={() => onChange({ gradientEnabled: !s.gradientEnabled })}
            className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-all ${s.gradientEnabled ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
            {s.gradientEnabled ? "פעיל" : "כבוי"}
          </button>
        </div>
        {s.gradientEnabled && (
          <div className="flex items-center gap-2 pr-16">
            <ColorSwatch value={s.gradientFrom} onChange={v => onChange({ gradientFrom: v || "#D6A84F" })} label="מ-" />
            <ColorSwatch value={s.gradientTo} onChange={v => onChange({ gradientTo: v || "#F8F1E3" })} label="ל-" />
            <input type="range" min={0} max={360} step={15} value={s.gradientAngle ?? 90}
              onChange={e => onChange({ gradientAngle: Number(e.target.value) })}
              className="flex-1 h-1 accent-primary" title={`זווית: ${s.gradientAngle ?? 90}°`} />
          </div>
        )}
      </div>

      {/* ── Warp / Arc ────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">עיקום:</span>
          {WARP_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => onChange({ warpType: opt.value })}
              className={`px-2 py-0.5 rounded text-[11px] border transition-all ${(s.warpType || "none") === opt.value ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {(s.warpType && s.warpType !== "none") && (
          <SliderRow label="עוצמה" min={-70} max={70} step={5} value={s.arcDegrees} defaultValue={0} onChange={v => onChange({ arcDegrees: v })} unit="°" />
        )}
      </div>
    </div>
  );
}
