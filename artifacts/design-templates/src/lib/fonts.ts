export const HEBREW_FONTS: { name: string; family: string; category: "serif" | "sans" | "local" }[] = [
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
