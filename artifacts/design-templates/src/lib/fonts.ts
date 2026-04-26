import { useState, useEffect } from "react";

export const HEBREW_FONTS: { name: string; family: string; category: "serif" | "sans" | "local" | "custom" }[] = [
  { name: "Frank Ruhl Libre", family: "Frank Ruhl Libre",  category: "serif" },
  { name: "Noto Serif Hebrew", family: "Noto Serif Hebrew", category: "serif" },
  { name: "David Libre",       family: "David Libre",       category: "serif" },
  { name: "Miriam Libre",      family: "Miriam Libre",      category: "serif" },
  { name: "Suez One",          family: "Suez One",          category: "serif" },
  { name: "Tinos",             family: "Tinos",             category: "serif" },
  { name: "Heebo",             family: "Heebo",             category: "sans"  },
  { name: "Rubik",             family: "Rubik",             category: "sans"  },
  { name: "Assistant",         family: "Assistant",         category: "sans"  },
  { name: "Secular One",       family: "Secular One",       category: "sans"  },
  { name: "Varela Round",      family: "Varela Round",      category: "sans"  },
  { name: "Alef",              family: "Alef",              category: "sans"  },
  { name: "Noto Sans Hebrew",  family: "Noto Sans Hebrew",  category: "sans"  },
  { name: "Cousine",           family: "Cousine",           category: "sans"  },
  { name: "Karantina",         family: "Karantina",         category: "local" },
];

export function loadGoogleFont(family: string) {
  if (family === "Karantina") return;
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

export interface CustomFont {
  id: number;
  name: string;
  displayName: string;
  fileUrl: string;
  mimeType: string;
  isActive: boolean;
}

export function injectCustomFont(font: CustomFont) {
  const id = `cf-${font.name.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  const apiBase = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");
  const url = font.fileUrl.startsWith("/api") ? apiBase + font.fileUrl : font.fileUrl;
  style.textContent = `@font-face { font-family: '${font.name}'; src: url('${url}') format('${font.mimeType.replace("font/", "")}'); font-display: swap; }`;
  document.head.appendChild(style);
}

const API_BASE = typeof window !== "undefined"
  ? (import.meta.env.BASE_URL || "").replace(/\/[^/]*\/?$/, "")
  : "";

export function useCustomFonts() {
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/hadar/public-fonts`)
      .then(r => r.json())
      .then((data: CustomFont[]) => {
        if (!Array.isArray(data)) return;
        setCustomFonts(data);
        data.forEach(f => injectCustomFont(f));
      })
      .catch(() => {});
  }, []);

  return customFonts;
}

export type FontEntry = { name: string; family: string; category: "serif" | "sans" | "local" | "custom" };

export function useCombinedFonts(): FontEntry[] {
  const customFonts = useCustomFonts();
  const custom: FontEntry[] = customFonts.map(f => ({
    name: f.displayName,
    family: f.name,
    category: "custom" as const,
  }));
  return [...custom, ...HEBREW_FONTS];
}
