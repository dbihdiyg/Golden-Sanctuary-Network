/**
 * Canvas-based text warp engine — shared by admin and user editors.
 *
 * WHY CANVAS INSTEAD OF SVG textPath
 * ------------------------------------
 * SVG <textPath> always rotates each individual glyph to follow the path
 * tangent. This is the SVG spec — there is no way to turn it off.
 * For Hebrew (and all RTL scripts) this breaks the rendering: each character
 * is twisted at a different angle, which distorts ligatures and spacing.
 *
 * This engine instead:
 *   1. Renders the complete text string horizontally using the browser's
 *      native text engine (ctx.fillText with direction:"rtl") — so Hebrew
 *      shaping, letter-spacing and baseline are handled perfectly.
 *   2. Applies a per-column vertical pixel displacement (inverse warp map)
 *      to produce the curved result.
 *
 * The output is a <canvas> element that is fully compatible with html2canvas
 * for the final high-res PNG download.
 */

import { useRef, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type WarpType =
  | "none"
  | "arc-up"
  | "arc-down"
  | "wave"
  | "circle"
  | "bulge"
  | "arch";

export const WARP_OPTIONS: { value: WarpType; label: string; icon: string }[] = [
  { value: "none",     label: "ישר",       icon: "—" },
  { value: "arc-up",   label: "קשת למעלה", icon: "⌒" },
  { value: "arc-down", label: "קשת למטה",  icon: "⌣" },
  { value: "arch",     label: "כיפה",      icon: "∩" },
  { value: "bulge",    label: "בליטה",     icon: "◠" },
  { value: "wave",     label: "גל",        icon: "∿" },
  { value: "circle",   label: "עיגול",     icon: "○" },
];

export interface SvgWarpTextProps {
  text: string;
  warpType: WarpType;
  /** Intensity 1–100. Default 40. */
  warpAmount?: number;
  cssStyle: React.CSSProperties;
  /** Logical width in CSS pixels for the rendered canvas. Default 320. */
  pathWidth?: number;
}

// ── Pixel warp helper ────────────────────────────────────────────────────────

/**
 * Returns the UPWARD pixel displacement at position nx ∈ [0,1].
 *   positive  → that column's pixels move UP   (arc-up at centre)
 *   negative  → pixels move DOWN               (arc-down at centre)
 *
 * The inverse-warp rule is:
 *   srcY = dstY + displacement(nx)
 * (look further down in the source to find what ends up higher in the dest)
 */
function displacement(type: WarpType, nx: number, amp: number): number {
  switch (type) {
    case "arc-up":
      // Parabola: 0 at edges, max at centre
      return amp * 4 * nx * (1 - nx);

    case "arc-down":
      // Inverse parabola
      return -amp * 4 * nx * (1 - nx);

    case "arch":
      // Sine arch — reaches max faster at centre than arc-up
      return amp * 1.25 * Math.sin(Math.PI * nx);

    case "bulge":
      // Inverse sine — dips down at centre
      return -amp * 1.25 * Math.sin(Math.PI * nx);

    case "wave":
      // One full sine cycle: up → down → up
      return amp * 0.75 * Math.sin(2 * Math.PI * nx);

    case "circle":
      // Cosine dome: flat at edges (cos ≈ -1), peak at centre (cos 0 = 1)
      // Mapped so edges sit at 0 and centre sits at amp
      {
        const angle = (nx - 0.5) * Math.PI * 1.6; // ±0.8π at edges
        const edgeVal = Math.cos(0.8 * Math.PI);  // ≈ -0.81
        const raw = Math.cos(angle);              // 1 at centre, edgeVal at edges
        return amp * (raw - edgeVal) / (1 - edgeVal);
      }

    default:
      return 0;
  }
}

// ── Main component ───────────────────────────────────────────────────────────

/** Hi-DPI render scale */
const SCALE = 2;

export function SvgWarpText({
  text,
  warpType,
  warpAmount = 40,
  cssStyle,
  pathWidth = 320,
}: SvgWarpTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute layout dimensions so the canvas element has the right CSS size
  // even before the effect runs (avoids layout shift).
  const fontSize  = typeof cssStyle.fontSize === "number" ? cssStyle.fontSize : 16;
  const pct       = Math.min(100, Math.max(1, warpAmount)) / 100;
  const amp       = pct * fontSize * 2.4;          // pixel amplitude in source units
  const cssW      = pathWidth;
  const cssH      = Math.ceil(fontSize * 1.65 + amp * 2.5 + 8);
  const baselineY = Math.ceil(fontSize * 1.1 + amp + 4); // text baseline in source

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = cssW;
    const H = cssH;

    // Physical pixel dimensions
    canvas.width  = W * SCALE;
    canvas.height = H * SCALE;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, W * SCALE, H * SCALE);

    // ── 1. Render text horizontally on a source canvas ──────────────────────

    const src = document.createElement("canvas");
    src.width  = W * SCALE;
    src.height = H * SCALE;
    const sc = src.getContext("2d")!;
    sc.clearRect(0, 0, W * SCALE, H * SCALE);

    // Build font string
    const fw       = cssStyle.fontWeight || 400;
    const fi       = cssStyle.fontStyle === "italic" ? "italic " : "";
    const ff       = cssStyle.fontFamily as string || "serif";
    sc.font         = `${fi}${fw} ${fontSize * SCALE}px ${ff}`;
    sc.textAlign    = "center";
    sc.textBaseline = "alphabetic";
    sc.direction    = "rtl"; // correct Hebrew visual order in horizontal pass

    // Fill (solid colour or gradient)
    if (cssStyle.backgroundImage) {
      const hexes  = (cssStyle.backgroundImage as string)
        .match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [];
      const from   = hexes[0] || "#D6A84F";
      const to     = hexes[1] || "#F8F1E3";
      const grad   = sc.createLinearGradient(0, 0, W * SCALE, 0);
      grad.addColorStop(0, from);
      grad.addColorStop(1, to);
      sc.fillStyle = grad;
    } else {
      sc.fillStyle = (cssStyle.color as string) || "#F8F1E3";
    }

    // Draw text (and optional stroke)
    const cx = (W / 2) * SCALE;
    const by = baselineY * SCALE;

    const strokeRaw = typeof cssStyle.WebkitTextStroke === "string"
      ? cssStyle.WebkitTextStroke : "";
    const strokeW = strokeRaw ? parseFloat(strokeRaw) || 0 : 0;

    if (strokeW > 0) {
      sc.strokeStyle   = strokeRaw.replace(/^[\d.]+px\s*/, "").trim() || "#000";
      sc.lineWidth     = strokeW * SCALE * 2;
      sc.lineJoin      = "round";
      sc.strokeText(text, cx, by);
    }
    sc.fillText(text, cx, by);

    // ── 2. Read source pixels ────────────────────────────────────────────────

    const IW  = W * SCALE;
    const IH  = H * SCALE;
    const srcImgData = sc.getImageData(0, 0, IW, IH);
    const srcPx      = srcImgData.data;

    // ── 3. Apply inverse warp map ────────────────────────────────────────────

    const dstImgData = ctx.createImageData(IW, IH);
    const dstPx      = dstImgData.data;

    // Pre-compute per-column offsets (in physical px)
    const offsets = new Float32Array(IW);
    const ampPx   = amp * SCALE; // amplitude in physical pixels
    for (let x = 0; x < IW; x++) {
      offsets[x] = displacement(warpType, x / (IW - 1), ampPx);
    }

    for (let dx = 0; dx < IW; dx++) {
      const ofs = offsets[dx];
      for (let dy = 0; dy < IH; dy++) {
        // Inverse map: pixel that arrives at (dx, dy) came from (dx, srcY)
        const srcY = Math.round(dy + ofs);
        if (srcY >= 0 && srcY < IH) {
          const di = (dy * IW + dx) * 4;
          const si = (srcY * IW + dx) * 4;
          dstPx[di]     = srcPx[si];
          dstPx[di + 1] = srcPx[si + 1];
          dstPx[di + 2] = srcPx[si + 2];
          dstPx[di + 3] = srcPx[si + 3];
        }
      }
    }

    ctx.putImageData(dstImgData, 0, 0);

  // Re-render whenever any visual parameter changes
  }, [
    text, warpType, warpAmount,
    cssStyle.fontSize, cssStyle.fontFamily, cssStyle.fontWeight,
    cssStyle.fontStyle, cssStyle.color, cssStyle.backgroundImage,
    cssStyle.WebkitTextStroke, cssStyle.letterSpacing,
    pathWidth,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={cssW * SCALE}
      height={cssH * SCALE}
      style={{
        display: "block",
        width: cssW,
        height: cssH,
        maxWidth: "100%",
        imageRendering: "auto",
      }}
      aria-label={text}
    />
  );
}
