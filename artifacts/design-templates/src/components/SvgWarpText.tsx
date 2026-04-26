/**
 * SVG textPath warp engine — shared by admin and user editors.
 *
 * HEBREW RTL STRATEGY
 * -------------------
 * SVG textPath places characters in Unicode logical order along the path.
 * For Hebrew ("שלום" stored ש→מ), characters are placed first-char first.
 * To produce the correct visual order (ש on the right, מ on the left) we draw
 * ALL paths from RIGHT (x=W) → LEFT (x=0).  That way ש lands rightmost and מ
 * leftmost, exactly matching natural Hebrew RTL reading.
 *
 * We do NOT set direction="rtl" on <text> — that attribute causes each glyph
 * to be individually rotated/positioned in browser-specific ways, which breaks
 * Hebrew rendering.  The RTL path direction is all we need.
 */
import { useId } from "react";

export type WarpType = "none" | "arc-up" | "arc-down" | "wave" | "circle" | "bulge" | "arch";

export const WARP_OPTIONS: { value: WarpType; label: string; icon: string }[] = [
  { value: "none",     label: "ישר",       icon: "—" },
  { value: "arc-up",   label: "קשת למעלה", icon: "⌒" },
  { value: "arc-down", label: "קשת למטה",  icon: "⌣" },
  { value: "arch",     label: "כיפה",      icon: "∩" },
  { value: "bulge",    label: "בליטה",     icon: "◠" },
  { value: "wave",     label: "גל",        icon: "∿" },
  { value: "circle",   label: "עיגול",     icon: "○" },
];

// ─── Geometry ──────────────────────────────────────────────────────────────────

interface Geo {
  d: string;
  vX: number; vY: number; vW: number; vH: number; // viewBox values
  svgW: number; svgH: number;
}

/**
 * Build the SVG path for each warp type.
 *
 * CRITICAL: every path MUST go from x=W (right) → x=0 (left) so Hebrew
 * characters land in the correct visual positions.
 *
 * @param W   internal coordinate width (path units)
 * @param sz  font size in those same units
 * @param pct warp intensity 0..1
 */
