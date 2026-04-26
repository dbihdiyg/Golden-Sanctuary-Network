export type Preset3DId =
  | "royal-gold"
  | "chrome-silver"
  | "luxury-blackgold"
  | "stone-engrave"
  | "neon-glow"
  | "glossy-logo"
  | "rose-gold"
  | "copper-bronze"
  | "platinum"
  | "black-chrome"
  | "antique-bronze"
  | "neon-pink"
  | "neon-orange"
  | "neon-green"
  | "neon-purple"
  | "electric-blue"
  | "fire-ember"
  | "ice-crystal"
  | "crystal"
  | "pearl-white"
  | "volcanic"
  | "deep-space";

export interface Preset3DConfig {
  id: Preset3DId;
  name: string;
  icon: string;
  defaultDepth: number;
  defaultAngle: number;
  defaultShadowStr: number;
  defaultHighlight: number;
  defaultGlow: number;
  color: string;
  gradientEnabled: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  strokeColor?: string;
  strokeWidth?: number;
  glowColor?: string;
  thumbnailBg?: string;
}

export const PRESETS_3D: Preset3DConfig[] = [
  // ─── Original 6 ────────────────────────────
  {
    id: "royal-gold",
    name: "זהב מלכותי",
    icon: "👑",
    defaultDepth: 6,
    defaultAngle: 45,
    defaultShadowStr: 75,
    defaultHighlight: 80,
    defaultGlow: 25,
    color: "#FCF6BA",
    gradientEnabled: true,
    gradientFrom: "#FCF6BA",
    gradientTo: "#AA771C",
    gradientAngle: 160,
    glowColor: "#D6A84F",
    thumbnailBg: "#0B1833",
  },
  {
    id: "chrome-silver",
    name: "כסף כרום",
    icon: "⚡",
    defaultDepth: 5,
    defaultAngle: 45,
    defaultShadowStr: 80,
    defaultHighlight: 90,
    defaultGlow: 15,
    color: "#f0f4ff",
    gradientEnabled: true,
    gradientFrom: "#ffffff",
    gradientTo: "#8e9eab",
    gradientAngle: 160,
    glowColor: "#b0c4de",
    thumbnailBg: "#1a1a2e",
  },
  {
    id: "luxury-blackgold",
    name: "שחור-זהב",
    icon: "🖤",
    defaultDepth: 8,
    defaultAngle: 45,
    defaultShadowStr: 90,
    defaultHighlight: 75,
    defaultGlow: 12,
    color: "#1a1a1a",
    gradientEnabled: false,
    strokeColor: "#D6A84F",
    strokeWidth: 1,
    glowColor: "#D6A84F",
    thumbnailBg: "#F8F1E3",
  },
  {
    id: "stone-engrave",
    name: "חריטה באבן",
    icon: "🪨",
    defaultDepth: 3,
    defaultAngle: 45,
    defaultShadowStr: 55,
    defaultHighlight: 50,
    defaultGlow: 0,
    color: "#c8b89a",
    gradientEnabled: true,
    gradientFrom: "#d4c4a8",
    gradientTo: "#8c7455",
    gradientAngle: 160,
    thumbnailBg: "#5a4a3a",
  },
  {
    id: "neon-glow",
    name: "נאון זוהר",
    icon: "✨",
    defaultDepth: 2,
    defaultAngle: 45,
    defaultShadowStr: 60,
    defaultHighlight: 50,
    defaultGlow: 85,
    color: "#00ffcc",
    gradientEnabled: false,
    glowColor: "#00ffcc",
    thumbnailBg: "#050510",
  },
  {
    id: "glossy-logo",
    name: "לוגו מבריק",
    icon: "💎",
    defaultDepth: 5,
    defaultAngle: 45,
    defaultShadowStr: 65,
    defaultHighlight: 95,
    defaultGlow: 30,
    color: "#ffffff",
    gradientEnabled: true,
    gradientFrom: "#ffffff",
    gradientTo: "#aaccff",
    gradientAngle: 160,
    glowColor: "#6699ff",
    thumbnailBg: "#0B1833",
  },

  // ─── New Metal Presets ──────────────────────
  {
    id: "rose-gold",
    name: "רוז גולד",
    icon: "🌹",
    defaultDepth: 6,
    defaultAngle: 45,
    defaultShadowStr: 75,
    defaultHighlight: 80,
    defaultGlow: 20,
    color: "#ffc3a0",
    gradientEnabled: true,
    gradientFrom: "#ffc3a0",
    gradientTo: "#b76e79",
    gradientAngle: 150,
    glowColor: "#ff8fa3",
    thumbnailBg: "#1a0a0e",
  },
  {
    id: "copper-bronze",
    name: "ברונזה",
    icon: "🥉",
    defaultDepth: 6,
    defaultAngle: 45,
    defaultShadowStr: 80,
    defaultHighlight: 70,
    defaultGlow: 15,
    color: "#e8a87c",
    gradientEnabled: true,
    gradientFrom: "#e8a87c",
    gradientTo: "#7a4a2a",
    gradientAngle: 155,
    glowColor: "#c07040",
    thumbnailBg: "#120a02",
  },
  {
    id: "platinum",
    name: "פלטינה",
    icon: "🔘",
    defaultDepth: 5,
    defaultAngle: 45,
    defaultShadowStr: 90,
    defaultHighlight: 98,
    defaultGlow: 10,
    color: "#E5E4E2",
    gradientEnabled: true,
    gradientFrom: "#ffffff",
    gradientTo: "#a8a9ad",
    gradientAngle: 160,
    glowColor: "#dde8f0",
    thumbnailBg: "#111",
  },
  {
    id: "black-chrome",
    name: "כרום שחור",
    icon: "🖤",
    defaultDepth: 7,
    defaultAngle: 45,
    defaultShadowStr: 92,
    defaultHighlight: 88,
    defaultGlow: 12,
    color: "#666699",
    gradientEnabled: true,
    gradientFrom: "#888899",
    gradientTo: "#111122",
    gradientAngle: 150,
    glowColor: "#8888cc",
    thumbnailBg: "#0a0a0a",
  },
  {
    id: "antique-bronze",
    name: "עתיקה",
    icon: "🏺",
    defaultDepth: 5,
    defaultAngle: 40,
    defaultShadowStr: 70,
    defaultHighlight: 60,
    defaultGlow: 8,
    color: "#c8a86b",
    gradientEnabled: true,
    gradientFrom: "#d4b883",
    gradientTo: "#6b4c2a",
    gradientAngle: 145,
    glowColor: "#a07840",
    thumbnailBg: "#1a1008",
  },

  // ─── New Neon Presets ───────────────────────
  {
    id: "neon-pink",
    name: "נאון ורוד",
    icon: "💗",
    defaultDepth: 2,
    defaultAngle: 45,
    defaultShadowStr: 60,
    defaultHighlight: 50,
    defaultGlow: 90,
    color: "#ff00aa",
    gradientEnabled: false,
    glowColor: "#ff00aa",
    thumbnailBg: "#080010",
  },
  {
    id: "neon-orange",
    name: "נאון כתום",
    icon: "🔥",
    defaultDepth: 2,
    defaultAngle: 45,
    defaultShadowStr: 60,
    defaultHighlight: 50,
    defaultGlow: 85,
    color: "#ff6600",
    gradientEnabled: false,
    glowColor: "#ff6600",
    thumbnailBg: "#100400",
  },
  {
    id: "neon-green",
    name: "נאון ירוק",
    icon: "💚",
    defaultDepth: 2,
    defaultAngle: 45,
    defaultShadowStr: 60,
    defaultHighlight: 50,
    defaultGlow: 88,
    color: "#00ff44",
    gradientEnabled: false,
    glowColor: "#00ff44",
    thumbnailBg: "#001008",
  },
  {
    id: "neon-purple",
    name: "נאון סגול",
    icon: "💜",
    defaultDepth: 2,
    defaultAngle: 45,
    defaultShadowStr: 60,
    defaultHighlight: 50,
    defaultGlow: 90,
    color: "#cc00ff",
    gradientEnabled: false,
    glowColor: "#cc00ff",
    thumbnailBg: "#060010",
  },
  {
    id: "electric-blue",
    name: "כחול חשמלי",
    icon: "⚡",
    defaultDepth: 2,
    defaultAngle: 45,
    defaultShadowStr: 60,
    defaultHighlight: 50,
    defaultGlow: 85,
    color: "#0088ff",
    gradientEnabled: false,
    glowColor: "#0088ff",
    thumbnailBg: "#000a18",
  },

  // ─── New Material Presets ───────────────────
  {
    id: "fire-ember",
    name: "אש וגחלים",
    icon: "🔥",
    defaultDepth: 4,
    defaultAngle: 45,
    defaultShadowStr: 80,
    defaultHighlight: 60,
    defaultGlow: 60,
    color: "#ff8800",
    gradientEnabled: true,
    gradientFrom: "#ffaa00",
    gradientTo: "#cc0000",
    gradientAngle: 170,
    glowColor: "#ff4400",
    thumbnailBg: "#050000",
  },
  {
    id: "ice-crystal",
    name: "קרח",
    icon: "❄️",
    defaultDepth: 4,
    defaultAngle: 45,
    defaultShadowStr: 60,
    defaultHighlight: 95,
    defaultGlow: 30,
    color: "#c0e8ff",
    gradientEnabled: true,
    gradientFrom: "#e8f8ff",
    gradientTo: "#4080cc",
    gradientAngle: 145,
    glowColor: "#60b4ff",
    thumbnailBg: "#000a18",
  },
  {
    id: "volcanic",
    name: "וולקני",
    icon: "🌋",
    defaultDepth: 5,
    defaultAngle: 45,
    defaultShadowStr: 85,
    defaultHighlight: 40,
    defaultGlow: 40,
    color: "#cc4422",
    gradientEnabled: true,
    gradientFrom: "#ee5533",
    gradientTo: "#550000",
    gradientAngle: 170,
    glowColor: "#aa2200",
    thumbnailBg: "#060000",
  },

  // ─── Luxury Presets ─────────────────────────
  {
    id: "crystal",
    name: "קריסטל",
    icon: "💎",
    defaultDepth: 4,
    defaultAngle: 45,
    defaultShadowStr: 40,
    defaultHighlight: 98,
    defaultGlow: 35,
    color: "#d0f0ff",
    gradientEnabled: true,
    gradientFrom: "#f0fbff",
    gradientTo: "#80c8f0",
    gradientAngle: 140,
    glowColor: "#80d4ff",
    thumbnailBg: "#0a1a2a",
  },
  {
    id: "pearl-white",
    name: "פנינה",
    icon: "🤍",
    defaultDepth: 3,
    defaultAngle: 45,
    defaultShadowStr: 50,
    defaultHighlight: 98,
    defaultGlow: 20,
    color: "#f8f8ff",
    gradientEnabled: true,
    gradientFrom: "#ffffff",
    gradientTo: "#d8d8e8",
    gradientAngle: 140,
    glowColor: "#c0c8ff",
    thumbnailBg: "#1a1a2e",
  },
  {
    id: "deep-space",
    name: "חלל עמוק",
    icon: "🌌",
    defaultDepth: 3,
    defaultAngle: 45,
    defaultShadowStr: 60,
    defaultHighlight: 60,
    defaultGlow: 50,
    color: "#c0c0ff",
    gradientEnabled: true,
    gradientFrom: "#e0e0ff",
    gradientTo: "#4040aa",
    gradientAngle: 160,
    glowColor: "#8080ff",
    thumbnailBg: "#000005",
  },
];

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length === 3) return [
    parseInt(h[0] + h[0], 16),
    parseInt(h[1] + h[1], 16),
    parseInt(h[2] + h[2], 16),
  ];
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ];
}

