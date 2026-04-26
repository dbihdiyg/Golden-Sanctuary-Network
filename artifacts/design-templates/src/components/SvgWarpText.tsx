/**
 * Real SVG textPath warp engine — used by both admin and user editors.
 * All warp types use SVG <textPath> for genuine glyph-level curving,
 * which works correctly with Hebrew RTL without clipping or flipping.
 */
import { useId } from "react";

export type WarpType = "none" | "arc-up" | "arc-down" | "wave" | "circle" | "bulge" | "arch";

export const WARP_OPTIONS: { value: WarpType; label: string; icon: string }[] = [
  { value: "none",     label: "ישר",         icon: "—" },
  { value: "arc-up",   label: "קשת למעלה",   icon: "⌒" },
  { value: "arc-down", label: "קשת למטה",    icon: "⌣" },
  { value: "arch",     label: "כיפה",         icon: "∩" },
  { value: "bulge",    label: "בליטה",        icon: "◠" },
  { value: "wave",     label: "גל",           icon: "∿" },
  { value: "circle",   label: "עיגול",        icon: "○" },
];

export interface WarpConfig {
  warpType: WarpType;
  warpAmount: number;    // 1–100, intensity
}

/** Build a gradient id and defs for gradient/texture fill */
function buildFillDef(uid: string, cssStyle: React.CSSProperties): { fill: string; defEl: React.ReactNode } {
  const isGrad = !!cssStyle.backgroundImage;
  const gradFrom = isGrad
    ? (cssStyle.backgroundImage as string).match(/#[0-9a-fA-F]{3,6}/g)?.[0] || "#D6A84F"
    : undefined;
  const gradTo = isGrad
    ? (cssStyle.backgroundImage as string).match(/#[0-9a-fA-F]{3,6}/g)?.[1] || "#F8F1E3"
    : undefined;

  const fill = isGrad
    ? `url(#wg-${uid})`
    : ((cssStyle.color && cssStyle.color !== "transparent") ? cssStyle.color as string : "#F8F1E3");

  const defEl = isGrad && gradFrom && gradTo ? (
    <linearGradient id={`wg-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor={gradFrom} />
      <stop offset="100%" stopColor={gradTo} />
    </linearGradient>
  ) : null;

  return { fill, defEl };
}

/** Core: compute SVG path + viewBox for each warp type */
function buildWarpGeometry(
  type: WarpType,
  amount: number,
  W: number,
  fontSize: number,
): {
  d: string;
  viewX: number; viewY: number; viewW: number; viewH: number;
  svgW: number; svgH: number;
} {
  // pct = 0..1 (normalised amount)
  const pct = Math.min(100, Math.max(0, amount)) / 100;

  // How far above/below the baseline we need room
  const capRoom   = fontSize * 0.95;   // uppercase letter height above baseline
  const descRoom  = fontSize * 0.35;   // descender depth below baseline
  const padX      = 4;

  // Default baseline y (we keep cap room above it)
  const baseY = capRoom + 2;

  // Helper: flat line
  const flat = () => ({
    d: `M 0,${baseY} H ${W}`,
    viewX: -padX, viewY: 0, viewW: W + padX * 2, viewH: baseY + descRoom + 2,
    svgW: W, svgH: baseY + descRoom + 2,
  });

  switch (type) {

    case "arc-up": {
      // Path curves UP in the middle; sides are lower than centre.
      // SVG arc: M 0,sideY  A r r 0 0,0  W,sideY
      //   sweep=0 → counter-clockwise → midpoint is ABOVE (lower y) the chord.
      const sagitta = pct * W * 0.42;
      if (sagitta < 1) return flat();
      const sideY  = baseY + sagitta;           // where sides sit
      // radius from chord (W) and sagitta
      const r = (W * W / 4 + sagitta * sagitta) / (2 * sagitta);
      const svgH   = sideY + descRoom + 2;
      // The top of the arc is at sideY - sagitta = baseY (exactly where cap room starts)
      return {
        d: `M 0,${sideY} A ${r},${r} 0 0,0 ${W},${sideY}`,
        viewX: -padX, viewY: 0, viewW: W + padX * 2, viewH: svgH,
        svgW: W, svgH,
      };
    }

    case "arc-down": {
      // Path curves DOWN in the middle; sides are higher than centre.
      // sweep=1 → clockwise → midpoint BELOW chord.
      const sagitta = pct * W * 0.42;
      if (sagitta < 1) return flat();
      const r = (W * W / 4 + sagitta * sagitta) / (2 * sagitta);
      // sides at baseY, centre dips down to baseY + sagitta
      const svgH = baseY + sagitta + descRoom + 2;
      return {
        d: `M 0,${baseY} A ${r},${r} 0 0,1 ${W},${baseY}`,
        viewX: -padX, viewY: 0, viewW: W + padX * 2, viewH: svgH,
        svgW: W, svgH,
      };
    }

    case "arch": {
      // Steep parabolic arch: sides start low, peak rises sharply at centre.
      // Cubic bezier: corners at bottom, control points near top-centre.
      const rise   = pct * W * 0.52;
      const peakY  = baseY;
      const sideY  = baseY + rise;
      const svgH   = sideY + descRoom + 2;
      // Tight control points near centre x, pulled high
      const d = `M 0,${sideY} C ${W * 0.22},${peakY} ${W * 0.78},${peakY} ${W},${sideY}`;
      return {
        d,
        viewX: -padX, viewY: 0, viewW: W + padX * 2, viewH: svgH,
        svgW: W, svgH,
      };
    }

    case "bulge": {
      // Convex "belly" — inverse of arch: centre dips DOWN, sides stay up.
      const dip    = pct * W * 0.42;
      const dipY   = baseY + dip;  // centre of path
      const sideY  = baseY;
      const svgH   = dipY + descRoom + 2;
      const d = `M 0,${sideY} C ${W * 0.25},${dipY} ${W * 0.75},${dipY} ${W},${sideY}`;
      return {
        d,
        viewX: -padX, viewY: 0, viewW: W + padX * 2, viewH: svgH,
        svgW: W, svgH,
      };
    }

    case "wave": {
      // Sinusoidal path — amplitude scales with pct
      const amp   = pct * fontSize * 1.8;
      const midY  = baseY + amp;
      const pts: string[] = [];
      const steps = 80;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W;
        const y = midY + amp * Math.sin((i / steps) * Math.PI * 2);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      const svgH = midY + amp + descRoom + 2;
      return {
        d: `M ${pts.join(" L ")}`,
        viewX: -padX, viewY: 0, viewW: W + padX * 2, viewH: svgH,
        svgW: W, svgH,
      };
    }

    case "circle": {
      // Text follows a full circle (clockwise from top)
      const r     = W * (0.35 + (1 - pct) * 0.2);  // smaller r = more circular
      const dim   = r * 2 + fontSize + 4;
      const cx    = dim / 2;
      const cy    = dim / 2;
      // Full circle path (must be two arcs to avoid degenerate path)
      const d = `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r}`;
      return {
        d,
        viewX: 0, viewY: 0, viewW: dim, viewH: dim,
        svgW: dim, svgH: dim,
      };
    }

    default:
      return flat();
  }
}

interface SvgWarpTextProps {
  text: string;
  warpType: WarpType;
  /** Intensity 1–100. Default 40. */
  warpAmount?: number;
  cssStyle: React.CSSProperties;
  /** Internal path width in "virtual px" (default 340). */
  pathWidth?: number;
}

export function SvgWarpText({ text, warpType, warpAmount = 40, cssStyle, pathWidth = 340 }: SvgWarpTextProps) {
  const uid = useId().replace(/:/g, "");
  const pathId = `wp-${uid}`;

  const fontSize = typeof cssStyle.fontSize === "number" ? cssStyle.fontSize : 16;
  const W = pathWidth;

  const geo = buildWarpGeometry(warpType, warpAmount, W, fontSize);
  const { fill, defEl } = buildFillDef(uid, cssStyle);

  // Stroke from WebkitTextStroke
  const strokeStr = typeof cssStyle.WebkitTextStroke === "string" ? cssStyle.WebkitTextStroke : "";
  const strokeWidthVal = strokeStr ? parseFloat(strokeStr) || 0 : 0;
  const strokeColorVal = strokeStr ? strokeStr.replace(/^[\d.]+px\s*/, "").trim() : "none";

  // textShadow → SVG filter drop-shadow (simplified)
  const hasShadow = typeof cssStyle.textShadow === "string" && cssStyle.textShadow.length > 0;
  const shadowParts = hasShadow ? (cssStyle.textShadow as string).split(",")[0].trim().split(/\s+/) : [];
  const shadowDx   = shadowParts[0] ? parseFloat(shadowParts[0]) : 2;
  const shadowDy   = shadowParts[1] ? parseFloat(shadowParts[1]) : 2;
  const shadowBlur = shadowParts[2] ? parseFloat(shadowParts[2]) : 6;
  const shadowCol  = shadowParts[3] || "rgba(0,0,0,0.7)";

  const filterId = `wsf-${uid}`;

  const { viewX, viewY, viewW, viewH, svgW, svgH } = geo;

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
      style={{ display: "block", overflow: "visible", maxWidth: "100%", direction: "rtl" }}
    >
      <defs>
        <path id={pathId} d={geo.d} />
        {defEl}
        {hasShadow && (
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx={shadowDx} dy={shadowDy} stdDeviation={shadowBlur / 2} floodColor={shadowCol} />
          </filter>
        )}
      </defs>

      <text
        fill={fill}
        fontSize={fontSize}
        fontFamily={cssStyle.fontFamily as string}
        fontWeight={cssStyle.fontWeight as number}
        fontStyle={cssStyle.fontStyle as string}
        letterSpacing={typeof cssStyle.letterSpacing === "string" ? parseFloat(cssStyle.letterSpacing) : undefined}
        textDecoration={cssStyle.textDecoration as string}
        stroke={strokeWidthVal > 0 ? strokeColorVal : "none"}
        strokeWidth={strokeWidthVal > 0 ? strokeWidthVal : undefined}
        paintOrder="stroke"
        filter={hasShadow ? `url(#${filterId})` : undefined}
        direction="rtl"
      >
        <textPath
          href={`#${pathId}`}
          startOffset="50%"
          textAnchor="middle"
        >
          {text}
        </textPath>
      </text>
    </svg>
  );
}