function buildPath(type: WarpType, W: number, sz: number, pct: number): Geo {
  // Vertical room
  const capAbove = sz * 0.95;   // caps above baseline
  const descBelow = sz * 0.35;  // descenders below baseline
  const px = 6;                 // horizontal padding

  // baseline sits at capAbove so there is always room for the tallest letters
  const BY = capAbove + 2;

  const flat = (): Geo => ({
    d: `M ${W},${BY} H 0`,
    vX: -px, vY: 0, vW: W + px * 2, vH: BY + descBelow + 4,
    svgW: W, svgH: BY + descBelow + 4,
  });

  // helper: radius from half-chord and sagitta
  const arcR = (halfChord: number, sag: number) =>
    (halfChord * halfChord + sag * sag) / (2 * sag);

  switch (type) {

    // ── arc-up ─────────────────────────────────────────────────────────────
    // Path RIGHT→LEFT, arc goes UP in the middle.
    // For RTL path (W→0) we need clockwise (sweep=1) to get the midpoint ABOVE.
    case "arc-up": {
      const sag = pct * W * 0.40;
      if (sag < 1) return flat();
      const sideY = BY + sag;            // endpoints are BELOW centre
      const r = arcR(W / 2, sag);
      return {
        d: `M ${W},${sideY} A ${r},${r} 0 0,1 0,${sideY}`,
        vX: -px, vY: 0, vW: W + px * 2, vH: sideY + descBelow + 4,
        svgW: W, svgH: sideY + descBelow + 4,
      };
    }

    // ── arc-down ───────────────────────────────────────────────────────────
    // Path RIGHT→LEFT, arc goes DOWN in the middle.
    // For RTL path (W→0) counterclockwise (sweep=0) pushes the midpoint DOWN.
    case "arc-down": {
      const sag = pct * W * 0.40;
      if (sag < 1) return flat();
      const r = arcR(W / 2, sag);
      const botY = BY + sag;
      return {
        d: `M ${W},${BY} A ${r},${r} 0 0,0 0,${BY}`,
        vX: -px, vY: 0, vW: W + px * 2, vH: botY + descBelow + 4,
        svgW: W, svgH: botY + descBelow + 4,
      };
    }

    // ── arch ───────────────────────────────────────────────────────────────
    // Steep cubic-bezier arch: corners low, peak at centre (like a doorway).
    // Path RIGHT→LEFT — mirror the control-point x values.
    case "arch": {
      const rise = pct * W * 0.48;
      const sideY = BY + rise;
      const peakY = BY;
      const svgH = sideY + descBelow + 4;
      // LTR equivalent: M 0,sideY C W*0.22,peakY W*0.78,peakY W,sideY
      // Mirrored (RTL):  M W,sideY C W*0.78,peakY W*0.22,peakY 0,sideY
      return {
        d: `M ${W},${sideY} C ${W * 0.78},${peakY} ${W * 0.22},${peakY} 0,${sideY}`,
        vX: -px, vY: 0, vW: W + px * 2, vH: svgH,
        svgW: W, svgH,
      };
    }

    // ── bulge ──────────────────────────────────────────────────────────────
    // Inverse of arch: sides high, centre dips DOWN.
    // Path RIGHT→LEFT — mirror control-point x values.
    case "bulge": {
      const dip = pct * W * 0.38;
      const dipY = BY + dip;
      const svgH = dipY + descBelow + 4;
      // LTR: M 0,BY C W*0.25,dipY W*0.75,dipY W,BY
      // RTL: M W,BY C W*0.75,dipY W*0.25,dipY 0,BY
      return {
        d: `M ${W},${BY} C ${W * 0.75},${dipY} ${W * 0.25},${dipY} 0,${BY}`,
        vX: -px, vY: 0, vW: W + px * 2, vH: svgH,
        svgW: W, svgH,
      };
    }

    // ── wave ───────────────────────────────────────────────────────────────
    // Sinusoidal path — reversed x so it still goes RIGHT→LEFT.
    case "wave": {
      const amp = pct * sz * 1.6;
      const midY = BY + amp;
      const STEPS = 120;
      const pts: string[] = [];
      for (let i = 0; i <= STEPS; i++) {
        // x counts from W down to 0 so path direction is RTL
        const x = W * (1 - i / STEPS);
        const y = midY + amp * Math.sin((i / STEPS) * Math.PI * 2);
        pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
      const svgH = midY + amp + descBelow + 4;
      return {
        d: `M ${pts.join(" L ")}`,
        vX: -px, vY: 0, vW: W + px * 2, vH: svgH,
        svgW: W, svgH,
      };
    }

    // ── circle ─────────────────────────────────────────────────────────────
    // Full-circle path, clockwise so text reads around the top RTL.
    // We start at the top-right of the circle so Hebrew letters flow from
    // the 12-o'clock position going clockwise (left along the top arc).
    case "circle": {
      const r = W * (0.38 + (1 - pct) * 0.18);
      const dim = r * 2 + sz + 8;
      const cx = dim / 2;
      const cy = dim / 2;
      // Clockwise full circle: start at top (cx, cy-r), go clockwise.
      // Two arcs needed to avoid degenerate (zero-length) path.
      const d =
        `M ${cx},${cy - r}` +
        ` A ${r},${r} 0 0,1 ${cx + 0.01},${cy - r}`;
      // For RTL: clockwise = text goes right from top, then down-right.
      // We want text to go left from top, so use counter-clockwise (sweep=0).
      const dRTL =
        `M ${cx},${cy - r}` +
        ` A ${r},${r} 0 1,0 ${cx + 0.01},${cy - r}`;
      return {
        d: dRTL,
        vX: 0, vY: 0, vW: dim, vH: dim,
        svgW: dim, svgH: dim,
      };
    }

    default:
      return flat();
  }
}

// ─── Fill helper ───────────────────────────────────────────────────────────────

function buildFill(uid: string, css: React.CSSProperties): { fill: string; def: React.ReactNode } {
  if (!css.backgroundImage) {
    const color = (css.color && css.color !== "transparent") ? css.color as string : "#F8F1E3";
    return { fill: color, def: null };
  }
  const matches = (css.backgroundImage as string).match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) || [];
  const from = matches[0] || "#D6A84F";
  const to   = matches[1] || "#F8F1E3";
  return {
    fill: `url(#wg-${uid})`,
    def: (
      <linearGradient id={`wg-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    ),
  };
}

// ─── Public component ──────────────────────────────────────────────────────────

export interface SvgWarpTextProps {
  text: string;
  warpType: WarpType;
  warpAmount?: number;   // 1–100, default 40
  cssStyle: React.CSSProperties;
  pathWidth?: number;    // internal coordinate width, default 320
}

export function SvgWarpText({
  text,
  warpType,
  warpAmount = 40,
  cssStyle,
  pathWidth = 320,
}: SvgWarpTextProps) {
  const uid = useId().replace(/:/g, "");
  const pathId = `wp-${uid}`;

  const sz   = typeof cssStyle.fontSize === "number" ? cssStyle.fontSize : 16;
  const W    = pathWidth;
  const pct  = Math.min(100, Math.max(1, warpAmount)) / 100;
  const geo  = buildPath(warpType, W, sz, pct);

  const { fill, def } = buildFill(uid, cssStyle);

  // Stroke
  const strokeRaw   = typeof cssStyle.WebkitTextStroke === "string" ? cssStyle.WebkitTextStroke : "";
  const strokeW     = strokeRaw ? parseFloat(strokeRaw) || 0 : 0;
  const strokeColor = strokeRaw ? strokeRaw.replace(/^[\d.]+px\s*/, "").trim() : "none";

  // Drop-shadow filter
  const shadowRaw = typeof cssStyle.textShadow === "string" ? cssStyle.textShadow : "";
  const hasShadow = shadowRaw.length > 0;
  const sp        = hasShadow ? shadowRaw.split(",")[0].trim().split(/\s+/) : [];
  const sdx       = sp[0] ? parseFloat(sp[0]) : 2;
  const sdy       = sp[1] ? parseFloat(sp[1]) : 2;
  const sblur     = sp[2] ? parseFloat(sp[2]) : 6;
  const scol      = sp[3] || "rgba(0,0,0,0.7)";

  const filterId = `wsf-${uid}`;

  return (
    <svg
      width={geo.svgW}
      height={geo.svgH}
      viewBox={`${geo.vX} ${geo.vY} ${geo.vW} ${geo.vH}`}
      style={{ display: "block", overflow: "visible", maxWidth: "100%" }}
      aria-label={text}
    >
      <defs>
        {/* The warp path — drawn RIGHT→LEFT for correct Hebrew visual order */}
        <path id={pathId} d={geo.d} />
        {def}
        {hasShadow && (
          <filter id={filterId} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow
              dx={sdx} dy={sdy}
              stdDeviation={sblur / 2}
              floodColor={scol}
            />
          </filter>
        )}
      </defs>

      {/*
        NO direction="rtl" here.
        The RTL visual order comes purely from the path going W→0.
        Adding direction="rtl" causes browsers to individually rotate each
        Hebrew glyph, which is exactly the broken behaviour we're fixing.
      */}
      <text
        fill={fill}
        fontSize={sz}
        fontFamily={cssStyle.fontFamily as string}
        fontWeight={cssStyle.fontWeight as number}
        fontStyle={cssStyle.fontStyle as string}
        letterSpacing={
          typeof cssStyle.letterSpacing === "string"
            ? parseFloat(cssStyle.letterSpacing)
            : undefined
        }
        textDecoration={cssStyle.textDecoration as string}
        stroke={strokeW > 0 ? strokeColor : "none"}
        strokeWidth={strokeW > 0 ? strokeW : undefined}
        paintOrder="stroke"
        filter={hasShadow ? `url(#${filterId})` : undefined}
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
