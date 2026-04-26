import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, Link, useLocation, useSearch } from "wouter";
import { useAuth, useUser, useClerk } from "@clerk/react";
import hadarLogo from "@/assets/logo-hadar.png";
import {
  ArrowRight, Crown, MessageCircle, Download, RotateCcw, CheckCircle2,
  ZoomIn, ZoomOut, Lock, Loader2, User, CreditCard, LogIn, Type,
  ChevronDown, ChevronUp, ImagePlus, X as XIcon, Upload, Layers,
  Plus, Copy, Trash2, ChevronUp as Up, ChevronDown as Down,
  ArrowUp, ArrowDown, Unlock, Move, Settings2, Eye, EyeOff,
  AlignCenter, AlignLeft, AlignRight, MoreVertical, Save, Pencil,
  AlignCenterHorizontal, AlignCenterVertical,
  AlignEndHorizontal, AlignEndVertical,
  AlignStartHorizontal, AlignStartVertical,
  Crosshair, Wand2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextSlot, Template } from "@/lib/data";
import { HEBREW_FONTS, loadGoogleFont, useCombinedFonts, injectCustomFont } from "@/lib/fonts";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { ElementsPanel, PlacedElement, colorToFilter } from "@/components/ElementsPanel";
import { RichTextSlot } from "@/components/RichTextSlot";
import { SlotStylePanel, SlotStyle } from "@/components/SlotStylePanel";
import { build3DShadows, PRESETS_3D } from "@/lib/3d-presets";
import { SvgWarpText, WarpType } from "@/components/SvgWarpText";

export interface LogoPos { x: number; y: number; width: number; }

