import { useState, useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Underline, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { FontEntry } from "@/lib/fonts";
import { SvgWarpText } from "./SvgWarpText";
import { PRESETS_3D, build3DShadows, type Preset3DConfig } from "@/lib/3d-presets";
import { Text3DCanvas, MATERIAL_3D_OPTIONS, type Material3DType } from "./Text3DCanvas";
import { STYLE_PRESETS, STYLE_PRESET_CATEGORIES, type StylePreset } from "@/lib/style-presets";

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

  warpType?: "none" | "arc-up" | "arc-down" | "wave" | "circle" | "bulge" | "arch";
  warpAmount?: number;    // 1–100 intensity
  /** @deprecated use warpAmount */
  arcDegrees?: number;

  outline?: boolean;
  zIndex?: number;

  preset3D?: string;
  depth3D?: number;
  lightAngle3D?: number;
  shadowStr3D?: number;
  highlight3D?: number;
  glow3D?: number;

  // ── Three.js 3D engine ──────────────────────
  mode3D?: boolean;
  material3D?: Material3DType;
  depth3DEngine?: number;
  bevel3D?: number;
  cameraAngleX?: number;
  cameraAngleY?: number;
  autoRotate3D?: boolean;
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


const WARP_OPTIONS = [
  { value: "none",     label: "ישר",       icon: "—" },
  { value: "arc-up",   label: "קשת ↑",     icon: "⌒" },
  { value: "arc-down", label: "קשת ↓",     icon: "⌣" },
  { value: "arch",     label: "כיפה",      icon: "∩" },
  { value: "bulge",    label: "בליטה",     icon: "◠" },
  { value: "wave",     label: "גל ~",      icon: "∿" },
  { value: "circle",   label: "עיגול",     icon: "○" },
] as const;

const TEXTURE_OPTIONS = [
  { value: "none",      label: "ללא",  desc: "" },
  { value: "gold-foil", label: "זהב",  desc: "🥇", bg: "linear-gradient(135deg,#BF953F,#FCF6BA,#B38728,#FBF5B7,#AA771C)" },
  { value: "silver",    label: "כסף",  desc: "🥈", bg: "linear-gradient(135deg,#868686,#e8e8e8,#a0a0a0,#ffffff,#868686)" },
  { value: "fire",      label: "אש",   desc: "🔥", bg: "linear-gradient(135deg,#f12711,#f5af19)" },
  { value: "neon",      label: "ניאון", desc: "💜", bg: "linear-gradient(135deg,#b721ff,#21d4fd)" },
  { value: "rainbow",   label: "קשת",  desc: "🌈", bg: "linear-gradient(135deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f)" },
] as const;

interface GradientPreset {
  id: string;
  name: string;
  from: string;
  to: string;
  angle: number;
  mid?: string;
}
interface GradientCategory {
  id: string;
  label: string;
  emoji: string;
  presets: GradientPreset[];
}

const GRADIENT_LIBRARY: GradientCategory[] = [
  {
    id: "gold",
    label: "זהב ויוקרה",
    emoji: "✨",
    presets: [
      { id: "gold-classic",  name: "זהב קלאסי",   from: "#BF953F", to: "#FCF6BA", angle: 135 },
      { id: "gold-royal",    name: "זהב מלכותי",  from: "#D6A84F", to: "#7B4F12", angle: 160 },
      { id: "champagne",     name: "שמפניה",       from: "#F7E7CE", to: "#C9A857", angle: 120 },
      { id: "platinum",      name: "פלטינום",      from: "#8E8E8E", to: "#E8E8E8", angle: 135 },
      { id: "copper",        name: "נחושת",        from: "#B87333", to: "#F4A460", angle: 145 },
      { id: "bronze",        name: "ברונזה",       from: "#614E1A", to: "#D4A853", angle: 130 },
      { id: "antique-gold",  name: "זהב עתיק",    from: "#C6902E", to: "#FFF8DC", angle: 90 },
    ],
  },
  {
    id: "fire",
    label: "אש ולהבה",
    emoji: "🔥",
    presets: [
      { id: "fire-classic",  name: "אש קלאסית",   from: "#f12711", to: "#f5af19", angle: 135 },
      { id: "lava",          name: "לבה",          from: "#8B0000", to: "#FF4500", angle: 160 },
      { id: "sunset-red",    name: "שקיעה אדומה", from: "#FF416C", to: "#FF4B2B", angle: 120 },
      { id: "summer",        name: "קיץ",          from: "#FF512F", to: "#DD2476", angle: 135 },
      { id: "rays",          name: "קרני שמש",    from: "#F7971E", to: "#FFD200", angle: 90 },
      { id: "volcano",       name: "וולקאנו",      from: "#4B0000", to: "#FF0000", angle: 150 },
      { id: "ember",         name: "גחלים",        from: "#C0392B", to: "#F39C12", angle: 135 },
    ],
  },
  {
    id: "sky",
    label: "שמיים ולילה",
    emoji: "🌌",
    presets: [
      { id: "ocean-deep",    name: "ים עמוק",      from: "#1565C0", to: "#00BCD4", angle: 135 },
      { id: "sapphire",      name: "ספיר",         from: "#1A237E", to: "#64B5F6", angle: 150 },
      { id: "night-sky",     name: "שמיים בלילה", from: "#0F0C29", to: "#302B63", angle: 160 },
      { id: "twilight",      name: "בין-ערביים",  from: "#2C3E50", to: "#4CA1AF", angle: 135 },
      { id: "azure",         name: "תכלת",         from: "#0575E6", to: "#021B79", angle: 145 },
      { id: "arctic",        name: "ארקטי",        from: "#B0E0E6", to: "#1565C0", angle: 135 },
      { id: "midnight",      name: "חצות",         from: "#09203F", to: "#537895", angle: 155 },
    ],
  },
  {
    id: "nature",
    label: "טבע ורענן",
    emoji: "🌿",
    presets: [
      { id: "forest",        name: "יער",          from: "#134E5E", to: "#71B280", angle: 135 },
      { id: "leaves",        name: "עלים",         from: "#56AB2F", to: "#A8E063", angle: 120 },
      { id: "emerald",       name: "אמרלד",        from: "#0F9B58", to: "#00F260", angle: 135 },
      { id: "sea-breeze",    name: "רוח ים",       from: "#00B4DB", to: "#0083B0", angle: 145 },
      { id: "spring",        name: "אביב",         from: "#43C6AC", to: "#F8FFAE", angle: 130 },
      { id: "jungle",        name: "ג׳ונגל",       from: "#1D4350", to: "#A43931", angle: 150 },
      { id: "mint",          name: "מנטה",         from: "#00B09B", to: "#96C93D", angle: 135 },
    ],
  },
  {
    id: "romantic",
    label: "רומנטי ועדין",
    emoji: "🌸",
    presets: [
      { id: "rose",          name: "ורד",          from: "#FF9A9E", to: "#FECFEF", angle: 135 },
      { id: "lavender",      name: "לבנדר",        from: "#A18CD1", to: "#FBC2EB", angle: 150 },
      { id: "blush",         name: "סומק",         from: "#FFB7C5", to: "#FF6B9D", angle: 120 },
      { id: "peach",         name: "אפרסק",        from: "#FDDB92", to: "#D1FDFF", angle: 135 },
      { id: "cotton-candy",  name: "צמר גפן",     from: "#f794a4", to: "#fdd6bd", angle: 145 },
      { id: "dusty-rose",    name: "ורד עתיק",    from: "#C79081", to: "#DFA579", angle: 130 },
      { id: "sakura",        name: "סקורה",        from: "#FFC0CB", to: "#FF69B4", angle: 135 },
    ],
  },
  {
    id: "mystic",
    label: "מסתורי ואפל",
    emoji: "🔮",
    presets: [
      { id: "deep-purple",   name: "סגול כהה",    from: "#4A1942", to: "#C74B50", angle: 135 },
      { id: "galaxy",        name: "גלקסיה",       from: "#200122", to: "#6f0000", angle: 160 },
      { id: "shadow",        name: "צל",           from: "#0F0C29", to: "#24243E", angle: 150 },
      { id: "amethyst",      name: "אמתיסט",      from: "#9D50BB", to: "#6E48AA", angle: 135 },
      { id: "eggplant",      name: "חציל",         from: "#0A0A2A", to: "#4A0E8F", angle: 145 },
      { id: "charcoal",      name: "פחם",          from: "#2C2C2C", to: "#6B6B6B", angle: 135 },
      { id: "void",          name: "חלל",          from: "#1A1A2E", to: "#16213E", angle: 160 },
    ],
  },
];

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
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    if (open) { setOpen(false); return; }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setDropPos({ top: rect.bottom + 4, left: Math.max(4, rect.right - 192) });
    setOpen(true);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="flex items-center gap-1.5 h-7 px-2 rounded-md border border-primary/15 hover:border-primary/40 bg-background text-xs text-foreground transition-colors"
      >
        <span className="w-4 h-4 rounded-sm border border-white/20 shrink-0"
          style={{ background: value || "transparent", boxShadow: !value ? "inset 0 0 0 1px rgba(200,200,200,0.3)" : undefined }} />
        <span className="text-xs">{label}</span>
        {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
      </button>
      {open && dropPos && (
        <div
          style={{ position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 9999 }}
          className="bg-card border border-primary/20 rounded-xl shadow-2xl p-2 w-48"
          onMouseDown={e => e.stopPropagation()}
        >
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
  const external = value ?? defaultValue;
  const [local, setLocal] = useState(external);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { setLocal(external); }, [external]);

  const handleChange = useCallback((newVal: number) => {
    setLocal(newVal);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(newVal), 40);
  }, [onChange]);

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : ""}`}>
      <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{label}:</span>
      <input type="range" min={min} max={max} step={step} value={local}
        onChange={e => handleChange(Number(e.target.value))}
        className="flex-1 h-1 accent-primary" />
      <span className="text-[10px] text-muted-foreground w-10 text-left shrink-0">{local}{unit}</span>
      {local !== defaultValue && (
        <button onClick={() => { setLocal(defaultValue); onChange(defaultValue); }}
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
  const [fontDropPos, setFontDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const fontBtnRef = useRef<HTMLButtonElement>(null);
  const [gradientCat, setGradientCat] = useState(GRADIENT_LIBRARY[0].id);
  const [presetCat, setPresetCat] = useState<string>("metal");
  const s = style;

  const applyStylePreset = (preset: StylePreset) => {
    onChange({
      // Clear conflicting modes first
      extrudeEnabled: false,
      longShadowEnabled: false,
      glow: false,
      shadow: false,
      gradientEnabled: false,
      preset3D: undefined,
      mode3D: false,
      ...preset.style,
    });
  };

  useEffect(() => {
    if (!fontOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (fontBtnRef.current && !fontBtnRef.current.contains(e.target as Node)) setFontOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fontOpen]);

  const customFonts = fonts.filter(f => f.category === "custom");
  const serifFonts  = fonts.filter(f => f.category === "serif");
  const sansFonts   = fonts.filter(f => f.category === "sans");
  const localFonts  = fonts.filter(f => f.category === "local");

  const hasShadow = !!(s.shadow || s.shadowX || s.shadowY || s.shadowColor);
  const hasExtrude = !!s.extrudeEnabled;
  const hasLongShadow = !!s.longShadowEnabled;
  const has3D = !!(s.preset3D && s.preset3D !== "none");

  const applyPreset3D = (preset: Preset3DConfig) => {
    onChange({
      preset3D: preset.id,
      depth3D: preset.defaultDepth,
      lightAngle3D: preset.defaultAngle,
      shadowStr3D: preset.defaultShadowStr,
      highlight3D: preset.defaultHighlight,
      glow3D: preset.defaultGlow,
      color: preset.color,
      gradientEnabled: preset.gradientEnabled,
      gradientFrom: preset.gradientFrom,
      gradientTo: preset.gradientTo,
      gradientAngle: preset.gradientAngle,
      strokeColor: preset.strokeColor,
      strokeWidth: preset.strokeWidth,
      glowColor: preset.glowColor,
      extrudeEnabled: false,
      longShadowEnabled: false,
    });
  };

  const clear3D = () => {
    onChange({
      preset3D: undefined,
      depth3D: undefined,
      lightAngle3D: undefined,
      shadowStr3D: undefined,
      highlight3D: undefined,
      glow3D: undefined,
      glowColor: undefined,
      gradientEnabled: false,
      gradientFrom: undefined,
      gradientTo: undefined,
      strokeColor: undefined,
      strokeWidth: undefined,
    });
  };
  const hasGlow = !!(s.glow || s.glowColor || s.glowRadius);
  const hasGradient = !!s.gradientEnabled;
  const hasTexture = !!(s.textureType && s.textureType !== "none");
  const hasStroke = !!(s.strokeWidth && s.strokeWidth > 0);
  const hasGlass = !!s.glassEnabled;
  const hasWarp = !!(s.warpType && s.warpType !== "none");
  const hasTransform = !!(s.rotation || s.skewX || s.skewY);
  const hasBlend = !!(s.blendMode && s.blendMode !== "normal");

  const filteredPresets = STYLE_PRESETS.filter(p => p.category === presetCat);

  return (
    <div className="mt-2 space-y-1.5" dir="rtl">

      {/* ── סגנונות מהירים ─────────────────────────────────────────── */}
      <Section title="✨ פריסטים פרמיום" defaultOpen={false}>
        {/* Category tabs */}
        <div className="flex gap-1 flex-wrap">
          {STYLE_PRESET_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setPresetCat(cat.id)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                presetCat === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-primary/20 text-muted-foreground hover:bg-primary/10"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Preset grid — 3 columns */}
        <div className="grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto pr-0.5">
          {filteredPresets.map(preset => {
            const isActive =
              (preset.style.preset3D && s.preset3D === preset.style.preset3D) ||
              (!preset.style.preset3D && s.color === preset.style.color && !s.preset3D);

            const previewTextStyle: React.CSSProperties = (() => {
              const st = preset.style;
              let shadow = "none";
              if (st.preset3D && st.preset3D !== "none") {
                const p3 = PRESETS_3D.find(p => p.id === st.preset3D);
                if (p3) {
                  shadow = build3DShadows(
                    p3.id, p3.defaultAngle,
                    Math.min(p3.defaultDepth, 3),
                    p3.defaultShadowStr, p3.defaultHighlight,
                    p3.defaultGlow, st.glowColor || p3.glowColor || p3.color,
                  ).join(", ");
                }
              } else if (st.shadow) {
                shadow = `${st.shadowX ?? 1}px ${st.shadowY ?? 1}px ${st.shadowBlur ?? 3}px ${st.shadowColor ?? "rgba(0,0,0,0.6)"}`;
              }
              if (st.glow && st.glowColor) {
                const r = st.glowRadius ?? 10;
                const gShadow = `0 0 ${r}px ${st.glowColor}, 0 0 ${r * 2}px ${st.glowColor}`;
                shadow = shadow === "none" ? gShadow : `${shadow}, ${gShadow}`;
              }
              const base: React.CSSProperties = {
                fontFamily: "'Frank Ruhl Libre', serif",
                fontSize: 22,
                fontWeight: 900,
                lineHeight: 1,
                userSelect: "none",
                textShadow: shadow,
              };
              if (st.gradientEnabled && st.gradientFrom && st.gradientTo) {
                return {
                  ...base,
                  color: "transparent",
                  backgroundImage: `linear-gradient(${st.gradientAngle ?? 160}deg, ${st.gradientFrom}, ${st.gradientTo})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                };
              }
              return { ...base, color: st.color || "#ffffff" };
            })();

            return (
              <button key={preset.id} onClick={() => applyStylePreset(preset)}
                className={`relative flex flex-col items-center rounded-xl border p-1 transition-all duration-200 ${
                  isActive
                    ? "border-primary bg-primary/15 shadow-md shadow-primary/20"
                    : "border-primary/15 hover:border-primary/40 bg-background/40 hover:bg-primary/5"
                }`}
              >
                <div className="w-full rounded-lg flex items-center justify-center overflow-hidden mb-0.5"
                  style={{ height: 38, background: preset.previewBg }}>
                  <span style={previewTextStyle}>הדר</span>
                </div>
                <span className="text-[8.5px] font-semibold text-center leading-tight text-muted-foreground truncate w-full text-center">
                  {preset.name}
                </span>
                {isActive && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[7px] text-white font-bold">✓</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── גופן ואותיות ───────────────────────────────────────────── */}
      <Section title="גופן ואותיות" defaultOpen={true}
        active={!!(s.fontFamily || s.fontSize || s.color || s.bold || s.italic || s.underline)}>

        {/* Font picker */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <button
              ref={fontBtnRef}
              onClick={() => {
                if (fontOpen) { setFontOpen(false); return; }
                const rect = fontBtnRef.current?.getBoundingClientRect();
                if (rect) setFontDropPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 208) });
                setFontOpen(true);
              }}
              className="w-full flex items-center justify-between gap-1 h-7 px-2 rounded-md border border-primary/15 hover:border-primary/40 bg-background text-xs text-foreground transition-colors"
            >
              <span className="truncate" style={{ fontFamily: s.fontFamily ? `'${s.fontFamily}', serif` : undefined }}>
                {s.fontFamily || "גופן..."}
              </span>
              {fontOpen ? <ChevronUp className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />}
            </button>
            {fontOpen && fontDropPos && (
              <div
                style={{ position: "fixed", top: fontDropPos.top, left: fontDropPos.left, width: fontDropPos.width, zIndex: 9999, maxHeight: 240 }}
                className="bg-card border border-primary/20 rounded-xl shadow-2xl overflow-y-auto"
                onMouseDown={e => e.stopPropagation()}
              >
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
              const cur = typeof s.fontSize === "number" && s.fontSize > 0 ? s.fontSize : 16;
              onChange({ fontSize: Math.max(8, cur - (cur > 24 ? 2 : 1)) });
            }} className="w-5 h-7 flex items-center justify-center rounded border border-primary/15 hover:bg-primary/10 text-primary font-bold text-sm">−</button>
            <input
              type="number"
              min={8}
              max={200}
              value={typeof s.fontSize === "number" ? s.fontSize : ""}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 8 && v <= 200) onChange({ fontSize: v });
              }}
              className="h-7 w-14 text-center text-xs rounded border border-primary/15 bg-background text-foreground px-1"
            />
            <button onClick={() => {
              const cur = typeof s.fontSize === "number" && s.fontSize > 0 ? s.fontSize : 16;
              onChange({ fontSize: Math.min(200, cur + (cur >= 24 ? 2 : 1)) });
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

      {/* ── תלת-מימד פרמיום ────────────────────────────────────────── */}
      <Section title="✦ תלת-מימד פרמיום" active={has3D} defaultOpen={has3D}
        badge={has3D ? (PRESETS_3D.find(p => p.id === s.preset3D)?.name ?? "פעיל") : undefined}>

        {/* Preset grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS_3D.map(preset => {
            const active = s.preset3D === preset.id;
            const shadows = build3DShadows(
              preset.id, preset.defaultAngle,
              Math.min(preset.defaultDepth, 4),
              preset.defaultShadowStr, preset.defaultHighlight,
              preset.defaultGlow, preset.glowColor || preset.color,
            ).join(", ");
            const isGrad = !!(preset.gradientEnabled && preset.gradientFrom && preset.gradientTo);
            const thumbTextStyle: React.CSSProperties = isGrad ? {
              fontFamily: "'Frank Ruhl Libre', 'David Libre', serif",
              fontSize: "26px",
              fontWeight: 900,
              lineHeight: 1,
              textShadow: shadows,
              userSelect: "none",
              color: "transparent",
              backgroundImage: `linear-gradient(${preset.gradientAngle ?? 160}deg, ${preset.gradientFrom}, ${preset.gradientTo})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            } : {
              fontFamily: "'Frank Ruhl Libre', 'David Libre', serif",
              fontSize: "26px",
              fontWeight: 900,
              lineHeight: 1,
              textShadow: shadows,
              color: preset.color,
              userSelect: "none",
            };
            return (
              <button key={preset.id} onClick={() => applyPreset3D(preset)}
                className={`relative flex flex-col items-center rounded-xl border p-1.5 transition-all duration-200
                  ${active
                    ? "border-primary bg-primary/15 shadow-md shadow-primary/20"
                    : "border-primary/15 hover:border-primary/40 bg-background/40 hover:bg-primary/5"}`}
              >
                <div
                  className="w-full rounded-lg flex items-center justify-center overflow-hidden mb-1"
                  style={{ height: 44, background: preset.thumbnailBg ?? "#0B1833" }}
                >
                  <span style={thumbTextStyle}>הדר</span>
                </div>
                <span className="text-[9px] font-semibold text-center leading-tight text-muted-foreground">{preset.name}</span>
                {active && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold leading-none">✓</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Clear button */}
        {has3D && (
          <button onClick={clear3D}
            className="w-full text-[10px] text-muted-foreground hover:text-foreground border border-primary/15 hover:border-primary/30 rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3 h-3" /> הסר תלת-מימד
          </button>
        )}

        {/* Fine-tune sliders */}
        {has3D && (
          <div className="space-y-1.5 pr-2 border-r-2 border-primary/30 pt-1">
            <p className="text-[9px] font-semibold text-primary/70 uppercase tracking-wider">כוונון עדין</p>
            <SliderRow label="עומק" min={1} max={20} step={1}
              value={s.depth3D} defaultValue={PRESETS_3D.find(p => p.id === s.preset3D)?.defaultDepth ?? 6}
              onChange={v => onChange({ depth3D: v })} unit="px" />
            <SliderRow label="זווית אור" min={0} max={345} step={15}
              value={s.lightAngle3D} defaultValue={PRESETS_3D.find(p => p.id === s.preset3D)?.defaultAngle ?? 45}
              onChange={v => onChange({ lightAngle3D: v })} unit="°" />
            <SliderRow label="חוזק צל" min={0} max={100} step={5}
              value={s.shadowStr3D} defaultValue={PRESETS_3D.find(p => p.id === s.preset3D)?.defaultShadowStr ?? 70}
              onChange={v => onChange({ shadowStr3D: v })} />
            <SliderRow label="הברקה" min={0} max={100} step={5}
              value={s.highlight3D} defaultValue={PRESETS_3D.find(p => p.id === s.preset3D)?.defaultHighlight ?? 60}
              onChange={v => onChange({ highlight3D: v })} />
            <SliderRow label="זוהר" min={0} max={100} step={5}
              value={s.glow3D} defaultValue={PRESETS_3D.find(p => p.id === s.preset3D)?.defaultGlow ?? 0}
              onChange={v => onChange({ glow3D: v })} />
          </div>
        )}

        {!has3D && !s.mode3D && (
          <p className="text-[10px] text-muted-foreground text-center py-1">
            בחר סגנון כדי להפוך את הטקסט לתלת-מימד
          </p>
        )}

        {/* ── 3D Engine divider ─────────────────────── */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-px bg-primary/15" />
          <span className="text-[9px] font-semibold text-primary/50 uppercase tracking-widest">מנוע תלת-מימד אמיתי</span>
          <div className="flex-1 h-px bg-primary/15" />
        </div>

        {/* 2D / 3D engine toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange({ mode3D: false })}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
              !s.mode3D
                ? "bg-primary/20 text-primary border-primary/40"
                : "border-primary/15 text-muted-foreground hover:bg-primary/10"
            }`}
          >
            2D מצב
          </button>
          <button
            onClick={() => onChange({ mode3D: true, material3D: s.material3D ?? "gold", depth3DEngine: s.depth3DEngine ?? 8, bevel3D: s.bevel3D ?? 3 })}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
              s.mode3D
                ? "bg-primary/20 text-primary border-primary/40"
                : "border-primary/15 text-muted-foreground hover:bg-primary/10"
            }`}
          >
            ✦ 3D מצב
          </button>
        </div>

        {/* Three.js 3D engine panel */}
        {s.mode3D && (
          <div className="space-y-2.5">
            {/* Live Three.js preview */}
            <Text3DCanvas
              text="הדר"
              fontFamily={s.fontFamily}
              fontSize={s.fontSize ?? 40}
              bold={s.bold}
              color={s.color}
              gradientEnabled={s.gradientEnabled}
              gradientFrom={s.gradientFrom}
              gradientTo={s.gradientTo}
              gradientAngle={s.gradientAngle}
              material3D={s.material3D ?? "gold"}
              depth={s.depth3DEngine ?? 8}
              bevel={s.bevel3D ?? 3}
              cameraAngleX={s.cameraAngleX ?? 12}
              cameraAngleY={s.cameraAngleY ?? -18}
              autoRotate={s.autoRotate3D}
            />

            {/* Material preset buttons */}
            <div className="space-y-1">
              <p className="text-[9px] font-semibold text-primary/60 uppercase tracking-wider">חומר</p>
              <div className="grid grid-cols-3 gap-1">
                {MATERIAL_3D_OPTIONS.map(mat => (
                  <button key={mat.id}
                    onClick={() => onChange({ material3D: mat.id })}
                    className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border text-[9px] font-medium transition-all ${
                      (s.material3D ?? "gold") === mat.id
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-primary/15 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                      style={{ background: mat.color }} />
                    {mat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D sliders */}
            <div className="space-y-1.5 pr-2 border-r-2 border-primary/30">
              <SliderRow label="עומק" min={1} max={30} step={1}
                value={s.depth3DEngine} defaultValue={8}
                onChange={v => onChange({ depth3DEngine: v })} unit="px" />
              <SliderRow label="בֵּוֶל" min={0} max={10} step={1}
                value={s.bevel3D} defaultValue={3}
                onChange={v => onChange({ bevel3D: v })} />
              <SliderRow label="הטיה אנכית" min={-30} max={30} step={1}
                value={s.cameraAngleX} defaultValue={12}
                onChange={v => onChange({ cameraAngleX: v })} unit="°" />
              <SliderRow label="סיבוב אופקי" min={-60} max={60} step={1}
                value={s.cameraAngleY} defaultValue={-18}
                onChange={v => onChange({ cameraAngleY: v })} unit="°" />
            </div>

            {/* Auto-rotate toggle */}
            <div className="flex items-center gap-2">
              <ToggleChip label="סיבוב אוטומטי" active={!!s.autoRotate3D} onClick={() => onChange({ autoRotate3D: !s.autoRotate3D })} />
              <span className="text-[9px] text-muted-foreground">מסתובב אוטומטית</span>
            </div>
          </div>
        )}
      </Section>

      {/* ── צל ועומק ───────────────────────────────────────────────── */}
      <Section title="צל ועומק" active={hasShadow || hasExtrude || hasLongShadow}
        badge={[hasShadow && "צל", hasExtrude && "3D קלאסי", hasLongShadow && "ארוך"].filter(Boolean).join(" + ") || undefined}>

        {/* Basic shadow toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <ToggleChip label="צל" active={!!s.shadow} onClick={() => onChange({ shadow: !s.shadow })} />
          <ToggleChip label="3D קלאסי" active={hasExtrude} onClick={() => onChange({ extrudeEnabled: !s.extrudeEnabled })} />
          <ToggleChip label="צל ארוך" active={hasLongShadow} onClick={() => onChange({ longShadowEnabled: !s.longShadowEnabled })} />
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

        {/* ──── GRADIENT LIBRARY ──────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">ספריית גרדיאנטים</span>
            {hasGradient && (
              <button onClick={() => onChange({ gradientEnabled: false })}
                className="text-[10px] text-primary/60 hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-primary/10">
                ✕ נקה
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {GRADIENT_LIBRARY.map(cat => (
              <button key={cat.id}
                onClick={() => setGradientCat(cat.id)}
                className={`flex-none flex items-center gap-1 px-2 py-1 rounded-full text-[10px] border whitespace-nowrap transition-all ${gradientCat === cat.id ? "bg-primary/20 text-primary border-primary/40 font-semibold" : "border-primary/10 text-muted-foreground hover:bg-primary/8"}`}>
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Gradient swatches grid */}
          {GRADIENT_LIBRARY.filter(c => c.id === gradientCat).map(cat => (
            <div key={cat.id} className="grid grid-cols-4 gap-1.5">
              {cat.presets.map(p => {
                const isActive = hasGradient && s.gradientFrom === p.from && s.gradientTo === p.to;
                return (
                  <button key={p.id}
                    title={p.name}
                    onClick={() => onChange({
                      gradientEnabled: true,
                      gradientFrom: p.from,
                      gradientTo: p.to,
                      gradientAngle: p.angle,
                    })}
                    className={`group relative rounded-lg overflow-hidden border-2 transition-all ${isActive ? "border-primary scale-105 shadow-lg shadow-primary/30" : "border-transparent hover:border-primary/50 hover:scale-102"}`}
                    style={{ height: 40 }}
                  >
                    <div className="absolute inset-0" style={{ background: `linear-gradient(${p.angle}deg, ${p.from}, ${p.to})` }} />
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="text-white text-[10px]">✓</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1 pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-[8px] leading-tight block truncate text-center">{p.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Active gradient preview + manual tweaks */}
          {hasGradient && (
            <div className="space-y-1.5 pt-1 border-t border-primary/10">
              {/* Live preview bar */}
              <div className="h-5 rounded-md border border-primary/15" style={{
                background: `linear-gradient(${s.gradientAngle ?? 90}deg, ${s.gradientFrom || "#D6A84F"}, ${s.gradientTo || "#F8F1E3"})`
              }} />
              {/* Manual fine-tune */}
              <div className="flex items-center gap-2 flex-wrap">
                <ColorSwatch value={s.gradientFrom} onChange={v => onChange({ gradientFrom: v || "#D6A84F" })} label="מ-" />
                <ColorSwatch value={s.gradientTo} onChange={v => onChange({ gradientTo: v || "#F8F1E3" })} label="ל-" />
              </div>
              <SliderRow label="זווית" min={0} max={360} step={15} value={s.gradientAngle} defaultValue={90} onChange={v => onChange({ gradientAngle: v })} unit="°" />
            </div>
          )}
        </div>

        {/* ──── TEXTURE LIBRARY ───────────────────────────── */}
        <div className="space-y-1.5 pt-1 border-t border-primary/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">מרקמים מיוחדים</span>
            {hasTexture && (
              <button onClick={() => onChange({ textureType: "none" })}
                className="text-[10px] text-primary/60 hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-primary/10">
                ✕ נקה
              </button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-1">
            {TEXTURE_OPTIONS.map(t => {
              const isActive = (s.textureType || "none") === t.value;
              return (
                <button key={t.value}
                  title={t.label}
                  onClick={() => onChange({ textureType: t.value as SlotStyle["textureType"] })}
                  className={`relative flex flex-col items-center gap-0.5 rounded-lg p-1 border-2 transition-all ${isActive ? "border-primary scale-105 shadow-md shadow-primary/30" : "border-transparent hover:border-primary/40"}`}
                >
                  {t.value === "none" ? (
                    <div className="w-full h-7 rounded flex items-center justify-center border border-primary/15 text-muted-foreground" style={{ fontSize: 9 }}>ללא</div>
                  ) : (
                    <div className="w-full h-7 rounded" style={{ background: t.bg ?? "#888" }} />
                  )}
                  <span className="text-[8px] text-muted-foreground leading-tight truncate w-full text-center">
                    {t.value !== "none" ? t.desc : ""}{t.label}
                  </span>
                </button>
              );
            })}
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
        {/* Type grid */}
        <div className="grid grid-cols-4 gap-1">
          {WARP_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => onChange({ warpType: opt.value as SlotStyle["warpType"] })}
              className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-[10px] border transition-all ${(s.warpType || "none") === opt.value ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}>
              <span className="text-base leading-none">{opt.icon}</span>
              <span className="leading-tight text-center">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        {hasWarp && (
          <>
            <SliderRow
              label="עוצמה"
              min={1} max={100} step={1}
              value={s.warpAmount ?? (s.arcDegrees != null ? Math.abs(s.arcDegrees) : 40)}
              defaultValue={40}
              onChange={v => onChange({ warpAmount: v, arcDegrees: v })}
              unit=""
            />
            <button
              onClick={() => onChange({ warpType: "none", warpAmount: 40, arcDegrees: 0 })}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-primary/15 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              איפוס עיקום
            </button>

            {/* Live preview */}
            <div className="bg-black/30 rounded-xl p-3 flex items-center justify-center overflow-hidden border border-primary/10" style={{ minHeight: 80 }}>
              <SvgWarpText
                text="דוגמת טקסט"
                warpType={(s.warpType as any) || "arc-up"}
                warpAmount={s.warpAmount ?? (s.arcDegrees != null ? Math.abs(s.arcDegrees) : 40)}
                cssStyle={{
                  fontSize: Math.min(s.fontSize ?? 18, 22),
                  fontFamily: s.fontFamily ? `'${s.fontFamily}', serif` : "serif",
                  fontWeight: s.bold ? 700 : 400,
                  color: s.color || "#D6A84F",
                }}
                pathWidth={200}
              />
            </div>
          </>
        )}
      </Section>

    </div>
  );
}
