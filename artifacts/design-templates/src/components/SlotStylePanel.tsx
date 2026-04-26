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
  opacity?: number;
  rotation?: number;
  skewX?: number;
  skewY?: number;

  shadow?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;

  glow?: boolean;
  glowColor?: string;
  glowRadius?: number;
  glowIntensity?: number;

  extrudeEnabled?: boolean;
  extrudeDepth?: number;
  extrudeColor?: string;
  extrudeAngle?: number;

  longShadowEnabled?: boolean;
  longShadowLength?: number;
  longShadowColor?: string;
  longShadowAngle?: number;

  strokeColor?: string;
  strokeWidth?: number;

  gradientEnabled?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;

  textureType?: "none" | "gold-foil" | "silver" | "fire" | "neon" | "rainbow";

  glassEnabled?: boolean;
  glassBlur?: number;
  glassColor?: string;
  glassBorderRadius?: number;

  blendMode?: "normal" | "multiply" | "screen" | "overlay" | "soft-light";

  warpType?: "none" | "arc-up" | "arc-down" | "wave" | "circle";
  arcDegrees?: number;

  outline?: boolean;
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
  { label: "ורוד", value: "#E91E8C" },
  { label: "כתום", value: "#E67E22" },
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 60, 72, 96, 120];

const WARP_OPTIONS = [
  { value: "none",     label: "ישר" },
  { value: "arc-up",   label: "קשת ↑" },
  { value: "arc-down", label: "קשת ↓" },
  { value: "wave",     label: "גל ~" },
  { value: "circle",   label: "⭕ עיגול" },
] as const;

const TEXTURE_OPTIONS = [
  { value: "none",      label: "ללא" },
  { value: "gold-foil", label: "🥇 זהב" },
  { value: "silver",    label: "🥈 כסף" },
  { value: "fire",      label: "🔥 אש" },
  { value: "neon",      label: "💜 ניאון" },
  { value: "rainbow",   label: "🌈 קשת" },
] as const;

const BLEND_OPTIONS = [
  { value: "normal",    label: "רגיל" },
  { value: "multiply",  label: "Multiply" },
  { value: "screen",    label: "Screen" },
  { value: "overlay",   label: "Overlay" },
  { value: "soft-light",label: "Soft Light" },
] as const;

