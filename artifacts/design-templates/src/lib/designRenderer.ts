/**
 * Shared design rendering engine — single source of truth.
 *
 * Both the admin template editor and the user editor import from here so
 * that what the admin designs is EXACTLY what the user sees.
 *
 * The engine works with a single unified "StyleData" object that covers all
 * visual properties.  AdminSlot objects satisfy StyleData directly; user
 * editors build a StyleData from their SlotStyle + TextSlot combination.
 */

import type { CSSProperties } from "react";
import { build3DShadows, PRESETS_3D } from "./3d-presets";

// ─── Unified style data ────────────────────────────────────────────────────────
/** All visual properties used by the renderer.  Optional = use default. */
export interface StyleData {
  // Typography
  fontFamily?: string;
  fontSize?: number;        // px
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: number;   // px
  lineHeight?: number;      // multiplier
  color?: string;

  // Shadow / glow
  shadow?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;

  glow?: boolean;
  glowColor?: string;
  glowRadius?: number;
  glowIntensity?: number;

  // Effects
  extrudeEnabled?: boolean;
  extrudeDepth?: number;
  extrudeColor?: string;
  extrudeAngle?: number;

  longShadowEnabled?: boolean;
  longShadowLength?: number;
  longShadowColor?: string;
  longShadowAngle?: number;

  strokeWidth?: number;
  strokeColor?: string;
  outline?: boolean;

  gradientEnabled?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;

  textureType?: "none" | "gold-foil" | "silver" | "fire" | "neon" | "rainbow";

  // Transform / wrapper
  opacity?: number;
  rotation?: number;
  skewX?: number;
  skewY?: number;
  blendMode?: string;

  // Glass effect
  glassEnabled?: boolean;
  glassBlur?: number;
  glassColor?: string;
  glassBorderRadius?: number;
  glassPadding?: number;

  // Warp
  warpType?: string;
  warpAmount?: number;
  arcDegrees?: number;

  // 3D preset
  preset3D?: string;
  depth3D?: number;
  lightAngle3D?: number;
  shadowStr3D?: number;
  highlight3D?: number;
  glow3D?: number;

  // Three.js 3D
  mode3D?: boolean;
  material3D?: string;
  depth3DEngine?: number;
  bevel3D?: number;
  cameraAngleX?: number;
  cameraAngleY?: number;
  autoRotate3D?: boolean;

  zIndex?: number;
}

// ─── Text-shadow builder ───────────────────────────────────────────────────────
export function buildTextShadows(s: StyleData | undefined, baseColor: string): string {
  if (!s) return "";
  const parts: string[] = [];

  // ── Premium 3D preset (takes priority over classic extrude) ──────────────
  if (s.preset3D && s.preset3D !== "none") {
    const preset = PRESETS_3D.find(p => p.id === s.preset3D);
    const glowCol = s.glowColor || preset?.glowColor || baseColor;
    const shadows = build3DShadows(
      s.preset3D,
      s.lightAngle3D ?? preset?.defaultAngle ?? 45,
      s.depth3D      ?? preset?.defaultDepth     ?? 6,
      s.shadowStr3D  ?? preset?.defaultShadowStr ?? 70,
      s.highlight3D  ?? preset?.defaultHighlight ?? 60,
      s.glow3D       ?? preset?.defaultGlow      ?? 0,
      glowCol,
    );
    parts.push(...shadows);
  }

  // ── Basic drop shadow ─────────────────────────────────────────────────────
  if (s.shadow || s.shadowX != null || s.shadowY != null || s.shadowColor) {
    const x    = s.shadowX    ?? 2;
    const y    = s.shadowY    ?? 2;
    const blur = s.shadowBlur ?? 6;
    const col  = s.shadowColor || "rgba(0,0,0,0.7)";
    parts.push(`${x}px ${y}px ${blur}px ${col}`);
  }

  // ── Classic glow ──────────────────────────────────────────────────────────
  if (s.glow || s.glowColor || s.glowRadius) {
    const gc        = s.glowColor    || baseColor;
    const gr        = s.glowRadius   ?? 12;
    const intensity = s.glowIntensity ?? 2;
    for (let i = 0; i < intensity; i++) parts.push(`0 0 ${gr * (i + 1)}px ${gc}`);
    // Inner sharp glow — works with 6-char hex by appending an alpha byte
    if (gc.startsWith("#") && gc.length === 7) {
      parts.push(`0 0 ${Math.ceil(gr * 0.4)}px ${gc}cc`);
    }
  }

  // ── Classic extrude (disabled when preset3D is active) ───────────────────
  if (s.extrudeEnabled && !s.preset3D) {
    const depth = s.extrudeDepth ?? 5;
    const angle = (s.extrudeAngle ?? 225) * Math.PI / 180;
    const col   = s.extrudeColor || "rgba(0,0,0,0.6)";
    for (let i = 1; i <= depth; i++) {
      parts.push(`${(Math.cos(angle) * i).toFixed(1)}px ${(Math.sin(angle) * i).toFixed(1)}px 0 ${col}`);
    }
  }

  // ── Long shadow ───────────────────────────────────────────────────────────
  if (s.longShadowEnabled && !s.preset3D) {
    const len   = s.longShadowLength ?? 40;
    const angle = (s.longShadowAngle ?? 135) * Math.PI / 180;
    const col   = s.longShadowColor || "rgba(0,0,0,0.15)";
    for (let i = 1; i <= len; i++) {
      parts.push(`${(Math.cos(angle) * i).toFixed(1)}px ${(Math.sin(angle) * i).toFixed(1)}px 0 ${col}`);
    }
  }

  return parts.join(", ");
}