// ── Neon helper ────────────────────────────────────────────────────────
function buildNeonShadows(
  sx: number, sy: number,
  depth: number, sha: number,
  ga: number,
  glowColor: string,
  pp: (x: number, y: number, blur: number, col: string) => string,
): string[] {
  const parts: string[] = [];
  const minDepth = Math.min(depth, 3);
  for (let i = 1; i <= minDepth; i++) {
    parts.push(pp(sx * i, sy * i, 0, `rgba(0,0,0,0.88)`));
  }
  const [r, g, b] = glowColor.startsWith("#") ? hexToRgb(glowColor) : [0, 255, 204];
  const gA = Math.max(0.3, ga);
  parts.push(`0 0 3px rgba(255,255,255,${(gA * 0.72).toFixed(2)})`);
  parts.push(`0 0 ${depth + 7}px rgba(${r},${g},${b},${gA.toFixed(2)})`);
  parts.push(`0 0 ${depth * 2 + 14}px rgba(${r},${g},${b},${(gA * 0.6).toFixed(2)})`);
  parts.push(`0 0 ${depth * 3 + 22}px rgba(${r},${g},${b},${(gA * 0.35).toFixed(2)})`);
  parts.push(`0 0 ${depth * 5 + 38}px rgba(${r},${g},${b},${(gA * 0.18).toFixed(2)})`);
  return parts;
}

