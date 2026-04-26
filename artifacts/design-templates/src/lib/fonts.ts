import { useState, useEffect } from "react";

export type FontEntry = {
  name: string;
  family: string;
  category: "serif" | "sans" | "local" | "custom";
  file?: string;
};

const LOCAL_BA_FONTS: FontEntry[] = [
  { name: "אילנות הלבנון – כבד",   family: "BA-Arzey-Bold",      category: "local", file: "BAArzeyHalevanon-Bold.ttf"   },
  { name: "אילנות הלבנון – עדין",  family: "BA-Arzey-Light",     category: "local", file: "BAArzeyHalevanon-Light.ttf"  },
  { name: "ברקאי",                  family: "BA-Barkai",          category: "local", file: "BABarkai-Regular.otf"         },
  { name: "קזבלנקה",               family: "BA-Casablanca",      category: "local", file: "BA-Casablanca-Light.otf"      },
  { name: "פונטוב – כבד",          family: "BA-Fontov-Bold",     category: "local", file: "BA-Fontov-Bold.otf"           },
  { name: "פונטוב – רגיל",         family: "BA-Fontov",          category: "local", file: "BA-Fontov-Regular.otf"        },
  { name: "היצירה – עדין",         family: "BA-HaYetzira-Light", category: "local", file: "BA-HaYetzira-Light.otf"       },
  { name: "היצירה – רגיל",         family: "BA-HaYetzira",       category: "local", file: "BA-HaYetzira-Regular.otf"     },
  { name: "קרית קודש",             family: "BA-Kiriat-Kodesh",   category: "local", file: "BA-Kiriat-Kodesh-Bold.otf"    },
  { name: "מים חיים",              family: "BA-Maim-Haim",       category: "local", file: "BA-Maim-Haim-Regular.otf"     },
  { name: "מסובין",                family: "BA-Mesubin",         category: "local", file: "BA-Mesubin-Rolltext.otf"      },
  { name: "מומנט",                 family: "BA-Moment",          category: "local", file: "BA-Moment-Original.otf"       },
  { name: "נפלאות",                family: "BA-Niflaot",         category: "local", file: "BANiflaot-Black.ttf"          },
  { name: "פלטפורמה – שחור",       family: "BA-Platforma-Black", category: "local", file: "BAPlatforma-Black.otf"        },
  { name: "פלטפורמה – כבד",        family: "BA-Platforma-Bold",  category: "local", file: "BAPlatforma-Bold.otf"         },
  { name: "פלטפורמה – עדין",       family: "BA-Platforma-Light", category: "local", file: "BAPlatforma-Light.otf"        },
  { name: "ראדלהיים",              family: "BA-Radlheim",        category: "local", file: "BARadlheim-Bold.otf"          },
  { name: "ראשון לציון",           family: "BA-Rishon",          category: "local", file: "BARishonLezion-Regular.ttf"   },
];

export const HEBREW_FONTS: FontEntry[] = [
  { name: "Frank Ruhl Libre",  family: "Frank Ruhl Libre",  category: "serif" },
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
  ...LOCAL_BA_FONTS,
];

const _loadedFonts = new Set<string>();

export function loadGoogleFont(family: string) {
  if (family === "Karantina") return;
  const localFont = HEBREW_FONTS.find(f => f.family === family && f.file);
  if (localFont?.file) { loadLocalFont(family, localFont.file); return; }
  if (_loadedFonts.has(`gf:${family}`)) return;
  _loadedFonts.add(`gf:${family}`);
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

export function loadLocalFont(family: string, file: string) {
  if (_loadedFonts.has(`lf:${family}`)) return;
  _loadedFonts.add(`lf:${family}`);
  const base = (typeof import.meta !== "undefined" ? import.meta.env.BASE_URL : "/design-templates/") || "/design-templates/";
  const ff = new FontFace(family, `url('${base}fonts/${file}')`);
  ff.load().then(f => document.fonts.add(f)).catch(() => {});
}

export function loadAnyFont(family: string) {
  const entry = HEBREW_FONTS.find(f => f.family === family);
  if (entry?.file) loadLocalFont(entry.family, entry.file);
  else if (family) loadGoogleFont(family);
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
  const apiBase = (typeof import.meta !== "undefined" ? import.meta.env.BASE_URL : "").replace(/\/[^/]*\/?$/, "");
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

export function useCombinedFonts(): FontEntry[] {
  const customFonts = useCustomFonts();

  const custom: FontEntry[] = customFonts.map(f => ({
    name: f.displayName,
    family: f.name,
    category: "custom" as const,
  }));
  return [...custom, ...HEBREW_FONTS];
}