// ─── Texture / gradient selector ──────────────────────────────────────────────
export function buildTextureGradient(type?: string): string | undefined {
  switch (type) {
    case "gold-foil": return "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)";
    case "silver":    return "linear-gradient(135deg, #8e9eab 0%, #eef2f3 30%, #9da9b0 60%, #eef2f3 80%, #8e9eab 100%)";
    case "fire":      return "linear-gradient(0deg, #ff4500 0%, #ff8c00 30%, #ffd700 60%, #fff44f 100%)";
    case "neon":      return "linear-gradient(135deg, #a855f7 0%, #ec4899 35%, #3b82f6 70%, #a855f7 100%)";
    case "rainbow":   return "linear-gradient(90deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff)";
    default:          return undefined;
  }
}

// ─── Text CSS builder ──────────────────────────────────────────────────────────
/** Returns CSS properties for the text content element. */
export function buildTextCSS(s: StyleData, baseColor: string): CSSProperties {
  const fontFamily = s.fontFamily && s.fontFamily !== "serif" && s.fontFamily !== "sans"
    ? `'${s.fontFamily}', serif`
    : s.fontFamily === "sans" ? "sans-serif" : "serif";

  const textShadow  = buildTextShadows(s, baseColor);
  const texGrad     = s.textureType && s.textureType !== "none" ? buildTextureGradient(s.textureType) : undefined;
  const useGradient = !!s.gradientEnabled || !!texGrad;
  const gradientBg  = texGrad ?? (s.gradientEnabled
    ? `linear-gradient(${s.gradientAngle ?? 90}deg, ${s.gradientFrom || "#D6A84F"}, ${s.gradientTo || "#F8F1E3"})`
    : undefined);

  const strokeW = s.strokeWidth ?? 0;
  const stroke  = strokeW > 0
    ? `${strokeW}px ${s.strokeColor || baseColor}`
    : s.outline ? `1px ${baseColor}` : undefined;

  const base: CSSProperties = {
    fontSize:         s.fontSize ?? 18,
    fontFamily,
    fontWeight:       s.bold   ? 700       : 400,
    fontStyle:        s.italic ? "italic"  : "normal",
    textDecoration:   s.underline ? "underline" : undefined,
    letterSpacing:    s.letterSpacing != null ? `${s.letterSpacing}px` : undefined,
    lineHeight:       s.lineHeight ?? 1.35,
    WebkitTextStroke: stroke,
    textShadow:       textShadow || undefined,
  };

  if (useGradient && gradientBg) {
    return {
      ...base,
      backgroundImage:      gradientBg,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor:  "transparent",
      backgroundClip:       "text",
      color:                "transparent",
    };
  }
  return { ...base, color: baseColor };
}

// ─── Wrapper CSS builder ───────────────────────────────────────────────────────
/**
 * Returns CSS properties for the slot wrapper element.
 * Does NOT include `translateX(-50%)` — callers must prepend it to `transform`.
 */
export function buildWrapperCSS(s: StyleData | undefined, slotOpacity?: number): CSSProperties {
  if (!s && slotOpacity == null) return {};

  const style: CSSProperties = {};

  const transforms: string[] = [];
  if (s?.rotation) transforms.push(`rotate(${s.rotation}deg)`);
  if (s?.skewX)    transforms.push(`skewX(${s.skewX}deg)`);
  if (s?.skewY)    transforms.push(`skewY(${s.skewY}deg)`);
  if (transforms.length) style.transform = transforms.join(" ");

  const op = s?.opacity ?? slotOpacity;
  if (op != null && op !== 1) style.opacity = op;

  if (s?.blendMode && s.blendMode !== "normal") {
    style.mixBlendMode = s.blendMode as CSSProperties["mixBlendMode"];
  }

  if (s?.glassEnabled) {
    const pad = s.glassPadding ?? 8;
    style.background       = s.glassColor || "rgba(255,255,255,0.08)";
    style.backdropFilter   = `blur(${s.glassBlur ?? 8}px)`;
    (style as any).WebkitBackdropFilter = `blur(${s.glassBlur ?? 8}px)`;
    style.borderRadius     = `${s.glassBorderRadius ?? 8}px`;
    style.padding          = `${pad}px ${pad * 2}px`;
  }

  return style;
}

// ─── Admin wrapper CSS (includes translateX(-50%) for direct-spread use) ───────
/**
 * Builds wrapper CSS that can be spread directly onto an absolutely-positioned
 * admin-canvas slot div.  translateX(-50%) is always prepended so the slot's
 * x% coordinate represents the horizontal CENTRE, not the left edge.
 */
export function buildAdminWrapperCSS(s: StyleData | undefined, slotOpacity?: number): CSSProperties {
  const base = buildWrapperCSS(s, slotOpacity);
  const extraTransforms = base.transform ? ` ${base.transform}` : "";
  return { ...base, transform: `translateX(-50%)${extraTransforms}` };
}