function ColorSwatch({ value, onChange, label = "צבע" }: {
  value?: string;
  onChange: (v: string) => void;
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
        <div className="absolute top-full right-0 mt-1 z-[60] bg-card border border-primary/20 rounded-xl shadow-2xl p-2 w-48">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {PRESET_COLORS.map(c => (
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

function SliderRow({ label, min, max, step, value, defaultValue = 0, onChange, unit = "", compact = false }: {
  label: string; min: number; max: number; step: number;
  value?: number; defaultValue?: number; onChange: (v: number) => void;
  unit?: string; compact?: boolean;
}) {
  const v = value ?? defaultValue;
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : ""}`}>
      <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{label}:</span>
      <input type="range" min={min} max={max} step={step} value={v}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1 accent-primary" />
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

function Section({
  title, active = false, badge, children, defaultOpen = false
}: {
  title: string; active?: boolean; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${active ? "border-primary/40 bg-primary/5" : "border-primary/10"}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{title}</span>
          {badge && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">{badge}</span>}
          {active && !badge && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
        </div>
        {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-primary/10 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${active ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
      {label}
    </button>
  );
}

interface Props {
  slotId: string;
  style: SlotStyle;
  onChange: (patch: Partial<SlotStyle>) => void;
  fonts?: FontEntry[];
}

export function SlotStylePanel({ slotId: _slotId, style, onChange, fonts = [] }: Props) {
  const [fontOpen, setFontOpen] = useState(false);
  const s = style;

  const customFonts = fonts.filter(f => f.category === "custom");
  const serifFonts  = fonts.filter(f => f.category === "serif");
  const sansFonts   = fonts.filter(f => f.category === "sans");
  const localFonts  = fonts.filter(f => f.category === "local");

  const hasShadow = !!(s.shadow || s.shadowX || s.shadowY || s.shadowColor);
  const hasExtrude = !!s.extrudeEnabled;
  const hasLongShadow = !!s.longShadowEnabled;
  const hasGlow = !!(s.glow || s.glowColor || s.glowRadius);
  const hasGradient = !!s.gradientEnabled;
  const hasTexture = !!(s.textureType && s.textureType !== "none");
  const hasStroke = !!(s.strokeWidth && s.strokeWidth > 0);
  const hasGlass = !!s.glassEnabled;
  const hasWarp = !!(s.warpType && s.warpType !== "none");
  const hasTransform = !!(s.rotation || s.skewX || s.skewY);
  const hasBlend = !!(s.blendMode && s.blendMode !== "normal");

  return (
    <div className="mt-2 space-y-1.5" dir="rtl">

      {/* ── גופן ואותיות ───────────────────────────────────────────── */}
      <Section title="גופן ואותיות" defaultOpen={true}
        active={!!(s.fontFamily || s.fontSize || s.color || s.bold || s.italic || s.underline)}>

        {/* Font picker */}
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
                {customFonts.length > 0 && (<>
                  <div className="px-3 py-1 text-[10px] text-primary/60 font-medium bg-primary/5 sticky top-0">גופנים מותאמים</div>
                  {customFonts.map(f => (
                    <button key={f.family} className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                      style={{ fontFamily: `'${f.family}', serif` }}
                      onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}>
                      {f.name}
                    </button>
                  ))}
                </>)}
                {serifFonts.length > 0 && (<>
                  <div className="px-3 py-1 text-[10px] text-primary/60 font-medium bg-primary/5 sticky top-0">סריף</div>
                  {serifFonts.map(f => (
                    <button key={f.family} className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                      style={{ fontFamily: `'${f.family}', serif` }}
                      onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}>
                      {f.name}
                    </button>
                  ))}
                </>)}
                {sansFonts.length > 0 && (<>
                  <div className="px-3 py-1 text-[10px] text-primary/60 font-medium bg-primary/5 sticky top-0">סאנס</div>
                  {sansFonts.map(f => (
                    <button key={f.family} className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                      style={{ fontFamily: `'${f.family}', sans-serif` }}
                      onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}>
                      {f.name}
                    </button>
                  ))}
                </>)}
                {localFonts.length > 0 && (<>
                  <div className="px-3 py-1 text-[10px] text-primary/60 font-medium bg-primary/5 sticky top-0">מיוחד</div>
                  {localFonts.map(f => (
                    <button key={f.family} className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                      style={{ fontFamily: `'${f.family}', serif` }}
                      onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}>
                      {f.name}
                    </button>
                  ))}
                </>)}
              </div>
            )}
          </div>
          {/* Size buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => {
              const idx = FONT_SIZES.indexOf(s.fontSize ?? 0);
              onChange({ fontSize: idx > 0 ? FONT_SIZES[idx - 1] : Math.max(8, (s.fontSize ?? 14) - 2) });
            }} className="w-5 h-7 flex items-center justify-center rounded border border-primary/15 hover:bg-primary/10 text-primary font-bold text-sm">−</button>
            <select value={s.fontSize ?? ""} onChange={e => onChange({ fontSize: e.target.value ? Number(e.target.value) : undefined })}
              className="h-7 w-12 text-center text-xs rounded border border-primary/15 bg-background text-foreground px-0">
              <option value="">גודל</option>
              {FONT_SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
            </select>
            <button onClick={() => {
              const idx = FONT_SIZES.indexOf(s.fontSize ?? 0);
              onChange({ fontSize: idx >= 0 && idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : Math.min(144, (s.fontSize ?? 14) + 2) });
            }} className="w-5 h-7 flex items-center justify-center rounded border border-primary/15 hover:bg-primary/10 text-primary font-bold text-sm">+</button>
          </div>
        </div>

        {/* Color + B/I/U */}
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
      </Section>

      {/* ── ריווח ומיקום ───────────────────────────────────────────── */}
      <Section title="ריווח ומיקום" active={hasTransform || !!(s.letterSpacing || s.opacity != null)}>
        <SliderRow label="רווח אותיות" min={-10} max={30} step={1} value={s.letterSpacing} defaultValue={0} onChange={v => onChange({ letterSpacing: v })} unit="px" />
        <SliderRow label="גובה שורה" min={0.6} max={4} step={0.1} value={s.lineHeight} defaultValue={1.35} onChange={v => onChange({ lineHeight: Math.round(v * 10) / 10 })} />
        <SliderRow label="שקיפות" min={0} max={1} step={0.05} value={s.opacity} defaultValue={1} onChange={v => onChange({ opacity: Math.round(v * 100) / 100 })} />
        <SliderRow label="סיבוב" min={-180} max={180} step={1} value={s.rotation} defaultValue={0} onChange={v => onChange({ rotation: v })} unit="°" />
        <SliderRow label="הטיה X" min={-45} max={45} step={1} value={s.skewX} defaultValue={0} onChange={v => onChange({ skewX: v })} unit="°" />
        <SliderRow label="הטיה Y" min={-45} max={45} step={1} value={s.skewY} defaultValue={0} onChange={v => onChange({ skewY: v })} unit="°" />
      </Section>

      {/* ── צל ועומק ───────────────────────────────────────────────── */}
      <Section title="צל ועומק" active={hasShadow || hasExtrude || hasLongShadow}
        badge={[hasShadow && "צל", hasExtrude && "3D", hasLongShadow && "ארוך"].filter(Boolean).join(" + ") || undefined}>

        {/* Basic shadow toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <ToggleChip label="צל" active={!!s.shadow} onClick={() => onChange({ shadow: !s.shadow })} />
          <ToggleChip label="3D Extrude" active={hasExtrude} onClick={() => onChange({ extrudeEnabled: !s.extrudeEnabled })} />
          <ToggleChip label="Long Shadow" active={hasLongShadow} onClick={() => onChange({ longShadowEnabled: !s.longShadowEnabled })} />
        </div>

        {/* Advanced shadow controls */}
        {(s.shadow || hasShadow) && (
          <div className="space-y-1.5 pr-2 border-r-2 border-primary/20">
            <div className="flex items-center gap-2">
              <ColorSwatch value={s.shadowColor} onChange={v => onChange({ shadowColor: v || undefined })} label="צבע" />
              <span className="text-[10px] text-muted-foreground">צבע צל</span>
            </div>
            <SliderRow label="הזזה X" min={-20} max={20} step={1} value={s.shadowX} defaultValue={2} onChange={v => onChange({ shadowX: v })} unit="px" />
            <SliderRow label="הזזה Y" min={-20} max={20} step={1} value={s.shadowY} defaultValue={2} onChange={v => onChange({ shadowY: v })} unit="px" />
            <SliderRow label="פיזור" min={0} max={30} step={1} value={s.shadowBlur} defaultValue={6} onChange={v => onChange({ shadowBlur: v })} unit="px" />
          </div>
        )}

        {/* 3D Extrude controls */}
        {hasExtrude && (
          <div className="space-y-1.5 pr-2 border-r-2 border-amber-500/30">
            <div className="flex items-center gap-2">
              <ColorSwatch value={s.extrudeColor} onChange={v => onChange({ extrudeColor: v || undefined })} label="צבע" />
              <span className="text-[10px] text-muted-foreground">צבע עומק</span>
            </div>
            <SliderRow label="עומק" min={1} max={20} step={1} value={s.extrudeDepth} defaultValue={5} onChange={v => onChange({ extrudeDepth: v })} unit="px" />
            <SliderRow label="זווית" min={0} max={360} step={15} value={s.extrudeAngle} defaultValue={225} onChange={v => onChange({ extrudeAngle: v })} unit="°" />
          </div>
        )}

        {/* Long shadow controls */}
        {hasLongShadow && (
          <div className="space-y-1.5 pr-2 border-r-2 border-blue-500/30">
            <div className="flex items-center gap-2">
              <ColorSwatch value={s.longShadowColor} onChange={v => onChange({ longShadowColor: v || undefined })} label="צבע" />
              <span className="text-[10px] text-muted-foreground">צבע</span>
            </div>
            <SliderRow label="אורך" min={10} max={120} step={5} value={s.longShadowLength} defaultValue={40} onChange={v => onChange({ longShadowLength: v })} unit="px" />
            <SliderRow label="זווית" min={0} max={360} step={15} value={s.longShadowAngle} defaultValue={135} onChange={v => onChange({ longShadowAngle: v })} unit="°" />
          </div>
        )}
      </Section>

      {/* ── זוהר ───────────────────────────────────────────────────── */}
      <Section title="זוהר ואור" active={hasGlow} badge={hasGlow ? "פעיל" : undefined}>
        <div className="flex items-center gap-2">
          <ToggleChip label="זוהר" active={!!s.glow} onClick={() => onChange({ glow: !s.glow })} />
        </div>
        {hasGlow && (
          <div className="space-y-1.5 pr-2 border-r-2 border-yellow-500/30">
            <div className="flex items-center gap-2">
              <ColorSwatch value={s.glowColor} onChange={v => onChange({ glowColor: v || undefined })} label="צבע" />
              <span className="text-[10px] text-muted-foreground">צבע זוהר</span>
            </div>
            <SliderRow label="רדיוס" min={2} max={60} step={2} value={s.glowRadius} defaultValue={12} onChange={v => onChange({ glowRadius: v })} unit="px" />
            <SliderRow label="עוצמה" min={1} max={4} step={1} value={s.glowIntensity} defaultValue={2} onChange={v => onChange({ glowIntensity: v })} />
          </div>
        )}
      </Section>

      {/* ── גרדיאנט ומרקם ─────────────────────────────────────────── */}
      <Section title="גרדיאנט ומרקם" active={hasGradient || hasTexture}
        badge={hasTexture ? TEXTURE_OPTIONS.find(t => t.value === s.textureType)?.label : hasGradient ? "גרדיאנט" : undefined}>

        {/* Gradient */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ToggleChip label="גרדיאנט" active={hasGradient} onClick={() => onChange({ gradientEnabled: !s.gradientEnabled })} />
          </div>
          {hasGradient && (
            <div className="space-y-1.5 pr-2 border-r-2 border-primary/20">
              <div className="flex items-center gap-2 flex-wrap">
                <ColorSwatch value={s.gradientFrom} onChange={v => onChange({ gradientFrom: v || "#D6A84F" })} label="מ-" />
                <ColorSwatch value={s.gradientTo} onChange={v => onChange({ gradientTo: v || "#F8F1E3" })} label="ל-" />
              </div>
              <SliderRow label="זווית" min={0} max={360} step={15} value={s.gradientAngle} defaultValue={90} onChange={v => onChange({ gradientAngle: v })} unit="°" />
              {/* Gradient preview */}
              <div className="h-4 rounded" style={{
                background: `linear-gradient(${s.gradientAngle ?? 90}deg, ${s.gradientFrom || "#D6A84F"}, ${s.gradientTo || "#F8F1E3"})`
              }} />
            </div>
          )}
        </div>

        {/* Texture */}
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground">מרקם מובנה:</span>
          <div className="flex flex-wrap gap-1">
            {TEXTURE_OPTIONS.map(t => (
              <button key={t.value}
                onClick={() => onChange({ textureType: t.value as SlotStyle["textureType"] })}
                className={`px-2 py-1 rounded text-[11px] border transition-all ${(s.textureType || "none") === t.value ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── קו ומסגרת ─────────────────────────────────────────────── */}
      <Section title="קו מסגרת" active={hasStroke || hasGlass}
        badge={[hasStroke && "קו", hasGlass && "זכוכית"].filter(Boolean).join(" + ") || undefined}>

        {/* Stroke */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-muted-foreground font-medium">קו חיצוני לטקסט:</span>
          <div className="flex items-center gap-2">
            <ColorSwatch value={s.strokeColor} onChange={v => onChange({ strokeColor: v || undefined })} label="צבע" />
            <input type="range" min={0} max={8} step={0.5} value={s.strokeWidth ?? 0}
              onChange={e => onChange({ strokeWidth: Number(e.target.value) })}
              className="flex-1 h-1 accent-primary" />
            <span className="text-[10px] text-muted-foreground w-10 shrink-0">{s.strokeWidth ?? 0}px</span>
          </div>
        </div>

        {/* Glass background */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ToggleChip label="זכוכית (Glass)" active={hasGlass} onClick={() => onChange({ glassEnabled: !s.glassEnabled })} />
          </div>
          {hasGlass && (
            <div className="space-y-1.5 pr-2 border-r-2 border-blue-300/30">
              <div className="flex items-center gap-2">
                <ColorSwatch value={s.glassColor} onChange={v => onChange({ glassColor: v || undefined })} label="רקע" />
                <span className="text-[10px] text-muted-foreground">צבע רקע</span>
              </div>
              <SliderRow label="טשטוש" min={0} max={30} step={1} value={s.glassBlur} defaultValue={8} onChange={v => onChange({ glassBlur: v })} unit="px" />
              <SliderRow label="עיגול" min={0} max={30} step={2} value={s.glassBorderRadius} defaultValue={8} onChange={v => onChange({ glassBorderRadius: v })} unit="px" />
            </div>
          )}
        </div>

        {/* Blend Mode */}
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground font-medium">Blend Mode:</span>
          <div className="flex flex-wrap gap-1">
            {BLEND_OPTIONS.map(b => (
              <button key={b.value}
                onClick={() => onChange({ blendMode: b.value as SlotStyle["blendMode"] })}
                className={`px-2 py-0.5 rounded text-[11px] border transition-all ${(s.blendMode || "normal") === b.value ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── עיקום (Warp) ──────────────────────────────────────────── */}
      <Section title="עיקום טקסט" active={hasWarp} badge={hasWarp ? WARP_OPTIONS.find(w => w.value === s.warpType)?.label : undefined}>
        <div className="flex items-center gap-1 flex-wrap">
          {WARP_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => onChange({ warpType: opt.value })}
              className={`px-2 py-0.5 rounded text-[11px] border transition-all ${(s.warpType || "none") === opt.value ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {(s.warpType && s.warpType !== "none") && (
          <SliderRow label="עוצמה" min={-80} max={80} step={5} value={s.arcDegrees} defaultValue={0} onChange={v => onChange({ arcDegrees: v })} unit="" />
        )}
      </Section>

    </div>
  );
}
