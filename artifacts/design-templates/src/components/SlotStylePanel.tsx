import { useState } from "react";
import { Bold, Italic, Underline, ChevronDown, ChevronUp } from "lucide-react";
import { HEBREW_FONTS } from "@/lib/fonts";

export interface SlotStyle {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: number;
  shadow?: boolean;
  glow?: boolean;
  outline?: boolean;
  arcDegrees?: number;
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

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 60, 72];

interface Props {
  slotId: string;
  style: SlotStyle;
  onChange: (patch: Partial<SlotStyle>) => void;
}

export function SlotStylePanel({ slotId: _slotId, style, onChange }: Props) {
  const [fontOpen, setFontOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const s = style;

  return (
    <div className="mt-2 border-t border-primary/10 pt-2 space-y-2" dir="rtl">
      {/* Row 1: Font + Size */}
      <div className="flex items-center gap-2">
        {/* Font family */}
        <div className="flex-1 relative">
          <button
            onClick={() => { setFontOpen(o => !o); setColorOpen(false); }}
            className="w-full flex items-center justify-between gap-1 h-7 px-2 rounded-md border border-primary/15 hover:border-primary/40 bg-background text-xs text-foreground transition-colors"
          >
            <span className="truncate" style={{ fontFamily: s.fontFamily ? `'${s.fontFamily}', serif` : undefined }}>
              {s.fontFamily || "גופן..."}
            </span>
            {fontOpen ? <ChevronUp className="w-3 h-3 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 shrink-0 text-muted-foreground" />}
          </button>
          {fontOpen && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-card border border-primary/20 rounded-xl shadow-2xl overflow-y-auto w-48" style={{ maxHeight: 200 }}>
              <button
                className="w-full text-right px-3 py-1.5 hover:bg-primary/10 text-xs text-muted-foreground"
                onClick={() => { onChange({ fontFamily: undefined }); setFontOpen(false); }}
              >ברירת מחדל</button>
              {HEBREW_FONTS.map(f => (
                <button
                  key={f.family}
                  className="w-full text-right px-3 py-2 hover:bg-primary/10 text-sm border-t border-primary/5"
                  style={{ fontFamily: `'${f.family}', serif` }}
                  onClick={() => { onChange({ fontFamily: f.family }); setFontOpen(false); }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font size */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              const idx = FONT_SIZES.indexOf(s.fontSize ?? 0);
              const prev = idx > 0 ? FONT_SIZES[idx - 1] : (s.fontSize ? Math.max(8, (s.fontSize ?? 14) - 2) : 12);
              onChange({ fontSize: prev });
            }}
            className="w-5 h-7 flex items-center justify-center rounded border border-primary/15 hover:bg-primary/10 text-primary font-bold text-sm transition-colors"
          >−</button>
          <select
            value={s.fontSize ?? ""}
            onChange={e => onChange({ fontSize: e.target.value ? Number(e.target.value) : undefined })}
            className="h-7 w-12 text-center text-xs rounded border border-primary/15 bg-background text-foreground px-0"
          >
            <option value="">גודל</option>
            {FONT_SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
          </select>
          <button
            onClick={() => {
              const idx = FONT_SIZES.indexOf(s.fontSize ?? 0);
              const next = idx >= 0 && idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : (s.fontSize ? Math.min(96, (s.fontSize ?? 14) + 2) : 18);
              onChange({ fontSize: next });
            }}
            className="w-5 h-7 flex items-center justify-center rounded border border-primary/15 hover:bg-primary/10 text-primary font-bold text-sm transition-colors"
          >+</button>
        </div>
      </div>

      {/* Row 2: Color + B/I/U */}
      <div className="flex items-center gap-2">
        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => { setColorOpen(o => !o); setFontOpen(false); }}
            className="flex items-center gap-1.5 h-7 px-2 rounded-md border border-primary/15 hover:border-primary/40 bg-background text-xs text-foreground transition-colors"
          >
            <span className="w-4 h-4 rounded-sm border border-white/20 shrink-0" style={{ background: s.color || "transparent", boxShadow: !s.color ? "inset 0 0 0 1px rgba(200,200,200,0.3)" : undefined }} />
            <span className="text-xs">צבע</span>
            {colorOpen ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
          </button>
          {colorOpen && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-card border border-primary/20 rounded-xl shadow-2xl p-2 w-44">
              <div className="grid grid-cols-5 gap-1 mb-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => { onChange({ color: c.value || undefined }); setColorOpen(false); }}
                    title={c.label}
                    className={`w-full aspect-square rounded-md border-2 transition-all ${s.color === c.value ? "border-primary scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ background: c.value || "transparent", boxShadow: !c.value ? "inset 0 0 0 1px rgba(200,200,200,0.3)" : undefined }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-muted-foreground shrink-0">מותאם:</label>
                <input
                  type="color"
                  value={s.color || "#ffffff"}
                  onChange={e => onChange({ color: e.target.value })}
                  className="h-7 w-full rounded cursor-pointer border border-primary/15"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bold / Italic / Underline */}
        <div className="flex items-center gap-1">
          {([
            { key: "bold" as const, icon: <Bold className="w-3 h-3" />, label: "מודגש" },
            { key: "italic" as const, icon: <Italic className="w-3 h-3" />, label: "נטוי" },
            { key: "underline" as const, icon: <Underline className="w-3 h-3" />, label: "קו תחתון" },
          ]).map(({ key, icon, label }) => (
            <button
              key={key}
              title={label}
              onClick={() => onChange({ [key]: !s[key] })}
              className={`w-7 h-7 flex items-center justify-center rounded border transition-all ${s[key] ? "bg-primary text-primary-foreground border-primary" : "border-primary/15 text-muted-foreground hover:bg-primary/10 hover:text-foreground"}`}
            >{icon}</button>
          ))}
        </div>

        {/* Letter spacing */}
        <div className="flex items-center gap-1 mr-auto">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">רווח:</span>
          <input
            type="range" min={-5} max={20} step={1}
            value={s.letterSpacing ?? 0}
            onChange={e => onChange({ letterSpacing: Number(e.target.value) })}
            className="w-16 h-1 accent-primary"
          />
        </div>
      </div>

      {/* Row 3: Effects */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground">אפקטים:</span>
        {([
          { key: "shadow" as const, label: "צל" },
          { key: "glow" as const, label: "זוהר" },
          { key: "outline" as const, label: "מסגרת" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange({ [key]: !s[key] })}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${s[key] ? "bg-primary/20 text-primary border-primary/40" : "border-primary/15 text-muted-foreground hover:bg-primary/10"}`}
          >{label}</button>
        ))}
      </div>

      {/* Row 4: Arc / Curve */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground shrink-0">קשת:</span>
        <input
          type="range" min={-70} max={70} step={5}
          value={s.arcDegrees ?? 0}
          onChange={e => onChange({ arcDegrees: Number(e.target.value) })}
          className="flex-1 h-1 accent-primary"
        />
        <span className="text-[10px] text-muted-foreground w-8 text-left shrink-0">{s.arcDegrees ?? 0}°</span>
        {(s.arcDegrees ?? 0) !== 0 && (
          <button
            onClick={() => onChange({ arcDegrees: 0 })}
            className="text-[10px] text-primary hover:text-primary/80 underline shrink-0"
          >אפס</button>
        )}
      </div>
    </div>
  );
}
