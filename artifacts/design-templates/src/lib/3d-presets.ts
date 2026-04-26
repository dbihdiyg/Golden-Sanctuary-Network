export type Preset3DId =
  | "royal-gold"
  | "chrome-silver"
  | "luxury-blackgold"
  | "stone-engrave"
  | "neon-glow"
  | "glossy-logo";

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

    case "neon-glow": {
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
      break;
    }

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
  }

  return parts;
}
