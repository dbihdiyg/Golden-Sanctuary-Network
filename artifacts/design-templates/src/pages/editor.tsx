import { useState, useCallback, useRef, useEffect, useId } from "react";
import { useParams, Link, useLocation, useSearch } from "wouter";
import { useAuth, useUser, SignInButton } from "@clerk/react";
import hadarLogo from "@/assets/logo-hadar.png";
import { ArrowRight, Crown, MessageCircle, Download, RotateCcw, CheckCircle2, ZoomIn, ZoomOut, Sun, Moon, Lock, Loader2, User, CreditCard, LogIn, Type, ChevronDown, ChevronUp, ImagePlus, X as XIcon, Upload, Layers, AlignLeft, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { templates, TextSlot } from "@/lib/data";
import { HEBREW_FONTS, loadGoogleFont } from "@/lib/fonts";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { ElementsPanel, PlacedElement, colorToFilter } from "@/components/ElementsPanel";
import { RichTextSlot } from "@/components/RichTextSlot";
import { SlotStylePanel, SlotStyle } from "@/components/SlotStylePanel";

export interface LogoPos { x: number; y: number; width: number; }

// ─── Local BA Hebrew fonts (uploaded by user) ─────────────────────────────────
const LOCAL_BA_FONTS: {
  name: string;
  family: string;
  files: { weight: number; src: string }[];
}[] = [
  { name: "ארזי הלבנון",    family: "BA Arzey Halevanon",   files: [{ weight: 300, src: "BAArzeyHalevanon-Light.ttf" }, { weight: 700, src: "BAArzeyHalevanon-Bold.ttf" }] },
  { name: "ברקאי",          family: "BA Barkai",             files: [{ weight: 400, src: "BABarkai-Regular.otf" }] },
  { name: "קזבלנקה",        family: "BA Casablanca",         files: [{ weight: 300, src: "BA-Casablanca-Light.otf" }] },
  { name: "פונטוב",         family: "BA Fontov",             files: [{ weight: 400, src: "BA-Fontov-Regular.otf" }, { weight: 700, src: "BA-Fontov-Bold.otf" }] },
  { name: "היצירה",         family: "BA HaYetzira",          files: [{ weight: 300, src: "BA-HaYetzira-Light.otf" }, { weight: 400, src: "BA-HaYetzira-Regular.otf" }] },
  { name: "קריית קודש",     family: "BA Kiriat Kodesh",      files: [{ weight: 700, src: "BA-Kiriat-Kodesh-Bold.otf" }] },
  { name: "מים חיים",       family: "BA Maim Haim",          files: [{ weight: 400, src: "BA-Maim-Haim-Regular.otf" }] },
  { name: "מסובין",         family: "BA Mesubin Rolltext",   files: [{ weight: 400, src: "BA-Mesubin-Rolltext.otf" }] },
  { name: "מומנט",          family: "BA Moment Original",    files: [{ weight: 400, src: "BA-Moment-Original.otf" }] },
  { name: "נפלאות",         family: "BA Niflaot",            files: [{ weight: 900, src: "BANiflaot-Black.ttf" }] },
  { name: "פלטפורמה",       family: "BA Platforma",          files: [{ weight: 300, src: "BAPlatforma-Light.otf" }, { weight: 700, src: "BAPlatforma-Bold.otf" }, { weight: 900, src: "BAPlatforma-Black.otf" }] },
  { name: "ראדלהיים",       family: "BA Radlheim",           files: [{ weight: 700, src: "BARadlheim-Bold.otf" }] },
  { name: "ראשון לציון",    family: "BA Rishon LeZion",      files: [{ weight: 400, src: "BARishonLezion-Regular.ttf" }] },
];

// merge local fonts into the shared list
LOCAL_BA_FONTS.forEach(f =>
  HEBREW_FONTS.push({ name: f.name, family: f.family, category: "local" })
);

const DEFAULT_FONT = "Frank Ruhl Libre";

function loadLocalFont(family: string) {
  const id = `lfont-${family.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const meta = LOCAL_BA_FONTS.find(f => f.family === family);
  if (!meta) return;
  const base = import.meta.env.BASE_URL; // e.g. "/design-templates/"
  const fmt = (src: string) => src.endsWith(".ttf") ? "truetype" : "opentype";
  const css = meta.files.map(f => `
    @font-face {
      font-family: '${meta.family}';
      src: url('${base}fonts/${f.src}') format('${fmt(f.src)}');
      font-weight: ${f.weight};
      font-style: normal;
      font-display: swap;
    }
  `).join("\n");
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

const TAB_LABELS: Record<"serif" | "sans" | "local", string> = {
  serif: "סריף",
  sans:  "סאנס",
  local: "עברית",
};

function FontSelector({ selected, onChange }: { selected: string; onChange: (f: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"serif" | "sans" | "local">("serif");

  const fonts = HEBREW_FONTS.filter(f => f.category === tab);

  function handlePick(font: (typeof HEBREW_FONTS)[0]) {
    if (font.category === "local") loadLocalFont(font.family);
    else loadGoogleFont(font.family);
    onChange(font.family);
  }

  return (
    <div className="border-b border-primary/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">פונט</span>
          <span className="text-xs text-muted-foreground" style={{ fontFamily: `'${selected}', serif` }}>
            {selected}
          </span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-3 bg-card/30">
          {/* Category tabs */}
          <div className="flex gap-1 mb-2.5">
            {(["serif", "sans", "local"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
          {/* Font list */}
          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
            {fonts.map(font => (
              <button
                key={font.family}
                onClick={() => handlePick(font)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-right transition-colors border ${
                  selected === font.family
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-transparent hover:border-primary/20 hover:bg-primary/5 text-foreground"
                }`}
              >
                {font.category === "local"
                  ? <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">BA</span>
                  : <span className="text-xs text-muted-foreground">{font.category === "serif" ? "סריף" : "סאנס"}</span>
                }
                <span className="text-base leading-tight" style={{ fontFamily: `'${font.family}', serif`, direction: "rtl" }}>
                  {font.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const previewFontSizePx: Record<string, number> = {
  xs: 9, sm: 11, md: 13, lg: 16, xl: 20, "2xl": 26,
};

function resolveColor(color?: string): string {
  if (color === "gold") return "#D6A84F";
  if (color === "dark") return "#0B1833";
  if (color === "cream") return "#F8F1E3";
  return "#F8F1E3";
}

function resolveFont(slotFamily: string | undefined, fontOverride: string): string {
  return `'${fontOverride}', ${slotFamily === "serif" ? "serif" : "sans-serif"}`;
}

function buildSlotCSS(
  slot: TextSlot,
  fontOverride: string,
  ss?: SlotStyle
): React.CSSProperties {
  const baseSz = previewFontSizePx[slot.fontSize || "sm"];
  const color = ss?.color || resolveColor(slot.color);
  const shadows: string[] = [];
  if (ss?.shadow) shadows.push("2px 2px 6px rgba(0,0,0,0.7)");
  if (ss?.glow) shadows.push(`0 0 10px ${color}, 0 0 20px ${color}80`);
  const fontFamily = ss?.fontFamily
    ? `'${ss.fontFamily}', serif`
    : resolveFont(slot.fontFamily, fontOverride);
  return {
    fontSize: ss?.fontSize ?? baseSz,
    fontFamily,
    fontWeight: (ss?.bold ?? slot.bold) ? 700 : 400,
    fontStyle: (ss?.italic ?? slot.italic) ? "italic" : "normal",
    textDecoration: ss?.underline ? "underline" : undefined,
    color,
    lineHeight: slot.lineHeight ?? 1.35,
    letterSpacing: ss?.letterSpacing ? `${ss.letterSpacing * 0.05}px` : undefined,
    textShadow: shadows.length ? shadows.join(", ") : undefined,
    WebkitTextStroke: ss?.outline ? `1px ${color}` : undefined,
  };
}

function SvgArcText({ text, arcDeg, cssStyle }: {
  text: string; arcDeg: number; cssStyle: React.CSSProperties;
}) {
  const uid = useId().replace(/:/g, "");
  const W = 280, H = 100;
  const absAngle = Math.abs(arcDeg) * Math.PI / 180;
  const r = absAngle < 0.05 ? 99999 : (W / 2) / Math.sin(absAngle / 2);
  const sagitta = r - Math.sqrt(Math.max(0, r * r - (W / 2) * (W / 2)));
  const isUp = arcDeg > 0;
  const sy = isUp ? sagitta : H - sagitta;
  const sweep = isUp ? 1 : 0;
  const pathD = `M 0 ${sy} A ${r} ${r} 0 0 ${sweep} ${W} ${sy}`;
  const fontSize = typeof cssStyle.fontSize === "number" ? cssStyle.fontSize : 14;
  const svgH = sagitta + fontSize * 1.4 + 4;

  return (
    <svg
      width={W} height={Math.max(H, svgH)}
      viewBox={`0 0 ${W} ${Math.max(H, svgH)}`}
      style={{ display: "block", overflow: "visible", direction: "rtl" }}
    >
      <defs><path id={uid} d={pathD} /></defs>
      <text
        fill={cssStyle.color as string}
        fontSize={fontSize}
        fontFamily={cssStyle.fontFamily as string}
        fontWeight={cssStyle.fontWeight as number}
        fontStyle={cssStyle.fontStyle as string}
        style={{ textShadow: cssStyle.textShadow, letterSpacing: cssStyle.letterSpacing as string }}
      >
        <textPath href={`#${uid}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </svg>
  );
}

function StackedLine({ slot, value, fontOverride, slotStyle }: {
  slot: TextSlot; value: string; fontOverride: string; slotStyle?: SlotStyle;
}) {
  if (!value.trim()) return null;
  const css = buildSlotCSS(slot, fontOverride, slotStyle);
  const arcDeg = slotStyle?.arcDegrees ?? 0;
  const plainText = value.replace(/<[^>]+>/g, "");

  if (arcDeg !== 0) {
    return (
      <div className="text-center my-0.5 w-full">
        <SvgArcText text={plainText} arcDeg={arcDeg} cssStyle={css} />
      </div>
    );
  }
  const isHtml = value.includes("<");
  return isHtml ? (
    <div className="text-center leading-snug my-0.5" style={css}
      dangerouslySetInnerHTML={{ __html: value }} />
  ) : (
    <div className="text-center leading-snug my-0.5 whitespace-pre-line" style={css}>
      {value}
    </div>
  );
}

function AbsoluteSlot({ slot, value, fontOverride, slotStyle }: {
  slot: TextSlot; value: string; fontOverride: string; slotStyle?: SlotStyle;
}) {
  if (!value.trim() || slot.x == null || slot.y == null) return null;
  const css = buildSlotCSS(slot, fontOverride, slotStyle);
  const w = slot.width ?? 80;
  const arcDeg = slotStyle?.arcDegrees ?? 0;
  const plainText = value.replace(/<[^>]+>/g, "");

  return (
    <div style={{
      position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, width: `${w}%`,
      transform: "translateX(-50%)", textAlign: slot.align ?? "center",
      whiteSpace: "pre-line", direction: "rtl", pointerEvents: "none",
    }}>
      {arcDeg !== 0 ? (
        <SvgArcText text={plainText} arcDeg={arcDeg} cssStyle={css} />
      ) : (
        <span style={css}>{value}</span>
      )}
    </div>
  );
}

function LogoUploader({ logoUrl, onChange }: { logoUrl: string | null; onChange: (url: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="border-b border-primary/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ImagePlus className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">לוגו</span>
          {logoUrl
            ? <span className="text-xs text-green-500 font-medium">הועלה ✓</span>
            : <span className="text-xs text-muted-foreground">אין לוגו</span>
          }
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 bg-card/30">
          {logoUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full rounded-xl border border-primary/20 bg-background/60 p-3 flex items-center justify-center overflow-hidden" style={{ minHeight: 80 }}>
                <img src={logoUrl} alt="לוגו" className="max-h-16 max-w-full object-contain" />
                <button
                  onClick={() => onChange(null)}
                  className="absolute top-2 left-2 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                  title="הסר לוגו"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
              >
                החלף לוגו
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault(); setDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              className={`w-full rounded-xl border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                dragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <Upload className="w-6 h-6 text-primary/60" />
              <p className="text-xs font-medium text-foreground text-center">גרירה או לחיצה להעלאה</p>
              <p className="text-[10px] text-muted-foreground text-center">PNG, JPG, SVG · עד 5MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <p className="text-[10px] text-muted-foreground mt-2 text-center">הלוגו יופיע בראש ההזמנה</p>
        </div>
      )}
    </div>
  );
}

interface InvitationPreviewProps {
  template: typeof templates[0];
  values: Record<string, string>;
  zoom: number;
  fontOverride: string;
  logoUrl: string | null;
  logoPos: LogoPos;
  slotStyles: Record<string, SlotStyle>;
  placedElements?: PlacedElement[];
  selectedElementUid?: string | null;
  onSelectElement?: (uid: string | null) => void;
  onLogoMove?: (pos: LogoPos) => void;
}

function InvitationPreview({
  template, values, zoom, fontOverride, logoUrl, logoPos, slotStyles,
  placedElements, selectedElementUid, onSelectElement, onLogoMove,
}: InvitationPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ type: "logo" | "element"; startX: number; startY: number; startPosX: number; startPosY: number; uid?: string } | null>(null);

  const slots = (template.slots || []).filter(s => s.id !== "__elements");
  const hasCoords = slots.some(s => s.x != null && s.y != null);

  // Separate frames from regular elements
  const frames = (placedElements ?? []).filter(pe => pe.isFrame);
  const regularElements = (placedElements ?? []).filter(pe => !pe.isFrame);

  const getContainerPct = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const pct = getContainerPct(e.clientX, e.clientY);
    const dx = pct.x - dragging.current.startX;
    const dy = pct.y - dragging.current.startY;
    if (dragging.current.type === "logo") {
      onLogoMove?.({
        x: Math.max(0, Math.min(90, dragging.current.startPosX + dx)),
        y: Math.max(0, Math.min(90, dragging.current.startPosY + dy)),
        width: logoPos.width,
      });
    }
  };

  const handlePointerUp = () => { dragging.current = null; };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl shadow-2xl border border-primary/20 select-none"
      style={{ aspectRatio: "3/4", transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background */}
      {template.isGradient ? (
        <div className="absolute inset-0" style={{ background: template.image }} />
      ) : (
        <img src={template.image} alt={template.title} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Decorative borders for gradient templates */}
      {template.isGradient && (
        <>
          <div className="absolute inset-3 border border-[#D6A84F]/40 rounded-lg pointer-events-none" />
          <div className="absolute inset-5 border border-[#D6A84F]/20 rounded-lg pointer-events-none" />
          {(["top-3 right-3", "top-3 left-3", "bottom-3 right-3", "bottom-3 left-3"] as const).map((pos) => (
            <div key={pos} className={`absolute ${pos} w-6 h-6 pointer-events-none`} style={{
              borderTop: pos.includes("top") ? "2px solid #D6A84F" : "none",
              borderBottom: pos.includes("bottom") ? "2px solid #D6A84F" : "none",
              borderRight: pos.includes("right") ? "2px solid #D6A84F" : "none",
              borderLeft: pos.includes("left") ? "2px solid #D6A84F" : "none",
            }} />
          ))}
        </>
      )}
      {!template.isGradient && !hasCoords && <div className="absolute inset-0 bg-black/45" />}

      {/* Frames layer (behind text) */}
      {frames.map(pe => (
        <img key={pe.uid} src={pe.src} alt="" draggable={false} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "fill", zIndex: 5, pointerEvents: "none", opacity: pe.opacity,
          filter: pe.tintColor ? colorToFilter(pe.tintColor) : undefined,
        }} />
      ))}

      {/* Text content */}
      {hasCoords ? (
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          {slots.map(slot => (
            <AbsoluteSlot
              key={slot.id}
              slot={slot}
              value={values[slot.id] ?? slot.defaultValue}
              fontOverride={fontOverride}
              slotStyle={slotStyles[slot.id]}
            />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-10 gap-0.5 overflow-hidden" dir="rtl" style={{ zIndex: 10 }}>
          <div className="w-24 h-px bg-[#D6A84F]/50 mb-2" />
          {slots.map(slot => {
            const val = values[slot.id] ?? slot.defaultValue;
            if (!val.trim()) return null;
            return (
              <StackedLine
                key={slot.id}
                slot={slot}
                value={val}
                fontOverride={fontOverride}
                slotStyle={slotStyles[slot.id]}
              />
            );
          })}
          <div className="w-24 h-px bg-[#D6A84F]/50 mt-2" />
        </div>
      )}

      {/* Regular placed elements */}
      {regularElements.map(pe => (
        <div
          key={pe.uid}
          onClick={() => onSelectElement?.(pe.uid === selectedElementUid ? null : pe.uid)}
          style={{
            position: "absolute", left: `${pe.x}%`, top: `${pe.y}%`, width: `${pe.width}%`,
            opacity: pe.opacity, cursor: "pointer", zIndex: 20,
            outline: pe.uid === selectedElementUid ? "2px solid #D6A84F" : "none",
            outlineOffset: 2, borderRadius: 4,
          }}
        >
          <img src={pe.src} alt="" draggable={false} style={{
            width: "100%", height: "auto", display: "block",
            filter: pe.tintColor ? colorToFilter(pe.tintColor) : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }} />
        </div>
      ))}

      {/* Draggable logo */}
      {logoUrl && (
        <div
          style={{
            position: "absolute",
            left: `${logoPos.x}%`,
            top: `${logoPos.y}%`,
            width: `${logoPos.width}%`,
            zIndex: 25,
            cursor: onLogoMove ? "grab" : "default",
            touchAction: "none",
          }}
          onPointerDown={e => {
            if (!onLogoMove) return;
            e.stopPropagation();
            const pct = getContainerPct(e.clientX, e.clientY);
            dragging.current = {
              type: "logo", startX: pct.x, startY: pct.y,
              startPosX: logoPos.x, startPosY: logoPos.y,
            };
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
          }}
        >
          <img
            src={logoUrl} alt="לוגו" draggable={false}
            style={{ width: "100%", height: "auto", objectFit: "contain", filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }}
          />
          {/* Resize handle */}
          {onLogoMove && (
            <>
              {/* Size up/down buttons */}
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5"
                onPointerDown={e => e.stopPropagation()}
              >
                <button
                  className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center shadow hover:bg-primary/80"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onLogoMove({ ...logoPos, width: Math.max(5, logoPos.width - 5) }); }}
                >−</button>
                <button
                  className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center shadow hover:bg-primary/80"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onLogoMove({ ...logoPos, width: Math.min(80, logoPos.width + 5) }); }}
                >+</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Watermark */}
      <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.28, zIndex: 30 }}>
        <img src={hadarLogo} alt="הדר" style={{ height: 18, width: "auto", objectFit: "contain" }} />
      </div>
    </div>
  );
}

function AuthWall({ templateId }: { templateId: string }) {
  return (
    <div className="absolute inset-0 z-20 rounded-xl overflow-hidden">
      {/* Decorative blurred invitation mockup */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0B1833 0%, #0f2347 50%, #0B1833 100%)" }} />
      {/* Concentric golden rings */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="absolute border border-primary/10 rounded-full" style={{
          width: `${280 + i * 100}px`, height: `${280 + i * 100}px`,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }} />
      ))}
      {/* Simulated blurred invitation card */}
      <div className="absolute inset-8 rounded-xl opacity-20 blur-sm overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2d50 0%, #243960 100%)" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-primary/60 rounded" />
          <div className="w-24 h-3 bg-primary/30 rounded" />
          <div className="w-32 h-5 bg-primary/50 rounded mt-1" />
          <div className="w-20 h-3 bg-primary/30 rounded" />
          <div className="w-16 h-0.5 bg-primary/60 rounded mt-1" />
          <div className="w-28 h-3 bg-foreground/15 rounded mt-2" />
          <div className="w-36 h-3 bg-foreground/15 rounded" />
          <div className="w-24 h-3 bg-foreground/15 rounded" />
        </div>
      </div>
      {/* Frosted glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ background: "linear-gradient(160deg, rgba(11,24,51,0.82) 0%, rgba(15,32,64,0.78) 100%)" }} />
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-8" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-primary" />
          </div>
          <div className="w-12 h-0.5 bg-primary/40 mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold mb-2 text-foreground drop-shadow-lg">נדרשת כניסה לחשבון</h3>
          <p className="text-sm text-primary/60 mb-6 leading-relaxed">כנסו כדי לשמור את העיצוב<br />ולהמשיך לשלב התשלום</p>
          <SignInButton mode="redirect" forceRedirectUrl={`${basePath}/editor/${templateId}`}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 px-7 py-5 text-base shadow-lg shadow-primary/20">
              <LogIn className="w-4 h-4" />
              כניסה / הרשמה
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}

function PaymentWall({ onPay, onClose, loading, designName }: { onPay: () => void; onClose: () => void; loading: boolean; designName: string }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-card border border-primary/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative"
          dir="rtl"
        >
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
          <Crown className="w-10 h-10 text-primary mx-auto mb-1" />
          <div className="w-16 h-px bg-primary/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2 text-foreground">קבלת העיצוב הסופי</h2>
          <p className="text-muted-foreground text-sm mb-6">
            לאחר התשלום תקבלו קבצי עיצוב סופיים בפורמטים מלאים לבית דפוס ולרשתות החברתיות, מוכנים להדפסה ושיתוף.
          </p>
          <div className="bg-secondary/40 border border-primary/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground font-medium">{designName}</span>
              <span className="font-serif font-bold text-primary text-lg">₪49</span>
            </div>
            <p className="text-xs text-muted-foreground text-right">קבצי DXF, PNG, PDF • שירות לקוחות VIP</p>
          </div>
          <ul className="text-right text-xs text-muted-foreground mb-6 space-y-1.5">
            {["קבצי עיצוב סופיים לבית דפוס (PDF/PNG)", "גרסה לרשתות חברתיות (WhatsApp, Instagram)", "תיקון אחד ללא תוספת מחיר", "מסירה תוך 48 שעות"].map(item => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button
            onClick={onPay}
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 text-base shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            {loading ? "מעביר לתשלום..." : "לתשלום מאובטח — ₪49"}
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3">
            תשלום מאובטח דרך Stripe • ניתן לבטל עד 24 שעות
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Editor() {
  const params = useParams();
  const id = params.id;
  const template = templates.find(t => t.id === id);
  const { theme, toggle } = useTheme();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const [, navigate] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const designIdParam = searchParams.get("design");
  const paymentStatus = searchParams.get("payment");

  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [designId, setDesignId] = useState<number | null>(designIdParam ? Number(designIdParam) : null);
  const [designName, setDesignName] = useState("עיצוב שלי");
  const [selectedFont, setSelectedFont] = useState(DEFAULT_FONT);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"text" | "elements">("text");
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [selectedElementUid, setSelectedElementUid] = useState<string | null>(null);
  const [slotStyles, setSlotStyles] = useState<Record<string, SlotStyle>>({});
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [logoPos, setLogoPos] = useState<LogoPos>({ x: 30, y: 2, width: 40 });
  const previewRef = useRef<HTMLDivElement>(null);

  // Load default font on mount
  useEffect(() => { loadGoogleFont(DEFAULT_FONT); }, []);

  const initValues = useCallback(() => {
    const init: Record<string, string> = {};
    (template?.slots || []).forEach(s => { init[s.id] = s.defaultValue; });
    return init;
  }, [template]);

  const [values, setValues] = useState<Record<string, string>>(initValues);

  // Load existing design if designId is in URL
  useEffect(() => {
    if (!designId || !isSignedIn) return;
    const load = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/hadar/designs/${designId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const fv = data.fieldValues || initValues();
          setValues(fv);
          setDesignName(data.designName || "עיצוב שלי");
          if (data.status === "paid") setPaySuccess(true);
          try {
            const els = JSON.parse(fv["__elements"] || "[]");
            if (Array.isArray(els)) setPlacedElements(els);
          } catch {}
          try {
            const ss = JSON.parse(fv["__slotStyles"] || "{}");
            if (ss && typeof ss === "object") setSlotStyles(ss);
          } catch {}
          try {
            const lp = JSON.parse(fv["__logoPos"] || "null");
            if (lp && typeof lp === "object") setLogoPos(lp);
          } catch {}
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [designId, isSignedIn]);

  // Handle payment return
  useEffect(() => {
    if (paymentStatus === "success") {
      const sessionId = searchParams.get("session_id");
      if (sessionId && isSignedIn) {
        const verify = async () => {
          try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/hadar/checkout/verify?session_id=${sessionId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              if (data.status === "paid") setPaySuccess(true);
            }
          } catch {}
        };
        verify();
      }
    }
  }, [paymentStatus, isSignedIn]);

  const updateValue = (id: string, val: string) => {
    setValues(prev => ({ ...prev, [id]: val }));
    setSaved(false);
  };

  const resetAll = () => {
    setValues(initValues());
    setSaved(false);
  };

  const getFieldValuesWithElements = useCallback(() => {
    return {
      ...values,
      "__elements": JSON.stringify(placedElements),
      "__slotStyles": JSON.stringify(slotStyles),
      "__logoPos": JSON.stringify(logoPos),
    };
  }, [values, placedElements, slotStyles, logoPos]);

  const handleAddElement = useCallback((el: { id: number; fileContent: string; category?: string }) => {
    const uid = `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const isFrame = el.category === "מסגרות";
    setPlacedElements(prev => [...prev, {
      uid, elementId: el.id, src: el.fileContent, category: el.category,
      x: isFrame ? 0 : 35, y: isFrame ? 0 : 35, width: isFrame ? 100 : 25,
      tintColor: "", opacity: 1, isFrame,
    }]);
    setSelectedElementUid(uid);
    setSidebarTab("elements");
    setSaved(false);
  }, []);

  const handleUpdateElement = useCallback((uid: string, patch: Partial<PlacedElement>) => {
    setPlacedElements(prev => prev.map(e => e.uid === uid ? { ...e, ...patch } : e));
    setSaved(false);
  }, []);

  const handleDeleteElement = useCallback((uid: string) => {
    setPlacedElements(prev => prev.filter(e => e.uid !== uid));
    if (selectedElementUid === uid) setSelectedElementUid(null);
    setSaved(false);
  }, [selectedElementUid]);

  const handleAutoSave = async (): Promise<number | null> => {
    if (!isSignedIn || !template) return null;
    setSaving(true);
    const fv = getFieldValuesWithElements();
    try {
      const token = await getToken();
      if (designId) {
        await fetch(`${API_BASE}/api/hadar/designs/${designId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fieldValues: fv, designName }),
        });
        return designId;
      } else {
        const res = await fetch(`${API_BASE}/api/hadar/designs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ templateId: template.id, fieldValues: fv, designName }),
        });
        const data = await res.json();
        setDesignId(data.id);
        return data.id;
      }
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await handleAutoSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadClick = () => {
    if (!isLoaded) return;
    if (!isSignedIn) return; // Auth wall shown in preview
    if (paySuccess) {
      window.open(`https://wa.me/972500000000?text=${encodeURIComponent("שלום, שילמתי עבור העיצוב שלי ואני רוצה לקבל את הקבצים הסופיים")}`, "_blank");
      return;
    }
    setShowPayment(true);
  };

  const handlePay = async () => {
    if (!isSignedIn || !template) return;
    setPayLoading(true);
    try {
      const savedDesignId = await handleAutoSave();
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/hadar/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          templateId: template.id,
          fieldValues: values,
          designName,
          designId: savedDesignId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        if (data.designId) setDesignId(data.designId);
        window.location.href = data.url;
      } else {
        alert("שגיאה בפתיחת עמוד התשלום");
      }
    } catch (err) {
      alert("שגיאה, נסו שוב");
    } finally {
      setPayLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      // Target the inner invitation div (first child = the scaled element)
      const target = previewRef.current.children[0] as HTMLElement;
      const savedTransform = target.style.transform;
      const savedTransition = target.style.transition;
      // Temporarily reset zoom so we capture at natural size
      target.style.transform = "scale(1)";
      target.style.transition = "none";
      const canvas = await html2canvas(target, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 15000,
      });
      target.style.transform = savedTransform;
      target.style.transition = savedTransition;
      const link = document.createElement("a");
      link.download = `${designName || "הזמנה"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("שגיאה בהורדה, נסו שוב");
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`שלום, אני מעוניין לבצע הזמנה לתבנית "${template?.title}". כבר ערכתי את הפרטים באונליין.`);
    window.open(`https://wa.me/972500000000?text=${msg}`, "_blank");
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4 text-foreground">התבנית לא נמצאה</h1>
          <Link href="/"><Button variant="outline" className="border-primary text-primary">חזרה לגלריה</Button></Link>
        </div>
      </div>
    );
  }

  const slots = template.slots || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">

      {showPayment && !paySuccess && (
        <PaymentWall onPay={handlePay} onClose={() => setShowPayment(false)} loading={payLoading} designName={designName} />
      )}

      {/* Sticky Header */}
      <header className="border-b border-primary/10 bg-background/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/template/${template.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group shrink-0">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline text-sm font-medium">חזרה</span>
            </Link>
            <div className="hidden sm:block w-px h-5 bg-primary/20" />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{template.title}</p>
              <p className="text-xs text-muted-foreground truncate">{template.subtitle}</p>
            </div>
          </div>

          <Link href="/" className="shrink-0">
            <img src={hadarLogo} alt="הדר" style={{ height: 36, width: "auto", objectFit: "contain" }} />
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggle} className="rounded-full p-1.5 border border-primary/20 text-primary hover:bg-primary/10 transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isSignedIn ? (
              <Link href="/my-designs">
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary gap-1.5 h-8 px-2 hidden sm:flex">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs">העיצובים שלי</span>
                </Button>
              </Link>
            ) : null}
            <Button size="sm" variant="ghost" onClick={resetAll} className="text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2 hidden sm:flex">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs">איפוס</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className={`gap-1.5 h-8 px-3 text-xs transition-all ${saved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"} text-primary-foreground`}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
              {saving ? "שומר..." : saved ? "נשמר!" : "שמירה"}
            </Button>
          </div>
        </div>
      </header>

      {/* Payment success banner */}
      {paySuccess && (
        <div className="bg-green-600 text-white text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          התשלום הצליח! העיצוב הסופי יישלח אליכם תוך 48 שעות. לפניות: <button onClick={handleWhatsApp} className="underline">ווצאפ</button>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-56px)]">

        {/* ── LEFT PANEL: fields ── */}
        <aside className="lg:w-[420px] xl:w-[460px] shrink-0 border-b lg:border-b-0 lg:border-l border-primary/10 flex flex-col bg-card/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-primary/10 bg-card flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-foreground">עורך העיצוב</p>
              <p className="text-xs text-muted-foreground">{slots.length} שדות טקסט</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
              ₪{template.price}
            </span>
          </div>

          {/* Steps guide */}
          <div className="px-5 py-2.5 border-b border-primary/10 bg-primary/5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {[
                { n: "1", label: "ערכו", done: true },
                { n: "2", label: "שמרו", done: isSignedIn && saved },
                { n: "3", label: "תשלום", done: paySuccess },
                { n: "4", label: "קבצים", done: false },
              ].map((step, i) => (
                <div key={step.n} className="flex items-center gap-1">
                  {i > 0 && <span className="text-primary/30">←</span>}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${step.done ? "bg-green-600 text-white" : "bg-primary/20 text-primary"}`}>
                      {step.done ? "✓" : step.n}
                    </span>
                    <span className={step.done ? "text-green-600" : ""}>{step.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-primary/10 bg-card">
            <button
              onClick={() => setSidebarTab("text")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                sidebarTab === "text"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              טקסטים
            </button>
            <button
              onClick={() => setSidebarTab("elements")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                sidebarTab === "elements"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              אלמנטים
              {placedElements.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {placedElements.length}
                </span>
              )}
            </button>
          </div>

          {/* ── TAB: Text ── */}
          {sidebarTab === "text" && (
            <>
              {/* Design name input */}
              {isSignedIn && (
                <div className="px-5 py-2 border-b border-primary/10 bg-card/30">
                  <Input
                    value={designName}
                    onChange={e => setDesignName(e.target.value)}
                    placeholder="שם העיצוב שלכם..."
                    className="h-8 text-xs bg-transparent border-0 border-b border-primary/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary/40 text-foreground placeholder:text-muted-foreground/40"
                    dir="rtl"
                  />
                </div>
              )}

              {/* Font selector */}
              <FontSelector selected={selectedFont} onChange={setSelectedFont} />

              {/* Logo uploader */}
              <LogoUploader logoUrl={logoUrl} onChange={setLogoUrl} />

              {/* Fields list with rich text + per-slot styling */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3 space-y-2">
                  {slots.filter(s => s.id !== "__elements" && s.id !== "__slotStyles" && s.id !== "__logoPos").map((slot, index) => {
                    const isActive = activeSlotId === slot.id;
                    const hasStyle = Object.keys(slotStyles[slot.id] || {}).length > 0;
                    return (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div className={`bg-background border rounded-xl px-3 py-2.5 transition-all ${isActive ? "border-primary/50 shadow-sm shadow-primary/10" : "border-primary/10 hover:border-primary/30"}`}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                {index + 1}
                              </div>
                              <span className="text-[11px] font-semibold text-foreground">{slot.label}</span>
                              {hasStyle && <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">מעוצב</span>}
                            </div>
                            <button
                              onClick={() => setActiveSlotId(isActive ? null : slot.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"}`}
                              title="עיצוב שדה"
                            >
                              <Settings2 className="w-3 h-3" />
                              {isActive ? "סגור" : "עיצוב"}
                            </button>
                          </div>
                          <RichTextSlot
                            label=""
                            value={values[slot.id] ?? slot.defaultValue}
                            placeholder={slot.placeholder}
                            multiline={slot.multiline}
                            onChange={html => { updateValue(slot.id, html); setSaved(false); }}
                          />
                          {isActive && (
                            <SlotStylePanel
                              slotId={slot.id}
                              style={slotStyles[slot.id] || {}}
                              onChange={patch => {
                                setSlotStyles(prev => ({ ...prev, [slot.id]: { ...(prev[slot.id] || {}), ...patch } }));
                                setSaved(false);
                              }}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── TAB: Elements ── */}
          {sidebarTab === "elements" && (
            <ElementsPanel
              placedElements={placedElements}
              selectedUid={selectedElementUid}
              onSelect={setSelectedElementUid}
              onAdd={handleAddElement}
              onUpdate={handleUpdateElement}
              onDelete={handleDeleteElement}
            />
          )}

          {/* Bottom action bar */}
          <div className="border-t border-primary/10 bg-card p-4 space-y-2">
            {paySuccess ? (
              <>
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 font-bold shadow-lg shadow-primary/20"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {downloading ? "מכין קובץ..." : "הורדת העיצוב (PNG איכות גבוהה)"}
                </Button>
                <Button onClick={handleWhatsApp} variant="outline" className="w-full border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 gap-2 h-9 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  שלחו לסטודיו לגרסת הדפוס
                </Button>
              </>
            ) : isSignedIn ? (
              <Button onClick={handleDownloadClick} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 font-bold shadow-lg shadow-primary/20">
                <CreditCard className="w-4 h-4" />
                קבלת העיצוב הסופי — ₪49
              </Button>
            ) : (
              <SignInButton mode="redirect" forceRedirectUrl={`${basePath}/editor/${template.id}`}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 font-bold">
                  <LogIn className="w-4 h-4" />
                  כניסה לשמירה ותשלום
                </Button>
              </SignInButton>
            )}
            {!paySuccess && (
              <Button onClick={handleWhatsApp} variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10 gap-2 h-9 text-sm">
                <MessageCircle className="w-4 h-4" />
                שלחו לסטודיו דרך ווצאפ
              </Button>
            )}
          </div>
        </aside>

        {/* ── RIGHT PANEL: live preview ── */}
        <main className="flex-1 overflow-y-auto bg-secondary/30 flex flex-col items-center justify-start p-4 md:p-8 gap-4">
          <div className="flex items-center gap-2 bg-card border border-primary/10 rounded-full px-3 py-1.5 shadow-sm self-start lg:self-center">
            <span className="text-xs text-muted-foreground font-medium">תצוגה מקדימה</span>
            <div className="w-px h-4 bg-primary/20" />
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-foreground w-9 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div ref={previewRef} className="w-full max-w-xs sm:max-w-sm md:max-w-md relative" style={{ transformOrigin: "top center" }}>
            <InvitationPreview
              template={template}
              values={values}
              zoom={zoom}
              fontOverride={selectedFont}
              logoUrl={logoUrl}
              logoPos={logoPos}
              slotStyles={slotStyles}
              placedElements={placedElements}
              selectedElementUid={selectedElementUid}
              onSelectElement={uid => { setSelectedElementUid(uid); if (uid) setSidebarTab("elements"); }}
              onLogoMove={pos => { setLogoPos(pos); setSaved(false); }}
            />
            {isLoaded && !isSignedIn && <AuthWall templateId={template.id} />}
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs pb-4">
            זוהי תצוגה מקדימה. העיצוב הסופי יבוצע על-ידי הסטודיו שלנו בהתאמה מדויקת לבקשתכם.
          </p>
        </main>
      </div>
    </div>
  );
}