// ─── Local BA Hebrew fonts ─────────────────────────────────────────────────────
const LOCAL_BA_FONTS: {
  name: string; family: string; files: { weight: number; src: string }[];
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

LOCAL_BA_FONTS.forEach(f => HEBREW_FONTS.push({ name: f.name, family: f.family, category: "local" }));

const DEFAULT_FONT = "Frank Ruhl Libre";
const SYSTEM_SLOT_IDS = new Set(["__elements", "__slotStyles", "__logoPos", "__slotPositions", "__userSlots", "__lockedSlots"]);

function loadLocalFont(family: string) {
  const id = `lfont-${family.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const meta = LOCAL_BA_FONTS.find(f => f.family === family);
  if (!meta) return;
  const base = import.meta.env.BASE_URL;
  const fmt = (src: string) => src.endsWith(".ttf") ? "truetype" : "opentype";
  const css = meta.files.map(f => `@font-face { font-family: '${meta.family}'; src: url('${base}fonts/${f.src}') format('${fmt(f.src)}'); font-weight: ${f.weight}; font-style: normal; font-display: swap; }`).join("\n");
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

const TAB_LABELS: Record<"serif" | "sans" | "local" | "custom", string> = {
  serif: "סריף", sans: "סאנס", local: "עברית", custom: "מותאם",
};

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const previewFontSizePx: Record<string, number> = {
  xs: 9, sm: 11, md: 13, lg: 16, xl: 20, "2xl": 26,
};

function resolveColor(color?: string): string {
  if (!color) return "#F8F1E3";
  if (color.startsWith("#") || color.startsWith("rgb")) return color;
  if (color === "gold")  return "#D6A84F";
  if (color === "dark")  return "#0B1833";
  if (color === "cream") return "#F8F1E3";
  if (color === "white") return "#FFFFFF";
  return "#F8F1E3";
}

function resolveFont(slotFamily: string | undefined, fontOverride: string): string {
  if (!slotFamily || slotFamily === "serif") return `'${fontOverride}', serif`;
  if (slotFamily === "sans") return `'${fontOverride}', sans-serif`;
  return `'${slotFamily}', serif`;
}

function buildTextShadows(ss: SlotStyle | undefined, baseColor: string): string {
  const parts: string[] = [];

  // ── Premium 3D preset (takes priority over classic extrude) ──────────────
  if (ss?.preset3D && ss.preset3D !== "none") {
    const preset = PRESETS_3D.find(p => p.id === ss.preset3D);
    const glowCol = ss.glowColor || preset?.glowColor || baseColor;
    const shadows = build3DShadows(
      ss.preset3D,
      ss.lightAngle3D ?? preset?.defaultAngle ?? 45,
      ss.depth3D     ?? preset?.defaultDepth     ?? 6,
      ss.shadowStr3D ?? preset?.defaultShadowStr ?? 70,
      ss.highlight3D ?? preset?.defaultHighlight ?? 60,
      ss.glow3D      ?? preset?.defaultGlow      ?? 0,
      glowCol,
    );
    parts.push(...shadows);
  }

  // ── Basic drop shadow ─────────────────────────────────────────────────────
  if (ss?.shadow || ss?.shadowX != null || ss?.shadowY != null || ss?.shadowColor) {
    const x = ss?.shadowX ?? 2, y = ss?.shadowY ?? 2;
    const blur = ss?.shadowBlur ?? 6;
    const col = ss?.shadowColor || "rgba(0,0,0,0.7)";
    parts.push(`${x}px ${y}px ${blur}px ${col}`);
  }

  // ── Classic glow ──────────────────────────────────────────────────────────
  if (ss?.glow || ss?.glowColor || ss?.glowRadius) {
    const gc = ss?.glowColor || baseColor;
    const gr = ss?.glowRadius ?? 12;
    const intensity = ss?.glowIntensity ?? 2;
    for (let i = 0; i < intensity; i++) parts.push(`0 0 ${gr * (i + 1)}px ${gc}`);
    if (gc.startsWith("#") && gc.length <= 7) parts.push(`0 0 ${Math.ceil(gr * 0.4)}px ${gc}cc`);
  }

  // ── Classic extrude (legacy / not active when preset3D is set) ───────────
  if (ss?.extrudeEnabled && !ss?.preset3D) {
    const depth = ss.extrudeDepth ?? 5;
    const angle = (ss.extrudeAngle ?? 225) * Math.PI / 180;
    const col = ss.extrudeColor || "rgba(0,0,0,0.6)";
    for (let i = 1; i <= depth; i++) parts.push(`${(Math.cos(angle) * i).toFixed(1)}px ${(Math.sin(angle) * i).toFixed(1)}px 0 ${col}`);
  }

  // ── Long shadow ───────────────────────────────────────────────────────────
  if (ss?.longShadowEnabled && !ss?.preset3D) {
    const len = ss.longShadowLength ?? 40;
    const angle = (ss.longShadowAngle ?? 135) * Math.PI / 180;
    const col = ss.longShadowColor || "rgba(0,0,0,0.15)";
    for (let i = 1; i <= len; i++) parts.push(`${(Math.cos(angle) * i).toFixed(1)}px ${(Math.sin(angle) * i).toFixed(1)}px 0 ${col}`);
  }

  return parts.join(", ");
}

function buildTextureGradient(type: SlotStyle["textureType"]): string | undefined {
  switch (type) {
    case "gold-foil": return "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)";
    case "silver":    return "linear-gradient(135deg, #8e9eab 0%, #eef2f3 30%, #9da9b0 60%, #eef2f3 80%, #8e9eab 100%)";
    case "fire":      return "linear-gradient(0deg, #ff4500 0%, #ff8c00 30%, #ffd700 60%, #fff44f 100%)";
    case "neon":      return "linear-gradient(135deg, #a855f7 0%, #ec4899 35%, #3b82f6 70%, #a855f7 100%)";
    case "rainbow":   return "linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff)";
    default:          return undefined;
  }
}

function buildSlotCSS(slot: TextSlot, fontOverride: string, ss?: SlotStyle): React.CSSProperties {
  const baseSz = slot.fontSizePx ?? previewFontSizePx[slot.fontSize || "sm"];
  const baseColor = ss?.color || resolveColor(slot.color);
  const fontFamily = ss?.fontFamily ? `'${ss.fontFamily}', serif` : resolveFont(slot.fontFamily, fontOverride);
  const lh = ss?.lineHeight ?? slot.lineHeight ?? 1.35;
  const ls = ss?.letterSpacing != null ? `${ss.letterSpacing}px` : slot.letterSpacing != null ? `${slot.letterSpacing}px` : undefined;
  const textShadow = buildTextShadows(ss, baseColor);
  const texGrad = ss?.textureType && ss.textureType !== "none" ? buildTextureGradient(ss.textureType) : undefined;
  const useGradient = !!ss?.gradientEnabled || !!texGrad;
  const gradientBg = texGrad ?? (ss?.gradientEnabled
    ? `linear-gradient(${ss.gradientAngle ?? 90}deg, ${ss.gradientFrom || "#D6A84F"}, ${ss.gradientTo || "#F8F1E3"})`
    : undefined);
  const stroke = (ss?.strokeWidth ?? 0) > 0 ? `${ss!.strokeWidth}px ${ss?.strokeColor || baseColor}` : ss?.outline ? `1px ${baseColor}` : undefined;

  const base: React.CSSProperties = {
    fontSize: ss?.fontSize ?? baseSz,
    fontFamily,
    fontWeight: (ss?.bold ?? slot.bold) ? 700 : 400,
    fontStyle: (ss?.italic ?? slot.italic) ? "italic" : "normal",
    textDecoration: ss?.underline ? "underline" : undefined,
    lineHeight: lh,
    letterSpacing: ls,
    WebkitTextStroke: stroke,
    textShadow: textShadow || undefined,
  };

  if (useGradient && gradientBg) {
    return { ...base, backgroundImage: gradientBg, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" };
  }
  return { ...base, color: baseColor };
}

function buildSlotWrapperCSS(ss?: SlotStyle, slotOpacity?: number): React.CSSProperties {
  if (!ss && slotOpacity == null) return {};
  const transforms: string[] = [];
  if (ss?.rotation) transforms.push(`rotate(${ss.rotation}deg)`);
  if (ss?.skewX) transforms.push(`skewX(${ss.skewX}deg)`);
  if (ss?.skewY) transforms.push(`skewY(${ss.skewY}deg)`);
  const style: React.CSSProperties = {};
  if (transforms.length) style.transform = transforms.join(" ");
  const op = ss?.opacity ?? slotOpacity;
  if (op != null && op !== 1) style.opacity = op;
  if (ss?.blendMode && ss.blendMode !== "normal") style.mixBlendMode = ss.blendMode as React.CSSProperties["mixBlendMode"];
  if (ss?.glassEnabled) {
    style.background = ss.glassColor || "rgba(255,255,255,0.08)";
    style.backdropFilter = `blur(${ss.glassBlur ?? 8}px)`;
    style.WebkitBackdropFilter = `blur(${ss.glassBlur ?? 8}px)`;
    style.borderRadius = `${ss.glassBorderRadius ?? 8}px`;
    style.padding = "4px 14px";
  }
  return style;
}

// ─── Logo Uploader ─────────────────────────────────────────────────────────────
function LogoUploader({ logoUrl, onChange }: { logoUrl: string | null; onChange: (url: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div className="border-b border-primary/10">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 transition-colors">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">לוגו</span>
          {logoUrl ? <span className="text-xs text-green-500 font-medium">הועלה ✓</span> : <span className="text-xs text-muted-foreground">אין לוגו</span>}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2">
          <div className="border-2 border-dashed border-primary/20 rounded-xl p-3 text-center hover:border-primary/40 transition-colors cursor-pointer bg-primary/5"
            onClick={() => inputRef.current?.click()}>
            {logoUrl ? (
              <img src={logoUrl} alt="לוגו" className="h-12 mx-auto object-contain" />
            ) : (
              <div className="text-muted-foreground">
                <Upload className="w-5 h-5 mx-auto mb-1 opacity-50" />
                <p className="text-xs">לחצו להעלאת לוגו</p>
              </div>
            )}
          </div>
          {logoUrl && (
            <button onClick={() => onChange(null)} className="w-full text-xs text-destructive hover:text-destructive/80 transition-colors py-1">
              הסר לוגו
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        </div>
      )}
    </div>
  );
}

// ─── Slot position ─────────────────────────────────────────────────────────────
interface SlotPos { x: number; y: number; width: number; }

function getDefaultPos(index: number, total: number): SlotPos {
  const spacing = total > 1 ? 50 / Math.max(1, total - 1) : 0;
  return { x: 50, y: 20 + index * spacing, width: 80 };
}

// ─── Interactive Canvas ────────────────────────────────────────────────────────
const GUIDE_POSITIONS = [0, 25, 50, 75, 100];
const SNAP_THRESHOLD = 2;

interface CanvasProps {
  template: Template;
  values: Record<string, string>;
  slotStyles: Record<string, SlotStyle>;
  slotPositions: Record<string, SlotPos>;
  allSlots: TextSlot[];
  activeSlotId: string | null;
  lockedSlots: Set<string>;
  fontOverride: string;
  logoUrl: string | null;
  logoPos: LogoPos;
  placedElements: PlacedElement[];
  selectedElementUid: string | null;
  zoom: number;
  canvasRef?: React.RefObject<HTMLDivElement>;
  readonly?: boolean;
  onSlotSelect: (id: string | null) => void;
  onSlotMove: (id: string, x: number, y: number) => void;
  onLogoMove?: (pos: LogoPos) => void;
  onSelectElement?: (uid: string | null) => void;
}

function InteractiveCanvas({
  template, values, slotStyles, slotPositions, allSlots, activeSlotId, lockedSlots,
  fontOverride, logoUrl, logoPos, placedElements, selectedElementUid, zoom,
  canvasRef: externalRef, readonly, onSlotSelect, onSlotMove, onLogoMove, onSelectElement,
}: CanvasProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const canvasRef = externalRef || internalRef;
  const dragRef = useRef<{
    type: "slot" | "logo"; id: string;
    startCX: number; startCY: number;
    startX: number; startY: number;
  } | null>(null);

  interface GuideLine { axis: "x" | "y"; pos: number; isCenter?: boolean; isElement?: boolean; }
  const [guides, setGuides] = useState<GuideLine[]>([]);

  const dims = (template.dimensions as { width: number; height: number } | undefined) ?? { width: 600, height: 800 };
  const aspectRatio = `${dims.width}/${dims.height}`;

  const frames = placedElements.filter(pe => pe.isFrame);
  const regularElements = placedElements.filter(pe => !pe.isFrame);
  const displaySlots = allSlots.filter(s => !SYSTEM_SLOT_IDS.has(s.id));

  const getPct = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleSlotPointerDown = (slotId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    onSlotSelect(slotId);
    if (lockedSlots.has(slotId)) return;
    const pos = slotPositions[slotId] ?? { x: 50, y: 50 };
    dragRef.current = { type: "slot", id: slotId, startCX: e.clientX, startCY: e.clientY, startX: pos.x, startY: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dxPct = (e.clientX - dragRef.current.startCX) / rect.width * 100;
    const dyPct = (e.clientY - dragRef.current.startCY) / rect.height * 100;
    let newX = Math.max(0, Math.min(100, dragRef.current.startX + dxPct));
    let newY = Math.max(0, Math.min(100, dragRef.current.startY + dyPct));

    // Build guide positions: fixed + other elements' positions
    const dragId = dragRef.current.id;
    const otherSlotXs = Object.entries(slotPositions)
      .filter(([id]) => id !== dragId)
      .map(([, pos]) => pos.x);
    const otherSlotYs = Object.entries(slotPositions)
      .filter(([id]) => id !== dragId)
      .map(([, pos]) => pos.y);

    const allXGuides = [...GUIDE_POSITIONS, ...otherSlotXs];
    const allYGuides = [...GUIDE_POSITIONS, ...otherSlotYs];

    const newGuides: GuideLine[] = [];

    let snappedX = false;
    for (const g of allXGuides) {
      if (Math.abs(newX - g) < SNAP_THRESHOLD) {
        newX = g;
        newGuides.push({ axis: "x", pos: g, isCenter: g === 50, isElement: !GUIDE_POSITIONS.includes(g) });
        snappedX = true;
        break;
      }
    }
    if (!snappedX) {
      // Also try snapping logo/element left-edge to fixed guides
    }

    for (const g of allYGuides) {
      if (Math.abs(newY - g) < SNAP_THRESHOLD) {
        newY = g;
        newGuides.push({ axis: "y", pos: g, isCenter: g === 50, isElement: !GUIDE_POSITIONS.includes(g) });
        break;
      }
    }

    setGuides(newGuides);

    if (dragRef.current.type === "slot") {
      onSlotMove(dragRef.current.id, newX, newY);
    } else if (dragRef.current.type === "logo" && onLogoMove) {
      onLogoMove({ ...logoPos, x: Math.max(0, Math.min(90, newX)), y: Math.max(0, Math.min(90, newY)) });
    }
  };

  const handlePointerUp = () => { dragRef.current = null; setGuides([]); };

  return (
    <div
      ref={canvasRef}
      className="relative select-none rounded-xl shadow-2xl border border-primary/20 overflow-hidden"
      style={{ width: "100%", maxWidth: 520, aspectRatio, transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease", touchAction: "none" }}
      onClick={e => { if (e.target === canvasRef.current) onSlotSelect(null); }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background */}
      {template.isGradient ? (
        <div className="absolute inset-0" style={{ background: template.image }} />
      ) : (
        <img src={template.image} alt={template.title} className="absolute inset-0 w-full h-full" style={{ objectFit: "contain" }} draggable={false} />
      )}

      {/* Gradient template decorative borders */}
      {template.isGradient && (
        <>
          <div className="absolute inset-3 border border-[#D6A84F]/40 rounded-lg pointer-events-none" />
          <div className="absolute inset-5 border border-[#D6A84F]/20 rounded-lg pointer-events-none" />
        </>
      )}

      {/* Frame elements */}
      {frames.map(pe => (
        <img key={pe.uid} src={pe.src} alt="" draggable={false} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "fill", zIndex: 5, pointerEvents: "none", opacity: pe.opacity,
          filter: pe.tintColor ? colorToFilter(pe.tintColor) : undefined,
        }} />
      ))}

      {/* Text slots — draggable */}
      {displaySlots.map(slot => {
        const pos = slotPositions[slot.id] ?? { x: 50, y: 50, width: 80 };
        const value = values[slot.id] ?? slot.defaultValue;
        const selected = activeSlotId === slot.id;
        const locked = lockedSlots.has(slot.id);
        const css = buildSlotCSS(slot, fontOverride, slotStyles[slot.id]);
        const wrapCSS = buildSlotWrapperCSS(slotStyles[slot.id], slot.opacity);
        const zIdx = (slotStyles[slot.id]?.zIndex as number) ?? (slot.zIndex ?? 10);
        const warpType = slotStyles[slot.id]?.warpType as WarpType | undefined;
        const warpAmount = slotStyles[slot.id]?.warpAmount
          ?? (slotStyles[slot.id]?.arcDegrees != null ? Math.abs(slotStyles[slot.id]!.arcDegrees!) : 40);
        const plainText = value.replace(/<[^>]+>/g, "");

        return (
          <div
            key={slot.id}
            data-slot-id={slot.id}
            style={{
              position: "absolute",
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${pos.width}%`,
              transform: `translateX(-50%)${wrapCSS.transform ? ` ${wrapCSS.transform}` : ""}`,
              textAlign: slot.align ?? "center",
              direction: "rtl",
              cursor: locked ? "not-allowed" : "move",
              zIndex: zIdx,
              userSelect: "none",
              opacity: wrapCSS.opacity,
              mixBlendMode: wrapCSS.mixBlendMode,
              background: wrapCSS.background,
              backdropFilter: wrapCSS.backdropFilter,
              WebkitBackdropFilter: (wrapCSS as any).WebkitBackdropFilter,
              borderRadius: wrapCSS.borderRadius,
              padding: wrapCSS.padding,
            }}
            onPointerDown={e => handleSlotPointerDown(slot.id, e)}
            onClick={e => e.stopPropagation()}
          >
            {warpType && warpType !== "none" ? (
              <div className="flex justify-center" style={{ width: "100%", overflow: "visible" }}>
                <SvgWarpText
                  text={plainText}
                  warpType={warpType}
                  warpAmount={warpAmount}
                  cssStyle={css}
                  pathWidth={220}
                />
              </div>
            ) : (
              <span style={css} className="whitespace-pre-line">{value}</span>
            )}

            {/* Selection bounding box */}
            {selected && (
              <div style={{
                position: "absolute", inset: -5,
                border: `2px solid ${locked ? "#6B7280" : "#D6A84F"}`,
                borderStyle: locked ? "dashed" : "solid",
                borderRadius: 4, pointerEvents: "none",
                boxShadow: locked ? "none" : "0 0 0 1px rgba(214,168,79,0.2)",
              }} />
            )}
            {/* Move cursor indicator when selected */}
            {selected && !locked && (
              <div style={{
                position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
                background: "#D6A84F", color: "#0B1833", borderRadius: 4, padding: "1px 6px",
                fontSize: 9, fontWeight: 700, pointerEvents: "none", whiteSpace: "nowrap",
              }}>
                {slot.label || "טקסט"}
              </div>
            )}
          </div>
        );
      })}

      {/* Regular placed elements */}
      {regularElements.map(pe => (
        <div
          key={pe.uid}
          onClick={e => { e.stopPropagation(); onSelectElement?.(pe.uid === selectedElementUid ? null : pe.uid); }}
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

      {/* Logo */}
      {logoUrl && (
        <div
          style={{ position: "absolute", left: `${logoPos.x}%`, top: `${logoPos.y}%`, width: `${logoPos.width}%`, zIndex: 25, cursor: onLogoMove ? "grab" : "default", touchAction: "none" }}
          onPointerDown={e => {
            if (!onLogoMove) return;
            e.stopPropagation();
            dragRef.current = { type: "logo", id: "logo", startCX: e.clientX, startCY: e.clientY, startX: logoPos.x, startY: logoPos.y };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
        >
          <img src={logoUrl} alt="לוגו" draggable={false} style={{ width: "100%", height: "auto", objectFit: "contain", filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }} />
          {onLogoMove && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5" onPointerDown={e => e.stopPropagation()}>
              <button className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center shadow"
                onClick={e => { e.stopPropagation(); onLogoMove({ ...logoPos, width: Math.max(5, logoPos.width - 5) }); }}>−</button>
              <button className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center shadow"
                onClick={e => { e.stopPropagation(); onLogoMove({ ...logoPos, width: Math.min(80, logoPos.width + 5) }); }}>+</button>
            </div>
          )}
        </div>
      )}

      {/* Smart guides */}
      {guides.map((g, i) => {
        const isCenter = g.isCenter;
        const isEl = g.isElement;
        const color = isEl ? "#60A5FA" : (isCenter ? "#D6A84F" : "#D6A84F");
        const opacity = isCenter ? 1 : (isEl ? 0.9 : 0.65);
        const thickness = isCenter ? 1.5 : 1;
        const dashStyle = isEl ? "4px, 3px" : undefined;
        if (g.axis === "x") return (
          <div key={i} style={{ position: "absolute", left: `${g.pos}%`, top: 0, height: "100%", width: thickness, background: color, opacity, pointerEvents: "none", zIndex: 200, backgroundImage: dashStyle ? `repeating-linear-gradient(180deg,${color} 0,${color} 4px,transparent 4px,transparent 7px)` : undefined, backgroundColor: dashStyle ? "transparent" : color }}>
            {isCenter && <span style={{ position: "absolute", top: 4, left: 3, fontSize: 7, fontWeight: 700, color, whiteSpace: "nowrap", textShadow: "0 0 3px #0B1833" }}>מרכז</span>}
          </div>
        );
        return (
          <div key={i} style={{ position: "absolute", top: `${g.pos}%`, left: 0, width: "100%", height: thickness, background: color, opacity, pointerEvents: "none", zIndex: 200, backgroundImage: dashStyle ? `repeating-linear-gradient(90deg,${color} 0,${color} 4px,transparent 4px,transparent 7px)` : undefined, backgroundColor: dashStyle ? "transparent" : color }}>
            {isCenter && <span style={{ position: "absolute", right: 4, top: 2, fontSize: 7, fontWeight: 700, color, whiteSpace: "nowrap", textShadow: "0 0 3px #0B1833" }}>מרכז</span>}
          </div>
        );
      })}

      {/* Watermark */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.25, zIndex: 30 }}>
        <img src={hadarLogo} alt="הדר" style={{ height: 16, width: "auto", objectFit: "contain" }} />
      </div>
    </div>
  );
}

// ─── Auth / Payment walls ──────────────────────────────────────────────────────
function AuthWall({ templateId }: { templateId: string }) {
  const { redirectToSignIn } = useClerk();
  const redirectUrl = `${basePath}/editor/${templateId}`;
  return (
    <div className="absolute inset-0 z-20 rounded-xl overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0B1833 0%, #0f2347 50%, #0B1833 100%)" }} />
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ background: "rgba(11,24,51,0.82)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-8" dir="rtl">
          <div className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-serif text-xl font-bold mb-2 text-foreground">נדרשת כניסה</h3>
          <p className="text-sm text-primary/60 mb-5">כנסו כדי לשמור ולשלם</p>
          <Button onClick={() => redirectToSignIn({ redirectUrl })} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 px-6 py-4">
            <LogIn className="w-4 h-4" />כניסה / הרשמה
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentWall({ onPay, onClose, loading, designName }: { onPay: () => void; onClose: () => void; loading: boolean; designName: string }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()} className="bg-card border border-primary/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative" dir="rtl">
          <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/10 text-muted-foreground">
            <XIcon className="w-4 h-4" />
          </button>
          <Crown className="w-10 h-10 text-primary mx-auto mb-1" />
          <div className="w-16 h-px bg-primary/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2 text-foreground">קבלת העיצוב הסופי</h2>
          <p className="text-muted-foreground text-sm mb-6">לאחר התשלום תקבלו קבצי עיצוב סופיים לבית דפוס ולרשתות החברתיות.</p>
          <div className="bg-secondary/40 border border-primary/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground font-medium">{designName}</span>
              <span className="font-serif font-bold text-primary text-lg">₪49</span>
            </div>
            <p className="text-xs text-muted-foreground text-right">קבצי DXF, PNG, PDF • שירות לקוחות VIP</p>
          </div>
          <ul className="text-right text-xs text-muted-foreground mb-6 space-y-1.5">
            {["קבצי עיצוב סופיים לבית דפוס (PDF/PNG)", "גרסה לרשתות חברתיות", "תיקון אחד ללא תוספת", "מסירה תוך 48 שעות"].map(item => (
              <li key={item} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />{item}</li>
            ))}
          </ul>
          <Button onClick={onPay} disabled={loading} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 text-base shadow-lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            {loading ? "מעביר לתשלום..." : "לתשלום מאובטח — ₪49"}
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3">תשלום מאובטח דרך Stripe</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Layer item ────────────────────────────────────────────────────────────────
function LayerItem({
  slot, index, selected, locked, visible, value,
  onSelect, onToggleLock, onToggleVisible, onDuplicate, onDelete, onBringUp, onSendDown,
}: {
  slot: TextSlot; index: number; selected: boolean; locked: boolean; visible: boolean; value: string;
  onSelect: () => void; onToggleLock: () => void; onToggleVisible: () => void;
  onDuplicate: () => void; onDelete: () => void; onBringUp: () => void; onSendDown: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isUserSlot = slot.id.startsWith("user_");
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all group relative ${selected ? "bg-primary/15 border border-primary/30" : "hover:bg-primary/5 border border-transparent"}`}
      onClick={onSelect}
    >
      <div className="w-5 h-5 rounded bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0">
        {locked ? <Lock className="w-2.5 h-2.5" /> : index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-foreground truncate">{slot.label || "טקסט"}</p>
        <p className="text-[9px] text-muted-foreground truncate">{value?.replace(/<[^>]+>/g, "").slice(0, 20) || "ריק"}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
        <button onClick={onToggleVisible} className="p-0.5 hover:text-primary transition-colors" title={visible ? "הסתר" : "הצג"}>
          {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />}
        </button>
        <button onClick={onToggleLock} className="p-0.5 hover:text-primary transition-colors" title={locked ? "בטל נעילה" : "נעל"}>
          {locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className="p-0.5 hover:text-primary transition-colors">
            <MoreVertical className="w-3 h-3" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full mt-1 bg-card border border-primary/20 rounded-xl shadow-xl z-50 w-32 py-1 text-xs"
              onMouseLeave={() => setMenuOpen(false)}>
              <button className="w-full px-3 py-1.5 text-right hover:bg-primary/10 flex items-center gap-2" onClick={() => { onBringUp(); setMenuOpen(false); }}>
                <ArrowUp className="w-3 h-3" />הבא קדימה
              </button>
              <button className="w-full px-3 py-1.5 text-right hover:bg-primary/10 flex items-center gap-2" onClick={() => { onSendDown(); setMenuOpen(false); }}>
                <ArrowDown className="w-3 h-3" />שלח אחורה
              </button>
              <button className="w-full px-3 py-1.5 text-right hover:bg-primary/10 flex items-center gap-2" onClick={() => { onDuplicate(); setMenuOpen(false); }}>
                <Copy className="w-3 h-3" />שכפל
              </button>
              {isUserSlot && (
                <button className="w-full px-3 py-1.5 text-right hover:bg-destructive/10 text-destructive flex items-center gap-2" onClick={() => { onDelete(); setMenuOpen(false); }}>
                  <Trash2 className="w-3 h-3" />מחק
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Editor ───────────────────────────────────────────────────────────────
export default function Editor() {
  const params = useParams();
  const id = params.id;

  const [template, setTemplate] = useState<Template | null | "loading">("loading");
  const [templateLoadError, setTemplateLoadError] = useState(false);

  useEffect(() => {
    if (!id) { setTemplate(null); return; }
    setTemplate("loading");
    fetch(`${API_BASE}/api/hadar/public-templates`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) throw new Error("bad response");
        const found = data.find(t => String(t.id) === id || t.slug === id);
        if (!found) { setTemplate(null); setTemplateLoadError(true); return; }
        const bgImg = found.displayImageUrl || found.imageUrl;
        const isGrad = !bgImg || /gradient|linear|radial/i.test(bgImg);
        const mapped: Template = {
          id: String(found.id), slug: found.slug, title: found.title, subtitle: found.subtitle,
          category: found.category, style: found.style, price: Math.round((found.price || 0) / 100),
          image: bgImg || "linear-gradient(135deg, #0B1833 0%, #1a2d54 100%)", isGradient: isGrad,
          slots: Array.isArray(found.slots) ? found.slots : [],
          galleryImageUrl: found.galleryImageUrl, displayImageUrl: found.displayImageUrl,
          dimensions: found.dimensions,
        };
        setTemplate(mapped);
      })
      .catch(err => { console.error("[HADAR] template load failed:", err); setTemplate(null); setTemplateLoadError(true); });
  }, [id]);

  const { theme } = useTheme();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const { redirectToSignIn } = useClerk();
  const [, navigate] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const designIdParam = searchParams.get("design");
  const paymentStatus = searchParams.get("payment");

  // ── Core state ────────────────────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [designId, setDesignId] = useState<number | null>(designIdParam ? Number(designIdParam) : null);
  const [designName, setDesignName] = useState("עיצוב שלי");
  const [layerFontOpen, setLayerFontOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPos, setLogoPos] = useState<LogoPos>({ x: 30, y: 2, width: 40 });
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [selectedElementUid, setSelectedElementUid] = useState<string | null>(null);

  // ── Per-slot state ────────────────────────────────────────────────────────────
  const [values, setValues] = useState<Record<string, string>>({});
  const [slotStyles, setSlotStyles] = useState<Record<string, SlotStyle>>({});
  const [slotPositions, setSlotPositions] = useState<Record<string, SlotPos>>({});
  const [userSlots, setUserSlots] = useState<TextSlot[]>([]);
  const [lockedSlots, setLockedSlots] = useState<Set<string>>(new Set());
  const [hiddenSlots, setHiddenSlots] = useState<Set<string>>(new Set());
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<"text" | "elements" | "design">("text");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [smartApplied, setSmartApplied] = useState(false);
  const [autoFixed, setAutoFixed] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────────
  const templateSlots = template && template !== "loading" ? (template.slots || []).filter(s => !SYSTEM_SLOT_IDS.has(s.id)) : [];
  const allSlots = [...templateSlots, ...userSlots];
  const visibleSlots = allSlots.filter(s => !hiddenSlots.has(s.id));
  const activeSlot = allSlots.find(s => s.id === activeSlotId) ?? null;

  // ── Load default font ─────────────────────────────────────────────────────────
  useEffect(() => { loadGoogleFont(DEFAULT_FONT); }, []);

  // ── Close per-layer font picker when active slot changes ──────────────────────
  useEffect(() => { setLayerFontOpen(false); }, [activeSlotId]);

  // ── Initialize slot values + positions when template loads ────────────────────
  const initValues = useCallback(() => {
    const tmpl = template && template !== "loading" ? template : null;
    const init: Record<string, string> = {};
    (tmpl?.slots || []).filter(s => !SYSTEM_SLOT_IDS.has(s.id)).forEach(s => { init[s.id] = s.defaultValue; });
    return init;
  }, [template]);

  const initPositions = useCallback((slots: TextSlot[], existing: Record<string, SlotPos> = {}): Record<string, SlotPos> => {
    const pos: Record<string, SlotPos> = { ...existing };
    slots.filter(s => !SYSTEM_SLOT_IDS.has(s.id)).forEach((s, i, arr) => {
      if (!pos[s.id]) {
        pos[s.id] = s.x != null && s.y != null
          ? { x: s.x, y: s.y, width: s.width ?? 80 }
          : getDefaultPos(i, arr.length);
      }
    });
    return pos;
  }, []);

  useEffect(() => {
    if (!template || template === "loading") return;
    if (designId) return;
    setValues(initValues());
    setSlotPositions(initPositions(template.slots || []));
    // Initialize slotStyles from template slot data so admin-designed effects
    // (gradients, 3D, shadows, fonts) are visible to users out of the box
    const initSS: Record<string, SlotStyle> = {};
    (template.slots || []).filter(s => !SYSTEM_SLOT_IDS.has(s.id)).forEach(s => {
      const base: SlotStyle = {};
      const a = s as any;
      // Copy all style-relevant fields from the template slot
      if (a.fontFamily) base.fontFamily = a.fontFamily;
      if (a.fontSizePx) base.fontSize = a.fontSizePx;
      if (a.color)      base.color = a.color;
      if (a.bold)       base.bold = a.bold;
      if (a.italic)     base.italic = a.italic;
      if (a.letterSpacing != null) base.letterSpacing = a.letterSpacing;
      if (a.lineHeight  != null)   base.lineHeight = a.lineHeight;
      if (a.shadow)     base.shadow = a.shadow;
      if (a.opacity != null && a.opacity !== 1) base.opacity = a.opacity;
      if (a.zIndex != null) base.zIndex = a.zIndex;
      if (a.warpType && a.warpType !== "none") { base.warpType = a.warpType; base.warpAmount = a.warpAmount ?? a.arcDegrees; }
      if (a.gradientEnabled) { base.gradientEnabled = a.gradientEnabled; base.gradientFrom = a.gradientFrom; base.gradientTo = a.gradientTo; base.gradientAngle = a.gradientAngle; }
      if (a.textureType && a.textureType !== "none") base.textureType = a.textureType;
      if (a.preset3D && a.preset3D !== "none") { base.preset3D = a.preset3D; (base as any).depth3D = a.depth3D; (base as any).lightAngle3D = a.lightAngle3D; (base as any).shadowStr3D = a.shadowStr3D; (base as any).highlight3D = a.highlight3D; (base as any).glow3D = a.glow3D; }
      if (a.strokeWidth) { base.strokeWidth = a.strokeWidth; base.strokeColor = a.strokeColor; }
      if (a.extrudeEnabled) { base.extrudeEnabled = a.extrudeEnabled; base.extrudeDepth = a.extrudeDepth; base.extrudeAngle = a.extrudeAngle; base.extrudeColor = a.extrudeColor; }
      if (a.glassEnabled) { base.glassEnabled = a.glassEnabled; base.glassBlur = a.glassBlur; base.glassColor = a.glassColor; base.glassBorderRadius = a.glassBorderRadius; }
      if (a.blendMode && a.blendMode !== "normal") base.blendMode = a.blendMode;
      if (a.rotation) base.rotation = a.rotation;
      if (a.skewX) base.skewX = a.skewX;
      if (a.skewY) base.skewY = a.skewY;
      if (Object.keys(base).length > 0) initSS[s.id] = base;
    });
    if (Object.keys(initSS).length > 0) setSlotStyles(initSS);
  }, [template]);

  // ── Load existing design ──────────────────────────────────────────────────────
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
          try { const els = JSON.parse(fv["__elements"] || "[]"); if (Array.isArray(els)) setPlacedElements(els); } catch {}
          try {
            const ss = JSON.parse(fv["__slotStyles"] || "{}");
            if (ss && typeof ss === "object") {
              setSlotStyles(ss);
              // Load all per-slot fonts that were saved
              Object.values(ss as Record<string, SlotStyle>).forEach(st => {
                if (!st.fontFamily) return;
                const isLocal = LOCAL_BA_FONTS.some(f => f.family === st.fontFamily);
                if (isLocal) loadLocalFont(st.fontFamily!);
                else loadGoogleFont(st.fontFamily!);
              });
            }
          } catch {}
          try { const lp = JSON.parse(fv["__logoPos"] || "null"); if (lp && typeof lp === "object") setLogoPos(lp); } catch {}
          try {
            const sp = JSON.parse(fv["__slotPositions"] || "{}");
            if (sp && typeof sp === "object") setSlotPositions(prev => initPositions(template && template !== "loading" ? (template.slots || []) : [], { ...sp }));
          } catch {}
          try { const us = JSON.parse(fv["__userSlots"] || "[]"); if (Array.isArray(us)) setUserSlots(us); } catch {}
          try { const ls = JSON.parse(fv["__lockedSlots"] || "[]"); if (Array.isArray(ls)) setLockedSlots(new Set(ls)); } catch {}
        }
      } catch (err) { console.error(err); }
    };
    load();
  }, [designId, isSignedIn]);

  // ── Payment return ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (paymentStatus === "cancelled") {
      setPayError("התשלום בוטל — הטיוטה שמורה, ניתן לנסות שוב בכל עת");
      setShowPayment(false);
    } else if (paymentStatus === "success") {
      const sessionId = searchParams.get("session_id");
      if (sessionId && isSignedIn) {
        const verify = async () => {
          try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/hadar/checkout/verify?session_id=${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
              const data = await res.json();
              if (data.status === "paid") {
                setPaySuccess(true);
                setPayError(null);
                setShowPayment(false);
              }
            }
          } catch (err) {
            console.error("[HADAR] payment verify error:", err);
          }
        };
        verify();
      }
    }
  }, [paymentStatus, isSignedIn]);

  // ── Keyboard: arrow keys to nudge selected slot ───────────────────────────────
  useEffect(() => {
    if (!activeSlotId) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      const arrows = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      if (!arrows.includes(e.key)) return;
      e.preventDefault();
      const step = e.shiftKey ? 5 : 0.5;
      setSlotPositions(prev => {
        const pos = prev[activeSlotId] ?? { x: 50, y: 50, width: 80 };
        const dx = e.key === "ArrowLeft" ? step : e.key === "ArrowRight" ? -step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        return { ...prev, [activeSlotId]: { ...pos, x: Math.max(0, Math.min(100, pos.x + dx)), y: Math.max(0, Math.min(100, pos.y + dy)) } };
      });
      setSaved(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeSlotId]);

  // ── Smart Layout helpers (defined inside so they can close over state setters) ─
  const applySmartLayout = useCallback(() => {
    type SlotRole = "title" | "subtitle" | "details" | "footer" | "other";
    const ROLE_ORDER: SlotRole[] = ["title", "subtitle", "details", "footer", "other"];

    function classify(label: string, idx: number): SlotRole {
      const l = label.toLowerCase();
      if (/שם|כותרת|ראשי|חתן|כלה|הורים|משפחה|ברוכים|מוזמן|מוזמנת/.test(l)) return "title";
      if (/תת|subtitle|כיתוב|תבנית|קטגוריה|תואר|תיאור/.test(l)) return "subtitle";
      if (/תאריך|שעה|מקום|כתובת|פרטים|אולם|מסיבה|agenda/.test(l)) return "details";
      if (/טלפון|הזמנה|footer|נא|rsvp|אישור|פרטי/.test(l)) return "footer";
      if (idx === 0) return "title";
      if (idx === 1) return "subtitle";
      return "other";
    }

    const ROLE_FONT: Record<SlotRole, string> = {
      title: "Noto Serif Hebrew",
      subtitle: "Frank Ruhl Libre",
      details: "Heebo",
      footer: "Heebo",
      other: "Frank Ruhl Libre",
    };
    const ROLE_SIZE: Record<SlotRole, number> = { title: 38, subtitle: 26, details: 20, footer: 14, other: 22 };
    const ROLE_WIDTH: Record<SlotRole, number> = { title: 88, subtitle: 78, details: 74, footer: 62, other: 75 };
    const ROLE_COLOR: Record<SlotRole, string> = {
      title: "#D6A84F", subtitle: "#F8F1E3", details: "#F8F1E3", footer: "#D6A84F", other: "#F8F1E3",
    };
    const ROLE_BOLD: Record<SlotRole, boolean> = { title: true, subtitle: false, details: false, footer: false, other: false };
    const ROLE_LINE: Record<SlotRole, number> = { title: 1.2, subtitle: 1.35, details: 1.5, footer: 1.4, other: 1.35 };
    const ROLE_SPACING: Record<SlotRole, number> = { title: 2, subtitle: 0.5, details: 0, footer: 0.5, other: 0 };

    function sizeForText(role: SlotRole, text: string): number {
      const base = ROLE_SIZE[role];
      const len = (text || "").trim().length;
      if (len === 0) return base;
      if (len < 8) return Math.round(base * 1.2);
      if (len < 20) return base;
      if (len < 40) return Math.round(base * 0.85);
      return Math.round(base * 0.7);
    }

    const slots = allSlots.filter(s => !SYSTEM_SLOT_IDS.has(s.id));
    if (slots.length === 0) return;

    const classified = slots.map((slot, i) => ({
      slot,
      role: classify(slot.label || "", i) as SlotRole,
      text: values[slot.id] ?? slot.defaultValue ?? "",
    }));
    classified.sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

    const count = classified.length;
    const TOP_PAD = 12, BOT_PAD = 10;
    const usable = 100 - TOP_PAD - BOT_PAD;

    const newPositions: Record<string, { x: number; y: number; width: number }> = { ...slotPositions };
    const newStyles: Record<string, SlotStyle> = { ...slotStyles };

    classified.forEach(({ slot, role, text }, i) => {
      const fraction = count === 1 ? 0.5 : i / (count - 1);
      const y = Math.round((TOP_PAD + fraction * usable) * 10) / 10;
      newPositions[slot.id] = { x: 50, y, width: ROLE_WIDTH[role] };
      newStyles[slot.id] = {
        ...(slotStyles[slot.id] || {}),
        fontFamily: ROLE_FONT[role],
        fontSize: sizeForText(role, text),
        color: ROLE_COLOR[role],
        bold: ROLE_BOLD[role],
        lineHeight: ROLE_LINE[role],
        letterSpacing: ROLE_SPACING[role],
      };
      loadGoogleFont(ROLE_FONT[role]);
    });

    setSlotPositions(newPositions);
    setSlotStyles(newStyles);
    setSaved(false);
    setSmartApplied(true);
    setTimeout(() => setSmartApplied(false), 2800);
  }, [allSlots, values, slotPositions, slotStyles]);

  // ── Auto Fix Design ────────────────────────────────────────────────────────────
  const applyAutoFix = useCallback(() => {
    const slots = allSlots.filter(s => !SYSTEM_SLOT_IDS.has(s.id));
    if (slots.length === 0) return;

    // Known valid Hebrew font family names (local + google)
    const VALID_FAMILIES = new Set<string>([
      "Frank Ruhl Libre", "Noto Serif Hebrew", "Heebo", "Rubik", "Assistant",
      "Alef", "Suez One", "Varela Round", "David Libre", "Miriam Libre",
      "Secular One", "Arimo",
      // local BA fonts
      "BA-Arzey-Bold", "BA-Arzey-Light", "BA-Barkai", "BA-Casablanca",
      "BA-Fontov-Bold", "BA-Fontov", "BA-HaYetzira-Light", "BA-HaYetzira",
      "BA-Kiriat-Kodesh", "BA-Maim-Haim", "BA-Mesubin", "BA-Moment",
      "BA-Niflaot", "BA-Platforma-Black", "BA-Platforma-Bold", "BA-Platforma-Light",
      "BA-Radlheim", "BA-Rishon",
    ]);

    // Approximate canvas width for fitting calculations
    const CANVAS_W = 820;

    const newStyles: Record<string, SlotStyle> = { ...slotStyles };
    const newPositions: Record<string, { x: number; y: number; width: number }> = { ...slotPositions };

    slots.forEach(slot => {
      const s: SlotStyle = { ...(slotStyles[slot.id] ?? {}) };
      const text = (values[slot.id] ?? slot.defaultValue ?? "").trim();
      const pos = slotPositions[slot.id] ?? { x: 50, y: 50, width: 80 };

      // ─── 1. Fix warp issues ────────────────────────────────────────────────
      if (s.warpType && s.warpType !== "none") {
        const amount = s.warpAmount ?? (s.arcDegrees != null ? Math.abs(s.arcDegrees) : 0);

        // Fix zero/near-zero warp amount (warp enabled but invisible → default)
        if (amount < 5) {
          s.warpAmount = 30;
          s.arcDegrees = 30;
        }
        // Fix extreme warp distortion
        if (amount > 78) {
          s.warpAmount = 45;
          s.arcDegrees = 45;
        }
        // Fix wave/circle/bulge at extreme amounts
        if ((s.warpType === "wave" || s.warpType === "circle") && (s.warpAmount ?? 0) > 60) {
          s.warpType = "arc-up";
          s.warpAmount = 35;
          s.arcDegrees = 35;
        }
        // Position-aware arc direction: top slots → arc-up, bottom → arc-down
        if (pos.y < 28 && s.warpType === "arc-down") s.warpType = "arc-up";
        if (pos.y > 72 && s.warpType === "arc-up")   s.warpType = "arc-down";
      }

      // ─── 2. Remove bad distortions ────────────────────────────────────────
      if (Math.abs(s.skewX ?? 0) > 25) s.skewX = 0;
      if (Math.abs(s.skewY ?? 0) > 25) s.skewY = 0;

      // ─── 3. Fix letter spacing ────────────────────────────────────────────
      const ls = s.letterSpacing ?? 0;
      if (ls < -5)  s.letterSpacing = 0;
      if (ls > 20)  s.letterSpacing = 2;

      // ─── 4. Fix line height ───────────────────────────────────────────────
      const lh = s.lineHeight ?? 1.35;
      if (lh < 0.85) s.lineHeight = 1.2;
      if (lh > 3.5)  s.lineHeight = 1.5;

      // ─── 5. Fix invisible color on dark canvas ────────────────────────────
      const c = s.color ?? "";
      if (!c || c === "#000000" || c === "#000" || c.toLowerCase() === "black") {
        s.color = "#F8F1E3"; // cream visible on navy
      }

      // ─── 6. Ensure Hebrew font family ────────────────────────────────────
      if (s.fontFamily && !VALID_FAMILIES.has(s.fontFamily) && !s.fontFamily.startsWith("BA-")) {
        s.fontFamily = DEFAULT_FONT;
        loadGoogleFont(DEFAULT_FONT);
      }

      // ─── 7. Fit font size to slot width (single-line overflow) ─────────────
      if (text.length > 0 && s.fontSize) {
        const slotPxW = (pos.width / 100) * CANVAS_W;
        const charPx   = (s.fontSize) * 0.62; // avg Hebrew char width ratio
        const charsPerLine = Math.max(1, Math.floor(slotPxW / charPx));
        // Only shrink if clearly overflowing AND slot is not multiline
        if (!slot.multiline && text.length > charsPerLine * 1.15) {
          const scale = Math.min(1, (charsPerLine / text.length) * 1.1);
          s.fontSize = Math.max(11, Math.round(s.fontSize * scale));
        }
      }

      // ─── 8. Fix opacity (0 = invisible) ──────────────────────────────────
      if ((s.opacity ?? 1) < 0.08) s.opacity = 1;

      // ─── 9. Center horizontally ───────────────────────────────────────────
      newPositions[slot.id] = { ...pos, x: 50 };

      newStyles[slot.id] = s;
    });

    setSlotPositions(newPositions);
    setSlotStyles(newStyles);
    setSaved(false);
    setAutoFixed(true);
    setTimeout(() => setAutoFixed(false), 2800);
  }, [allSlots, values, slotPositions, slotStyles]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const updateValue = (id: string, val: string) => { setValues(prev => ({ ...prev, [id]: val })); setSaved(false); };
  const resetAll = () => { setValues(initValues()); setSaved(false); };

  const addTextBox = () => {
    const newId = `user_${Date.now()}`;
    const newSlot: TextSlot = { id: newId, label: "שדה טקסט", placeholder: "הקלידו...", defaultValue: "טקסט חדש", x: 50, y: 50, width: 70 };
    setUserSlots(prev => [...prev, newSlot]);
    setSlotPositions(prev => ({ ...prev, [newId]: { x: 50, y: 50 + Object.keys(prev).length * 5, width: 70 } }));
    setValues(prev => ({ ...prev, [newId]: "טקסט חדש" }));
    setSlotStyles(prev => ({ ...prev, [newId]: { fontSize: 16, color: "#F8F1E3", fontFamily: DEFAULT_FONT } }));
    setActiveSlotId(newId);
    setSaved(false);
  };

  const duplicateSlot = (slotId: string) => {
    const original = allSlots.find(s => s.id === slotId);
    if (!original) return;
    const newId = `user_${Date.now()}`;
    const origPos = slotPositions[slotId] ?? { x: 50, y: 50, width: 80 };
    setUserSlots(prev => [...prev, { ...original, id: newId, label: `${original.label} (עותק)` }]);
    setSlotPositions(prev => ({ ...prev, [newId]: { ...origPos, x: Math.min(95, origPos.x + 5), y: Math.min(95, origPos.y + 5) } }));
    setValues(prev => ({ ...prev, [newId]: values[slotId] ?? original.defaultValue }));
    setSlotStyles(prev => ({ ...prev, [newId]: { ...(prev[slotId] || {}) } }));
    setActiveSlotId(newId);
    setSaved(false);
  };

  const deleteUserSlot = (slotId: string) => {
    setUserSlots(prev => prev.filter(s => s.id !== slotId));
    setValues(prev => { const n = { ...prev }; delete n[slotId]; return n; });
    setSlotStyles(prev => { const n = { ...prev }; delete n[slotId]; return n; });
    setSlotPositions(prev => { const n = { ...prev }; delete n[slotId]; return n; });
    if (activeSlotId === slotId) setActiveSlotId(null);
    setSaved(false);
  };

  const toggleLock = (slotId: string) => {
    setLockedSlots(prev => { const n = new Set(prev); n.has(slotId) ? n.delete(slotId) : n.add(slotId); return n; });
  };

  const toggleVisible = (slotId: string) => {
    setHiddenSlots(prev => { const n = new Set(prev); n.has(slotId) ? n.delete(slotId) : n.add(slotId); return n; });
  };

  const bringForward = (slotId: string) => {
    setSlotStyles(prev => {
      const z = ((prev[slotId]?.zIndex as number) ?? 10) + 1;
      return { ...prev, [slotId]: { ...(prev[slotId] || {}), zIndex: z } };
    });
    setSaved(false);
  };

  const sendBackward = (slotId: string) => {
    setSlotStyles(prev => {
      const z = Math.max(1, ((prev[slotId]?.zIndex as number) ?? 10) - 1);
      return { ...prev, [slotId]: { ...(prev[slotId] || {}), zIndex: z } };
    });
    setSaved(false);
  };

  // ── Canvas Alignment ──────────────────────────────────────────────────────────
  type AlignType = "left" | "center-h" | "right" | "top" | "center-v" | "bottom" | "center-both";

  const measureSlotHeightPct = (slotId: string): number => {
    const canvas = previewRef.current;
    if (!canvas) return 0;
    const el = canvas.querySelector(`[data-slot-id="${slotId}"]`) as HTMLElement | null;
    if (!el) return 0;
    const canvasRect = canvas.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    // zoom cancels out in ratio
    return (elRect.height / canvasRect.height) * 100;
  };

  const alignActiveSlot = (type: AlignType) => {
    if (!activeSlotId) return;
    const pos = slotPositions[activeSlotId] ?? { x: 50, y: 50, width: 80 };
    // Text slots: center anchor at x% (translateX -50%), top-edge at y%
    let newX = pos.x;
    let newY = pos.y;
    switch (type) {
      case "left":      newX = pos.width / 2;           break;
      case "center-h":  newX = 50;                       break;
      case "right":     newX = 100 - pos.width / 2;     break;
      case "top":       newY = 0;                         break;
      case "center-v": {
        const hPct = measureSlotHeightPct(activeSlotId);
        newY = hPct > 0 ? 50 - hPct / 2 : 50;
        break;
      }
      case "bottom": {
        const hPct = measureSlotHeightPct(activeSlotId);
        newY = hPct > 0 ? 100 - hPct : 92;
        break;
      }
      case "center-both": {
        newX = 50;
        const hPct = measureSlotHeightPct(activeSlotId);
        newY = hPct > 0 ? 50 - hPct / 2 : 50;
        break;
      }
    }
    setSlotPositions(prev => ({ ...prev, [activeSlotId]: { ...pos, x: +newX.toFixed(2), y: +newY.toFixed(2) } }));
    setSaved(false);
  };

  const alignLogo = (type: AlignType) => {
    // Logo: left-edge at x%, top-edge at y%
    let newX = logoPos.x;
    let newY = logoPos.y;
    switch (type) {
      case "left":      newX = 0;                              break;
      case "center-h":  newX = (100 - logoPos.width) / 2;     break;
      case "right":     newX = 100 - logoPos.width;            break;
      case "top":       newY = 0;                              break;
      case "center-v":  newY = 40;                             break; // approximate mid
      case "bottom":    newY = 85;                             break; // approximate
      case "center-both": newX = (100 - logoPos.width) / 2; newY = 40; break;
    }
    setLogoPos(prev => ({ ...prev, x: +newX.toFixed(2), y: +newY.toFixed(2) }));
    setSaved(false);
  };

  const getFieldValuesWithElements = useCallback(() => ({
    ...values,
    "__elements": JSON.stringify(placedElements),
    "__slotStyles": JSON.stringify(slotStyles),
    "__logoPos": JSON.stringify(logoPos),
    "__slotPositions": JSON.stringify(slotPositions),
    "__userSlots": JSON.stringify(userSlots),
    "__lockedSlots": JSON.stringify([...lockedSlots]),
  }), [values, placedElements, slotStyles, logoPos, slotPositions, userSlots, lockedSlots]);

  const handleAutoSave = async (): Promise<number | null> => {
    if (!isSignedIn || !template || template === "loading") return null;
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
          body: JSON.stringify({ templateId: (template as Template).id, fieldValues: fv, designName }),
        });
        const data = await res.json();
        setDesignId(data.id);
        return data.id;
      }
    } catch (err) { console.error(err); return null; }
    finally { setSaving(false); setSaved(true); }
  };

  const handleSave = () => handleAutoSave();

  const handleDownloadClick = async () => {
    if (paySuccess) { handleDownload(); return; }
    if (!isSignedIn) return;
    const savedId = await handleAutoSave();
    if (savedId) setShowPayment(true);
  };

  const handlePay = async () => {
    if (!isSignedIn || !template || template === "loading") return;
    setPayLoading(true);
    try {
      const savedId = await handleAutoSave();
      if (!savedId) { setPayLoading(false); return; }
      const token = await getToken();
      const fv = getFieldValuesWithElements();
      const res = await fetch(`${API_BASE}/api/hadar/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          designId: savedId,
          templateId: (template as Template).id,
          designName,
          fieldValues: fv,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      console.error("[HADAR] checkout error:", data.error);
    } catch (err) { console.error("[HADAR] checkout error:", err); }
    setPayLoading(false);
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      // 1. Verify payment on server before generating file
      if (designId) {
        const token = await getToken();
        const authRes = await fetch(`${API_BASE}/api/hadar/designs/${designId}/download-auth`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!authRes.ok) {
          const err = await authRes.json().catch(() => ({}));
          console.error("[HADAR] download not authorized:", err);
          alert("ההורדה לא מורשית — יש לבצע תשלום תחילה");
          setDownloading(false);
          return;
        }
      }

      // 2. Generate PNG client-side
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 3, useCORS: true, allowTaint: true,
        backgroundColor: null, logging: false,
      });
      const link = document.createElement("a");
      link.download = `hadar-${designName.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) { console.error("[HADAR] download failed:", err); }
    finally { setDownloading(false); }
  };

  const handleWhatsApp = () => {
    const msg = `שלום, אני מעוניין בעיצוב הזמנה — ${designName}`;
    window.open(`https://wa.me/972501234567?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleAddElement = useCallback((el: { id: number; fileContent: string; category?: string }) => {
    const uid = `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const isFrame = el.category === "מסגרות";
    setPlacedElements(prev => [...prev, { uid, elementId: el.id, src: el.fileContent, category: el.category, x: isFrame ? 0 : 35, y: isFrame ? 0 : 35, width: isFrame ? 100 : 25, tintColor: "", opacity: 1, isFrame }]);
    setSelectedElementUid(uid);
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

  // ── Loading / Error states ────────────────────────────────────────────────────
  if (template === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">טוען תבנית...</p>
        </div>
      </div>
    );
  }

  if (!template || templateLoadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-foreground">תבנית לא נמצאה</p>
          <Link href="/design-templates"><Button variant="outline">חזרה לגלריה</Button></Link>
        </div>
      </div>
    );
  }

  const tmpl = template as Template;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col bg-background" dir="rtl">
      {/* ── PAYMENT ERROR BANNER ── */}
      {payError && (
        <div className="shrink-0 bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400 text-xs py-2 px-4 flex items-center justify-center gap-2 z-20">
          <span>⚠</span>
          <span>{payError}</span>
          <button onClick={() => setPayError(null)} className="underline hover:no-underline">סגור</button>
        </div>
      )}
      {/* ── SUCCESS BANNER ── */}
      {paySuccess && (
        <div className="shrink-0 bg-green-500/10 border-b border-green-500/20 text-green-700 dark:text-green-400 text-xs py-2 px-4 flex items-center justify-center gap-2 z-20">
          <span>✓</span>
          <span>התשלום הושלם בהצלחה — הורידו את הקובץ הסופי</span>
        </div>
      )}
      {/* ── HEADER ── */}
      <header className="h-12 border-b border-primary/10 bg-card flex items-center justify-between px-3 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Link href="/design-templates">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
              גלריה
            </button>
          </Link>
          <div className="w-px h-4 bg-primary/20" />
          <img src={hadarLogo} alt="הדר" className="h-6 w-auto" />
          <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[160px]">{tmpl.title}</span>
        </div>

        {/* Steps */}
        <div className="hidden md:flex items-center gap-1 text-[10px]">
          {[{ n: "1", l: "ערכו", done: true }, { n: "2", l: "שמרו", done: isSignedIn && saved }, { n: "3", l: "תשלום", done: paySuccess }].map((step, i) => (
            <div key={step.n} className="flex items-center gap-1">
              {i > 0 && <span className="text-primary/30">←</span>}
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${step.done ? "bg-green-600 text-white" : "bg-primary/20 text-primary"}`}>
                {step.done ? "✓" : step.n}
              </span>
              <span className={step.done ? "text-green-600" : "text-muted-foreground"}>{step.l}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {isSignedIn && (
            <Link href="/my-designs">
              <Button size="sm" variant="ghost" className="text-muted-foreground gap-1 h-7 px-2 hidden sm:flex text-xs">
                <User className="w-3 h-3" />העיצובים שלי
              </Button>
            </Link>
          )}
          <Button size="sm" variant="ghost" onClick={resetAll} className="text-muted-foreground gap-1 h-7 px-2 text-xs">
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}
            className={`gap-1 h-7 px-3 text-xs ${saved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"} text-primary-foreground`}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            {saving ? "שומר..." : saved ? "נשמר!" : "שמירה"}
          </Button>
        </div>
      </header>

      {/* Payment success banner */}
      {paySuccess && (
        <div className="bg-green-600 text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center gap-2 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          התשלום הצליח! לשאלות: <button onClick={handleWhatsApp} className="underline">ווצאפ</button>
        </div>
      )}

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Layers panel — hidden in preview mode ── */}
        <div className={`w-48 shrink-0 border-l border-primary/10 bg-card flex-col ${viewMode === "edit" ? "hidden lg:flex" : "hidden"}`}>
          <div className="px-3 py-2 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">שכבות</span>
            </div>
            <button
              onClick={addTextBox}
              className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              title="הוסף תיבת טקסט"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {allSlots.filter(s => !SYSTEM_SLOT_IDS.has(s.id)).map((slot, i) => (
              <LayerItem
                key={slot.id}
                slot={slot}
                index={i}
                selected={activeSlotId === slot.id}
                locked={lockedSlots.has(slot.id)}
                visible={!hiddenSlots.has(slot.id)}
                value={values[slot.id] ?? slot.defaultValue}
                onSelect={() => setActiveSlotId(activeSlotId === slot.id ? null : slot.id)}
                onToggleLock={() => toggleLock(slot.id)}
                onToggleVisible={() => toggleVisible(slot.id)}
                onDuplicate={() => duplicateSlot(slot.id)}
                onDelete={() => deleteUserSlot(slot.id)}
                onBringUp={() => bringForward(slot.id)}
                onSendDown={() => sendBackward(slot.id)}
              />
            ))}
            {allSlots.filter(s => !SYSTEM_SLOT_IDS.has(s.id)).length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-4">אין שכבות</p>
            )}
          </div>
          <div className="border-t border-primary/10 p-2">
            <button
              onClick={addTextBox}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors border border-dashed border-primary/30"
            >
              <Plus className="w-3 h-3" />
              הוסף טקסט
            </button>
          </div>
        </div>

        {/* ── CENTER: Canvas ── */}
        <main className="flex-1 bg-secondary/20 flex flex-col items-center overflow-auto">

          {/* Mode toggle + zoom controls */}
          <div className="flex items-center gap-2 mt-3 mb-3 shrink-0 flex-wrap justify-center px-4">

            {/* Preview / Edit mode toggle */}
            <div className="flex items-center bg-card border border-primary/15 rounded-full p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === "preview" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Eye className="w-3 h-3" />
                תצוגה מקדימה
              </button>
              <button
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === "edit" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Pencil className="w-3 h-3" />
                עריכה מלאה
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2 bg-card border border-primary/10 rounded-full px-3 py-1 shadow-sm">
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="text-muted-foreground hover:text-foreground p-0.5">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono w-9 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.8, z + 0.1))} className="text-muted-foreground hover:text-foreground p-0.5">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {viewMode === "edit" && (
                <>
                  <div className="w-px h-3 bg-primary/20" />
                  <span className="text-[10px] text-muted-foreground hidden sm:block">גרור לזוז • חיצים לכוונון</span>
                </>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div
            className="px-4 pb-4 w-full max-w-sm relative"
            style={{
              transformOrigin: "top center",
              // In preview mode: disable all pointer events on canvas content
              pointerEvents: viewMode === "preview" ? "none" : undefined,
            }}
          >
            <InteractiveCanvas
              template={tmpl}
              values={values}
              slotStyles={slotStyles}
              slotPositions={slotPositions}
              allSlots={visibleSlots}
              activeSlotId={viewMode === "preview" ? null : activeSlotId}
              lockedSlots={lockedSlots}
              fontOverride={DEFAULT_FONT}
              logoUrl={logoUrl}
              logoPos={logoPos}
              placedElements={placedElements}
              selectedElementUid={selectedElementUid}
              zoom={zoom}
              readonly={viewMode === "preview"}
              canvasRef={previewRef as React.RefObject<HTMLDivElement>}
              onSlotSelect={id => {
                if (viewMode === "preview") return;
                setActiveSlotId(id);
                if (id) setRightTab("text");
              }}
              onSlotMove={(slotId, x, y) => {
                if (viewMode === "preview") return;
                setSlotPositions(prev => ({ ...prev, [slotId]: { ...(prev[slotId] ?? { width: 80 }), x, y } }));
                setSaved(false);
              }}
              onLogoMove={pos => { if (viewMode === "preview") return; setLogoPos(pos); setSaved(false); }}
              onSelectElement={uid => { if (viewMode === "preview") return; setSelectedElementUid(uid); if (uid) setRightTab("elements" as any); }}
            />
          </div>

          <p className="text-[10px] text-muted-foreground text-center pb-4 px-4">
            {viewMode === "preview"
              ? "מצב תצוגה — לחצו על \"עריכה מלאה\" כדי לערוך"
              : "גרור שדות לכל מקום • חיצים לכוונון מדויק"}
          </p>
        </main>

        {/* ── RIGHT: Properties panel ── */}
        <aside className="w-72 xl:w-80 shrink-0 border-r border-primary/10 bg-card flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-primary/10 shrink-0">
            {(["text", "elements"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { if (viewMode === "preview") { setViewMode("edit"); } setRightTab(tab); }}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${rightTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"}`}
              >
                {tab === "text" ? <><Type className="w-3 h-3" />טקסטים</> : <><Layers className="w-3 h-3" />אלמנטים{placedElements.length > 0 && <span className="bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{placedElements.length}</span>}</>}
              </button>
            ))}
          </div>

          {/* Preview mode notice */}
          {viewMode === "preview" && (
            <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-primary/8 border border-primary/20 flex items-center gap-2" dir="rtl">
              <Eye className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground">מצב תצוגה מקדימה</p>
                <p className="text-[10px] text-muted-foreground">לחצו עריכה מלאה כדי לשנות טקסטים וסגנונות</p>
              </div>
              <button
                onClick={() => setViewMode("edit")}
                className="shrink-0 flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors"
              >
                <Pencil className="w-2.5 h-2.5" />
                עריכה
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {/* ── Text tab ── */}
            {rightTab === "text" && (
              <div className="divide-y divide-primary/10">
                {/* Design name */}
                {isSignedIn && (
                  <div className="px-4 py-2.5">
                    <Input
                      value={designName}
                      onChange={e => setDesignName(e.target.value)}
                      placeholder="שם העיצוב שלכם..."
                      className="h-8 text-xs bg-transparent border-0 border-b border-primary/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary/40"
                      dir="rtl"
                    />
                  </div>
                )}

                {/* ── Smart Design Tools ─────────────────────────── */}
                <div className="px-4 py-3 border-b border-primary/10 space-y-2" dir="rtl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-primary opacity-70" />
                    <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider">כלי עיצוב חכם</span>
                  </div>

                  {/* Improve Layout */}
                  <button
                    onClick={applySmartLayout}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                      smartApplied
                        ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-400"
                        : "bg-gradient-to-l from-primary/25 to-primary/10 border border-primary/30 text-primary hover:from-primary/35 hover:to-primary/18 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10"
                    }`}
                  >
                    {smartApplied ? (
                      <><CheckCircle2 className="w-4 h-4 shrink-0" /><span>פריסה שופרה!</span></>
                    ) : (
                      <><Wand2 className="w-4 h-4 shrink-0" /><span>שפר פריסה ועיצוב</span></>
                    )}
                  </button>
                  <p className="text-[10px] text-muted-foreground leading-snug pr-0.5">
                    מסדר מיקומים, גודלי גופן, צבעים וזוגות גופנים
                  </p>

                  {/* Auto Fix Design */}
                  <button
                    onClick={applyAutoFix}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                      autoFixed
                        ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-400"
                        : "bg-gradient-to-l from-amber-500/15 to-amber-500/5 border border-amber-500/25 text-amber-400 hover:from-amber-500/25 hover:to-amber-500/10 hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/10"
                    }`}
                  >
                    {autoFixed ? (
                      <><CheckCircle2 className="w-4 h-4 shrink-0" /><span>תוקן בהצלחה!</span></>
                    ) : (
                      <><Settings2 className="w-4 h-4 shrink-0" /><span>תקן עיצוב אוטומטית</span></>
                    )}
                  </button>
                  <p className="text-[10px] text-muted-foreground leading-snug pr-0.5">
                    מתקן עיקומים שבורים, מרווחים, הטיות, גדלי גופן וצבעים
                  </p>
                </div>

                {/* Per-layer font picker */}
                <div className="border-b border-primary/10">
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      if (!activeSlotId) return;
                      setLayerFontOpen(o => !o);
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Type className="w-3.5 h-3.5 text-primary shrink-0" />
                      {activeSlotId ? (
                        <>
                          <span className="text-xs font-semibold shrink-0">גופן שכבה:</span>
                          <span
                            className="text-xs text-primary truncate"
                            style={{ fontFamily: `'${slotStyles[activeSlotId]?.fontFamily || DEFAULT_FONT}', serif` }}
                          >
                            {slotStyles[activeSlotId]?.fontFamily || DEFAULT_FONT}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-muted-foreground">גופן שכבה</span>
                          <span className="text-[10px] text-muted-foreground">— בחרו שכבה</span>
                        </>
                      )}
                    </div>
                    {activeSlotId
                      ? (layerFontOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />)
                      : <span className="w-3.5 h-3.5 shrink-0" />
                    }
                  </button>
                  {layerFontOpen && activeSlotId && (
                    <FontPickerPanel
                      selected={slotStyles[activeSlotId]?.fontFamily || DEFAULT_FONT}
                      onChange={f => {
                        setSlotStyles(prev => ({ ...prev, [activeSlotId]: { ...(prev[activeSlotId] || {}), fontFamily: f } }));
                        setSaved(false);
                      }}
                    />
                  )}
                  {!activeSlotId && (
                    <div className="px-4 pb-3 text-[11px] text-muted-foreground leading-relaxed">
                      לחצו על שכבת טקסט בקנבס או ברשימה כדי לשנות את הגופן שלה בנפרד.
                    </div>
                  )}
                </div>

                {/* Logo */}
                <LogoUploader logoUrl={logoUrl} onChange={url => { setLogoUrl(url); setSaved(false); }} />

                {/* Logo alignment buttons — shown only when logo is uploaded */}
                {logoUrl && (
                  <div className="px-4 pb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] text-muted-foreground uppercase font-medium tracking-wide">מיקום לוגו</label>
                      <button
                        title="מרכז לוגו בקנבס"
                        onClick={() => alignLogo("center-both")}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors text-[10px] font-bold"
                      >
                        <Crosshair className="w-3 h-3" />
                        מרכז
                      </button>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {([
                        { type: "left" as AlignType,      icon: <AlignStartHorizontal className="w-3.5 h-3.5" />, title: "ישר לוגו לשמאל" },
                        { type: "center-h" as AlignType,  icon: <AlignCenterHorizontal className="w-3.5 h-3.5" />, title: "מרכז אופקי" },
                        { type: "right" as AlignType,     icon: <AlignEndHorizontal className="w-3.5 h-3.5" />,   title: "ישר לוגו לימין" },
                        { type: "top" as AlignType,       icon: <AlignStartVertical className="w-3.5 h-3.5" />,   title: "ישר לוגו לחלק עליון" },
                        { type: "center-v" as AlignType,  icon: <AlignCenterVertical className="w-3.5 h-3.5" />,  title: "מרכז אנכי" },
                        { type: "bottom" as AlignType,    icon: <AlignEndVertical className="w-3.5 h-3.5" />,     title: "ישר לוגו לחלק תחתון" },
                      ] as { type: AlignType; icon: React.ReactNode; title: string }[]).map(({ type, icon, title }) => (
                        <button
                          key={type}
                          title={title}
                          onClick={() => alignLogo(type)}
                          className="flex items-center justify-center p-1.5 rounded-lg border border-primary/15 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/8 transition-all"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active slot editor */}
                {activeSlot ? (
                  <div className="p-4 space-y-3">
                    {/* Slot header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center">
                          <Type className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-bold text-foreground">{activeSlot.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => bringForward(activeSlot.id)} className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-colors" title="הבא קדימה">
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => sendBackward(activeSlot.id)} className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-colors" title="שלח אחורה">
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button onClick={() => duplicateSlot(activeSlot.id)} className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-colors" title="שכפל">
                          <Copy className="w-3 h-3" />
                        </button>
                        <button onClick={() => toggleLock(activeSlot.id)} className={`p-1 rounded transition-colors ${lockedSlots.has(activeSlot.id) ? "text-amber-500 bg-amber-500/10" : "hover:bg-primary/10 text-muted-foreground hover:text-primary"}`} title="נעל">
                          {lockedSlots.has(activeSlot.id) ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                        {activeSlot.id.startsWith("user_") && (
                          <button onClick={() => deleteUserSlot(activeSlot.id)} className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors" title="מחק">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Position controls */}
                    <div className="grid grid-cols-3 gap-2">
                      {(["x", "y", "width"] as const).map(field => (
                        <div key={field}>
                          <label className="text-[9px] text-muted-foreground uppercase font-medium">
                            {field === "x" ? "X %" : field === "y" ? "Y %" : "רוחב %"}
                          </label>
                          <input
                            type="number" min={0} max={100}
                            value={Math.round(slotPositions[activeSlot.id]?.[field] ?? (field === "width" ? 80 : 50))}
                            onChange={e => {
                              const v = Math.max(0, Math.min(100, Number(e.target.value)));
                              setSlotPositions(prev => ({ ...prev, [activeSlot.id]: { ...(prev[activeSlot.id] ?? { x: 50, y: 50, width: 80 }), [field]: v } }));
                              setSaved(false);
                            }}
                            className="w-full h-7 text-xs bg-background border border-primary/15 rounded-md px-2 text-center"
                          />
                        </div>
                      ))}
                    </div>

                    {/* ── Canvas alignment toolbar ── */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] text-muted-foreground uppercase font-medium tracking-wide">יישור לקנבס</label>
                        <button
                          title="מרכז בקנבס — אופקי ואנכי"
                          onClick={() => alignActiveSlot("center-both")}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors text-[10px] font-bold"
                        >
                          <Crosshair className="w-3 h-3" />
                          מרכז בקנבס
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {([
                          { type: "left" as AlignType,      icon: <AlignStartHorizontal className="w-3.5 h-3.5" />, title: "ישר לשמאל הקנבס" },
                          { type: "center-h" as AlignType,  icon: <AlignCenterHorizontal className="w-3.5 h-3.5" />, title: "מרכז אופקי" },
                          { type: "right" as AlignType,     icon: <AlignEndHorizontal className="w-3.5 h-3.5" />,   title: "ישר לימין הקנבס" },
                          { type: "top" as AlignType,       icon: <AlignStartVertical className="w-3.5 h-3.5" />,   title: "ישר לחלק העליון" },
                          { type: "center-v" as AlignType,  icon: <AlignCenterVertical className="w-3.5 h-3.5" />,  title: "מרכז אנכי" },
                          { type: "bottom" as AlignType,    icon: <AlignEndVertical className="w-3.5 h-3.5" />,     title: "ישר לחלק התחתון" },
                        ] as { type: AlignType; icon: React.ReactNode; title: string }[]).map(({ type, icon, title }) => (
                          <button
                            key={type}
                            title={title}
                            onClick={() => alignActiveSlot(type)}
                            className="flex items-center justify-center p-1.5 rounded-lg border border-primary/15 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/8 transition-all"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      <div className="h-px bg-primary/10" />
                    </div>

                    {/* Text alignment quick buttons */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-muted-foreground ml-1">כיוון טקסט:</span>
                      {[
                        { v: "right" as const, icon: <AlignRight className="w-3 h-3" />, label: "ימין" },
                        { v: "center" as const, icon: <AlignCenter className="w-3 h-3" />, label: "מרכז" },
                        { v: "left" as const, icon: <AlignLeft className="w-3 h-3" />, label: "שמאל" },
                      ].map(({ v, icon, label }) => (
                        <button key={v} title={label}
                          onClick={() => setUserSlots(prev => prev.map(s => s.id === activeSlot.id ? { ...s, align: v } : s))}
                          className={`p-1.5 rounded border transition-all ${activeSlot.align === v ? "border-primary bg-primary/10 text-primary" : "border-primary/15 text-muted-foreground hover:border-primary/40"}`}>
                          {icon}
                        </button>
                      ))}
                    </div>

                    {/* Text content */}
                    {!activeSlot.fixed ? (
                      <RichTextSlot
                        label=""
                        value={values[activeSlot.id] ?? activeSlot.defaultValue}
                        placeholder={activeSlot.placeholder}
                        multiline={!!activeSlot.multiline}
                        onChange={html => { updateValue(activeSlot.id, html); }}
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Lock className="w-3 h-3 opacity-50 shrink-0" />
                        <span>{activeSlot.defaultValue}</span>
                      </div>
                    )}

                    {/* Style panel */}
                    {!activeSlot.fixed && (
                      <SlotStylePanel
                        slotId={activeSlot.id}
                        style={{
                          fontSize: activeSlot.fontSizePx ?? previewFontSizePx[activeSlot.fontSize || "sm"] ?? 16,
                          ...slotStyles[activeSlot.id],
                        }}
                        onChange={patch => {
                          setSlotStyles(prev => ({ ...prev, [activeSlot.id]: { ...(prev[activeSlot.id] || {}), ...patch } }));
                          setSaved(false);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {/* All slots list */}
                    <p className="text-xs text-muted-foreground">בחרו שדה טקסט לעריכה — לחצו עליו בקנבס או כאן:</p>
                    {allSlots.filter(s => !SYSTEM_SLOT_IDS.has(s.id)).map((slot, i) => {
                      const slotFont = slotStyles[slot.id]?.fontFamily || DEFAULT_FONT;
                      const slotColor = slotStyles[slot.id]?.color;
                      const slotFontSize = slotStyles[slot.id]?.fontSize;
                      return (
                      <div
                        key={slot.id}
                        className="bg-background border border-primary/10 rounded-xl px-3 py-2.5 cursor-pointer hover:border-primary/30 transition-all"
                        onClick={() => setActiveSlotId(slot.id)}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold shrink-0">
                            {slot.fixed ? <Lock className="w-2.5 h-2.5" /> : i + 1}
                          </div>
                          <span className="text-[11px] font-semibold">{slot.label}</span>
                          {/* Font + color indicators */}
                          <div className="flex items-center gap-1 mr-auto shrink-0">
                            {slotColor && (
                              <span className="w-3 h-3 rounded-sm border border-white/20 shrink-0"
                                style={{ background: slotColor }} title={slotColor} />
                            )}
                            <span
                              className="text-[9px] text-muted-foreground truncate max-w-[64px]"
                              style={{ fontFamily: `'${slotFont}', serif` }}
                              title={`גופן: ${slotFont}${slotFontSize ? ` | גודל: ${slotFontSize}` : ""}`}
                            >
                              {slotFont.split(" ").slice(-1)[0]}
                            </span>
                          </div>
                        </div>
                        {!slot.fixed ? (
                          <RichTextSlot
                            label=""
                            value={values[slot.id] ?? slot.defaultValue}
                            placeholder={slot.placeholder}
                            multiline={!!slot.multiline}
                            onChange={html => { updateValue(slot.id, html); }}
                          />
                        ) : (
                          <div className="text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1 flex items-center gap-1.5">
                            <Lock className="w-2.5 h-2.5 opacity-40 shrink-0" />
                            <span className="truncate">{slot.defaultValue}</span>
                          </div>
                        )}
                      </div>
                    );
                    })}
                    <button
                      onClick={addTextBox}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-primary hover:bg-primary/10 rounded-xl transition-colors border border-dashed border-primary/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      הוסף תיבת טקסט חדשה
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Elements tab ── */}
            {rightTab === "elements" && (
              <ElementsPanel
                placedElements={placedElements}
                selectedUid={selectedElementUid}
                onSelect={setSelectedElementUid}
                onAdd={handleAddElement}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
              />
            )}
          </div>

          {/* Bottom action bar */}
          <div className="border-t border-primary/10 bg-card p-3 space-y-2 shrink-0">
            {paySuccess ? (
              <>
                <Button onClick={handleDownload} disabled={downloading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 font-bold shadow-lg">
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {downloading ? "מכין קובץ..." : "הורדת PNG איכות גבוהה"}
                </Button>
                <Button onClick={handleWhatsApp} variant="outline" className="w-full border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 gap-2 h-8 text-xs">
                  <MessageCircle className="w-3.5 h-3.5" />שלחו לסטודיו לגרסת הדפוס
                </Button>
              </>
            ) : (
              <>
                {isSignedIn ? (
                  <Button onClick={handleDownloadClick} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 font-bold shadow-lg">
                    <CreditCard className="w-4 h-4" />המשך לתשלום — ₪49
                  </Button>
                ) : (
                  <Button
                    onClick={() => redirectToSignIn({ redirectUrl: `${basePath}/editor/${tmpl.id}` })}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 font-bold shadow-lg"
                  >
                    <CreditCard className="w-4 h-4" />המשך לתשלום — ₪49
                  </Button>
                )}
                <p className="text-[10px] text-muted-foreground text-center">
                  {isSignedIn ? "תשלום מאובטח דרך Stripe" : "נדרשת כניסה לחשבון לביצוע תשלום"}
                </p>
                <Button onClick={handleWhatsApp} variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10 gap-2 h-8 text-xs">
                  <MessageCircle className="w-3.5 h-3.5" />שלחו לסטודיו דרך ווצאפ
                </Button>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <PaymentWall
          onPay={handlePay}
          onClose={() => setShowPayment(false)}
          loading={payLoading}
          designName={designName}
        />
      )}
    </div>
  );
}

// ─── Font picker panel (for global font) ──────────────────────────────────────
function FontPickerPanel({ selected, onChange }: { selected: string; onChange: (f: string) => void }) {
  const [tab, setTab] = useState<"serif" | "sans" | "local" | "custom">("serif");
  const combinedFonts = useCombinedFonts();
  const hasCustom = combinedFonts.some(f => f.category === "custom");
  const fonts = combinedFonts.filter(f => f.category === tab);
  const handlePick = (font: typeof combinedFonts[0]) => {
    if (font.category === "local") loadLocalFont(font.family);
    else if (font.category !== "custom") loadGoogleFont(font.family);
    onChange(font.family);
  };
  return (
    <div className="px-4 pb-3">
      <div className="flex gap-1 mb-2 flex-wrap">
        {(["serif", "sans", "local", ...(hasCustom ? ["custom" as const] : [])] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
        {fonts.map(font => (
          <button key={font.family} onClick={() => handlePick(font)}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-right transition-colors border ${selected === font.family ? "border-primary/40 bg-primary/10 text-primary" : "border-transparent hover:border-primary/20 hover:bg-primary/5 text-foreground"}`}>
            {font.category === "local" ? <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">BA</span>
              : font.category === "custom" ? <span className="text-[10px] font-bold text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded">✦</span>
              : <span className="text-xs text-muted-foreground">{font.category === "serif" ? "סריף" : "סאנס"}</span>}
            <span className="text-base leading-tight" style={{ fontFamily: `'${font.family}', serif`, direction: "rtl" }}>{font.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