// ── Metal helper ───────────────────────────────────────────────────────
function buildMetalShadows(
  sx: number, sy: number,
  hx: number, hy: number,
  depth: number, sha: number, hla: number, ga: number,
  r1: number, g1: number, b1: number,  // shadow start color
  r2: number, g2: number, b2: number,  // highlight color
  glowColor: string,
  pp: (x: number, y: number, blur: number, col: string) => string,
): string[] {
  const parts: string[] = [];
  if (hla > 0) {
    parts.push(pp(hx * 0.6, hy * 0.6, 0, `rgba(${r2},${g2},${b2},${hla.toFixed(2)})`));
    parts.push(pp(hx * 1.5, hy * 1.5, 1, `rgba(${r2},${g2},${b2},${(hla * 0.5).toFixed(2)})`));
  }
  for (let i = 1; i <= depth; i++) {
    const t = i / depth;
    const rv = Math.max(0, Math.round(r1 * (1 - t * 0.85)));
    const gv = Math.max(0, Math.round(g1 * (1 - t * 0.85)));
    const bv = Math.max(0, Math.round(b1 * (1 - t * 0.85)));
    parts.push(pp(sx * i, sy * i, 0, `rgb(${rv},${gv},${bv})`));
  }
  const cd = depth + 1.5;
  parts.push(pp(sx * cd, sy * cd, Math.ceil(depth * 0.9), `rgba(0,0,0,${sha.toFixed(2)})`));
  parts.push(pp(sx * (cd + 2), sy * (cd + 2), depth * 2.5, `rgba(0,0,0,${(sha * 0.38).toFixed(2)})`));
  if (ga > 0) {
    const [r, g, b] = glowColor.startsWith("#") ? hexToRgb(glowColor) : [214, 168, 79];
    parts.push(`0 0 ${depth * 2 + 6}px rgba(${r},${g},${b},${ga.toFixed(2)})`);
    parts.push(`0 0 ${depth * 4 + 12}px rgba(${r},${g},${b},${(ga * 0.42).toFixed(2)})`);
  }
  return parts;
}

export function build3DShadows(
  preset: string,
  lightAngle: number,
  depth: number,
  shadowStr: number,
  highlight: number,
  glowStr: number,
  glowColor = "#D6A84F",
): string[] {
  const rad = lightAngle * Math.PI / 180;
  const sx = Math.cos(rad);
  const sy = Math.sin(rad);
  const hx = -sx;
  const hy = -sy;

  const sha = Math.min(0.95, (shadowStr / 100) * 0.9);
  const hla = (highlight / 100) * 0.92;
  const ga = glowStr / 100;

  const pp = (x: number, y: number, blur: number, color: string) =>
    `${x.toFixed(1)}px ${y.toFixed(1)}px ${blur}px ${color}`;

  const parts: string[] = [];

  switch (preset) {
    case "royal-gold": {
      if (hla > 0) {
        parts.push(pp(hx * 0.6, hy * 0.6, 0, `rgba(255,248,160,${hla.toFixed(2)})`));
        parts.push(pp(hx * 1.5, hy * 1.5, 1, `rgba(255,215,70,${(hla * 0.52).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const r = Math.max(0, Math.round(115 - t * 88));
        const g = Math.max(0, Math.round(68 - t * 58));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${r},${g},0)`));
      }
      const cd = depth + 1.5;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth * 0.9), `rgba(0,0,0,${sha.toFixed(2)})`));
      parts.push(pp(sx * (cd + 2), sy * (cd + 2), depth * 2.5, `rgba(0,0,0,${(sha * 0.38).toFixed(2)})`));
      if (ga > 0) {
        const [r, g, b] = glowColor.startsWith("#") ? hexToRgb(glowColor) : [214, 168, 79];
        parts.push(`0 0 ${depth * 2 + 6}px rgba(${r},${g},${b},${ga.toFixed(2)})`);
        parts.push(`0 0 ${depth * 4 + 12}px rgba(${r},${g},${b},${(ga * 0.42).toFixed(2)})`);
      }
      break;
    }

    case "chrome-silver": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(255,255,255,${Math.min(1, hla * 1.1).toFixed(2)})`));
        parts.push(pp(hx * 1.3, hy * 1.3, 1, `rgba(210,228,255,${(hla * 0.48).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const v = Math.max(0, Math.round(90 - t * 80));
        const vb = Math.min(255, Math.round(v * 1.08));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${v},${v},${vb})`));
      }
      const cd = depth + 1.5;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,0,0,${sha.toFixed(2)})`));
      parts.push(pp(sx * (cd + 2), sy * (cd + 2), depth * 2.5, `rgba(0,0,0,${(sha * 0.32).toFixed(2)})`));
      if (ga > 0) {
        parts.push(`0 0 ${depth * 2 + 4}px rgba(180,205,255,${ga.toFixed(2)})`);
        parts.push(`0 0 ${depth * 4 + 8}px rgba(150,180,255,${(ga * 0.45).toFixed(2)})`);
      }
      break;
    }

    case "luxury-blackgold": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(255,220,100,${hla.toFixed(2)})`));
        parts.push(pp(hx * 1.2, hy * 1.2, 1, `rgba(214,168,79,${(hla * 0.52).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const r = Math.max(0, Math.round(214 - t * 205));
        const g = Math.max(0, Math.round(168 - t * 162));
        const b = Math.max(0, Math.round(79 - t * 76));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${r},${g},${b})`));
      }
      const cd = depth + 2;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,0,0,${Math.min(0.97, sha * 1.15).toFixed(2)})`));
      parts.push(pp(sx * (cd + 3), sy * (cd + 3), depth * 2.5, `rgba(0,0,0,${(sha * 0.52).toFixed(2)})`));
      if (ga > 0) {
        const [r, g, b] = glowColor.startsWith("#") ? hexToRgb(glowColor) : [214, 168, 79];
        parts.push(`0 0 ${depth * 3}px rgba(${r},${g},${b},${(ga * 0.62).toFixed(2)})`);
      }
      break;
    }

    case "stone-engrave": {
      const d = Math.max(1, depth * 0.7);
      if (hla > 0) {
        parts.push(pp(sx * 0.7, sy * 0.7, 1, `rgba(0,0,0,${(hla * 0.72).toFixed(2)})`));
        parts.push(pp(sx * 1.5, sy * 1.5, 2, `rgba(0,0,0,${(hla * 0.35).toFixed(2)})`));
      }
      parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(235,215,180,${(highlight / 100 * 0.55).toFixed(2)})`));
      parts.push(pp(sx * (d + 0.5), sy * (d + 0.5), d * 1.5, `rgba(0,0,0,${(sha * 0.5).toFixed(2)})`));
      break;
    }

    case "neon-glow":
    case "neon-pink":
    case "neon-orange":
    case "neon-green":
    case "neon-purple":
    case "electric-blue":
      return buildNeonShadows(sx, sy, depth, sha, ga, glowColor, pp);

    case "glossy-logo": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(255,255,255,${Math.min(1, hla * 1.2).toFixed(2)})`));
        parts.push(pp(hx * 1.1, hy * 1.1, 1, `rgba(255,255,255,${(hla * 0.82).toFixed(2)})`));
        parts.push(pp(hx * 2.0, hy * 2.0, 3, `rgba(255,255,255,${(hla * 0.4).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const a = Math.max(0.08, 0.72 - t * 0.55);
        parts.push(pp(sx * i, sy * i, 0, `rgba(0,0,0,${a.toFixed(2)})`));
      }
      const cd = depth + 2;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth * 0.85), `rgba(0,0,0,${Math.min(0.92, sha * 1.05).toFixed(2)})`));
      parts.push(pp(sx * (cd + 2), sy * (cd + 2), depth * 3, `rgba(0,0,0,${(sha * 0.32).toFixed(2)})`));
      if (ga > 0) {
        const [r, g, b] = glowColor.startsWith("#") ? hexToRgb(glowColor) : [100, 153, 255];
        parts.push(`0 0 ${depth * 2}px rgba(${r},${g},${b},${(ga * 0.42).toFixed(2)})`);
      }
      break;
    }

    // ── New Metal Presets ─────────────────────────
    case "rose-gold":
      return buildMetalShadows(sx, sy, hx, hy, depth, sha, hla, ga, 183, 110, 125, 255, 195, 160, glowColor || "#ff8fa3", pp);

    case "copper-bronze":
      return buildMetalShadows(sx, sy, hx, hy, depth, sha, hla, ga, 184, 115, 50, 255, 200, 140, glowColor || "#c07040", pp);

    case "platinum": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(255,255,255,${Math.min(1, hla * 1.2).toFixed(2)})`));
        parts.push(pp(hx * 1.5, hy * 1.5, 1, `rgba(240,245,255,${(hla * 0.5).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const v = Math.max(0, Math.round(160 - t * 155));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${v},${v},${Math.min(255, v + 8)})`));
      }
      const cd = depth + 1.5;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,0,0,${sha.toFixed(2)})`));
      if (ga > 0) parts.push(`0 0 ${depth * 2 + 4}px rgba(200,220,255,${ga.toFixed(2)})`);
      break;
    }

    case "black-chrome": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(120,120,200,${hla.toFixed(2)})`));
        parts.push(pp(hx * 1.3, hy * 1.3, 1, `rgba(80,80,160,${(hla * 0.5).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const v = Math.max(0, Math.round(40 - t * 38));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${v},${v},${Math.min(60, v + 15)})`));
      }
      const cd = depth + 2;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,0,0,${sha.toFixed(2)})`));
      if (ga > 0) parts.push(`0 0 ${depth * 2 + 4}px rgba(80,80,180,${ga.toFixed(2)})`);
      break;
    }

    case "antique-bronze":
      return buildMetalShadows(sx, sy, hx, hy, depth, sha, hla, ga, 160, 120, 50, 220, 185, 120, glowColor || "#a07840", pp);

    // ── Fire & Ice ────────────────────────────
    case "fire-ember": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(255,220,80,${hla.toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const r = Math.max(0, Math.round(200 - t * 195));
        const g = Math.max(0, Math.round(80 - t * 78));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${r},${g},0)`));
      }
      const cd = depth + 1.5;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,0,0,${sha.toFixed(2)})`));
      if (ga > 0) {
        parts.push(`0 0 ${depth * 2 + 6}px rgba(255,80,0,${ga.toFixed(2)})`);
        parts.push(`0 0 ${depth * 4 + 12}px rgba(255,40,0,${(ga * 0.5).toFixed(2)})`);
      }
      break;
    }

    case "ice-crystal": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(220,240,255,${Math.min(1, hla * 1.1).toFixed(2)})`));
        parts.push(pp(hx * 1.3, hy * 1.3, 1, `rgba(180,220,255,${(hla * 0.5).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const v = Math.max(0, Math.round(80 - t * 78));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${v},${Math.min(255, v + 40)},${Math.min(255, v + 80)})`));
      }
      const cd = depth + 1.5;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,20,60,${sha.toFixed(2)})`));
      if (ga > 0) {
        parts.push(`0 0 ${depth * 2 + 6}px rgba(100,180,255,${ga.toFixed(2)})`);
        parts.push(`0 0 ${depth * 4 + 12}px rgba(60,140,255,${(ga * 0.5).toFixed(2)})`);
      }
      break;
    }

    case "volcanic": {
      if (hla > 0) parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(255,100,50,${hla.toFixed(2)})`));
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const r = Math.max(0, Math.round(150 - t * 148));
        const g = Math.max(0, Math.round(20 - t * 19));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${r},${g},0)`));
      }
      const cd = depth + 1.5;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,0,0,${sha.toFixed(2)})`));
      if (ga > 0) parts.push(`0 0 ${depth * 3}px rgba(200,40,0,${ga.toFixed(2)})`);
      break;
    }

    // ── Luxury ────────────────────────────────
    case "crystal": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(255,255,255,${Math.min(1, hla * 1.3).toFixed(2)})`));
        parts.push(pp(hx * 1.2, hy * 1.2, 2, `rgba(200,235,255,${(hla * 0.6).toFixed(2)})`));
        parts.push(pp(hx * 2.0, hy * 2.0, 4, `rgba(180,220,255,${(hla * 0.3).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const a = Math.max(0.05, 0.5 - t * 0.4);
        parts.push(pp(sx * i, sy * i, 0, `rgba(120,180,255,${a.toFixed(2)})`));
      }
      if (ga > 0) {
        parts.push(`0 0 ${depth * 2}px rgba(150,210,255,${ga.toFixed(2)})`);
        parts.push(`0 0 ${depth * 4}px rgba(100,170,255,${(ga * 0.5).toFixed(2)})`);
      }
      break;
    }

    case "pearl-white": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(255,255,255,${Math.min(1, hla * 1.2).toFixed(2)})`));
        parts.push(pp(hx * 1.5, hy * 1.5, 2, `rgba(220,230,255,${(hla * 0.45).toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const v = Math.max(0, Math.round(140 - t * 135));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${v},${v},${Math.min(255, v + 15)})`));
      }
      const cd = depth + 2;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,0,0,${(sha * 0.5).toFixed(2)})`));
      if (ga > 0) parts.push(`0 0 ${depth * 2 + 4}px rgba(180,190,255,${ga.toFixed(2)})`);
      break;
    }

    case "deep-space": {
      if (hla > 0) {
        parts.push(pp(hx * 0.5, hy * 0.5, 0, `rgba(160,160,255,${hla.toFixed(2)})`));
      }
      for (let i = 1; i <= depth; i++) {
        const t = i / depth;
        const v = Math.max(0, Math.round(60 - t * 58));
        parts.push(pp(sx * i, sy * i, 0, `rgb(${v * 0.5 | 0},${v * 0.5 | 0},${v})`));
      }
      const cd = depth + 1.5;
      parts.push(pp(sx * cd, sy * cd, Math.ceil(depth), `rgba(0,0,0,${sha.toFixed(2)})`));
      if (ga > 0) {
        parts.push(`0 0 ${depth * 2 + 6}px rgba(80,80,255,${ga.toFixed(2)})`);
        parts.push(`0 0 ${depth * 4 + 12}px rgba(60,60,200,${(ga * 0.4).toFixed(2)})`);
      }
      break;
    }
  }

  return parts;
}
