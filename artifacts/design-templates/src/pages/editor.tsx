import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, Link, useLocation, useSearch } from "wouter";
import { useAuth, useUser, SignInButton } from "@clerk/react";
import hadarLogo from "@/assets/logo-hadar.png";
import { ArrowRight, Crown, MessageCircle, Download, RotateCcw, CheckCircle2, ZoomIn, ZoomOut, Sun, Moon, Lock, Loader2, User, CreditCard, LogIn, Type, ChevronDown, ChevronUp, ImagePlus, X as XIcon, Upload, Layers, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { templates, TextSlot } from "@/lib/data";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { ElementsPanel, PlacedElement, colorToFilter } from "@/components/ElementsPanel";
import { RichTextSlot } from "@/components/RichTextSlot";

// ─── Hebrew fonts — Google Fonts (free / OFL) ────────────────────────────────
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
];

// ─── Local BA Hebrew fonts (uploaded by user) ─────────────────────────────────
const LOCAL_BA_FONTS: {
  name: string;
  family: string;
  files: { weight: number; src: string }[];
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

// merge local fonts into the shared list
LOCAL_BA_FONTS.forEach(f =>
  HEBREW_FONTS.push({ name: f.name, family: f.family, category: "local" })
);

const DEFAULT_FONT = "Frank Ruhl Libre";

function loadGoogleFont(family: string) {
  const id = `gfont-${family.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

function loadLocalFont(family: string) {
  const id = `lfont-${family.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const meta = LOCAL_BA_FONTS.find(f => f.family === family);
  if (!meta) return;
  const base = import.meta.env.BASE_URL; // e.g. "/design-templates/"
  const fmt = (src: string) => src.endsWith(".ttf") ? "truetype" : "opentype";
  const css = meta.files.map(f => `
    @font-face {
      font-family: '${meta.family}';
      src: url('${base}fonts/${f.src}') format('${fmt(f.src)}');
      font-weight: ${f.weight};
      font-style: normal;
      font-display: swap;
    }
  `).join("\n");
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

const TAB_LABELS: Record<"serif" | "sans" | "local", string> = {
  serif: "סריף",
  sans:  "סאנס",
  local: "עברית",
};

function FontSelector({ selected, onChange }: { selected: string; onChange: (f: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"serif" | "sans" | "local">("serif");

  const fonts = HEBREW_FONTS.filter(f => f.category === tab);

  function handlePick(font: (typeof HEBREW_FONTS)[0]) {
    if (font.category === "local") loadLocalFont(font.family);
    else loadGoogleFont(font.family);
    onChange(font.family);
  }

  return (
    <div className="border-b border-primary/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">פונט</span>
          <span className="text-xs text-muted-foreground" style={{ fontFamily: `'${selected}', serif` }}>
            {selected}
          </span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-3 bg-card/30">
          {/* Category tabs */}
          <div className="flex gap-1 mb-2.5">
            {(["serif", "sans", "local"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
          {/* Font list */}
          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
            {fonts.map(font => (
              <button
                key={font.family}
                onClick={() => handlePick(font)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-right transition-colors border ${
                  selected === font.family
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-transparent hover:border-primary/20 hover:bg-primary/5 text-foreground"
                }`}
              >
                {font.category === "local"
                  ? <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">BA</span>
                  : <span className="text-xs text-muted-foreground">{font.category === "serif" ? "סריף" : "סאנס"}</span>
                }
                <span className="text-base leading-tight" style={{ fontFamily: `'${font.family}', serif`, direction: "rtl" }}>
                  {font.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const previewFontSizePx: Record<string, number> = {
  xs: 9, sm: 11, md: 13, lg: 16, xl: 20, "2xl": 26,
};

function resolveColor(color?: string): string {
  if (color === "gold") return "#D6A84F";
  if (color === "dark") return "#0B1833";
  if (color === "cream") return "#F8F1E3";
  return "#F8F1E3";
}

function resolveFont(slotFamily: string | undefined, fontOverride: string): string {
  return `'${fontOverride}', ${slotFamily === "serif" ? "serif" : "sans-serif"}`;
}

function StackedLine({ slot, value, fontOverride }: { slot: TextSlot; value: string; fontOverride: string }) {
  if (!value.trim()) return null;
  const sz = previewFontSizePx[slot.fontSize || "sm"];
  return (
    <div className="text-center leading-snug my-0.5 whitespace-pre-line" style={{
      fontSize: sz,
      fontFamily: resolveFont(slot.fontFamily, fontOverride),
      fontWeight: slot.bold ? 700 : 400,
      fontStyle: slot.italic ? "italic" : "normal",
      color: resolveColor(slot.color),
      lineHeight: slot.lineHeight ?? 1.35,
    }}>
      {value}
    </div>
  );
}

function AbsoluteSlot({ slot, value, fontOverride }: { slot: TextSlot; value: string; fontOverride: string }) {
  if (!value.trim() || slot.x == null || slot.y == null) return null;
  const sz = previewFontSizePx[slot.fontSize || "sm"];
  const w = slot.width ?? 80;
  return (
    <div style={{
      position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, width: `${w}%`,
      transform: "translateX(-50%)", fontSize: sz,
      fontFamily: resolveFont(slot.fontFamily, fontOverride),
      fontWeight: slot.bold ? 700 : 400, fontStyle: slot.italic ? "italic" : "normal",
      color: resolveColor(slot.color), textAlign: slot.align ?? "center",
      lineHeight: slot.lineHeight ?? 1.35, whiteSpace: "pre-line", direction: "rtl", pointerEvents: "none",
    }}>
      {value}
    </div>
  );
}

function LogoUploader({ logoUrl, onChange }: { logoUrl: string | null; onChange: (url: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="border-b border-primary/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ImagePlus className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">לוגו</span>
          {logoUrl
            ? <span className="text-xs text-green-500 font-medium">הועלה ✓</span>
            : <span className="text-xs text-muted-foreground">אין לוגו</span>
          }
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 bg-card/30">
          {logoUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full rounded-xl border border-primary/20 bg-background/60 p-3 flex items-center justify-center overflow-hidden" style={{ minHeight: 80 }}>
                <img src={logoUrl} alt="לוגו" className="max-h-16 max-w-full object-contain" />
                <button
                  onClick={() => onChange(null)}
                  className="absolute top-2 left-2 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                  title="הסר לוגו"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
              >
                החלף לוגו
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault(); setDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              className={`w-full rounded-xl border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                dragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <Upload className="w-6 h-6 text-primary/60" />
              <p className="text-xs font-medium text-foreground text-center">גרירה או לחיצה להעלאה</p>
              <p className="text-[10px] text-muted-foreground text-center">PNG, JPG, SVG · עד 5MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <p className="text-[10px] text-muted-foreground mt-2 text-center">הלוגו יופיע בראש ההזמנה</p>
        </div>
      )}
    </div>
  );
}

function InvitationPreview({ template, values, zoom, fontOverride, logoUrl, placedElements, selectedElementUid, onSelectElement }: {
  template: typeof templates[0]; values: Record<string, string>; zoom: number; fontOverride: string; logoUrl: string | null;
  placedElements?: PlacedElement[]; selectedElementUid?: string | null; onSelectElement?: (uid: string | null) => void;
}) {
  const slots = (template.slots || []).filter(s => s.id !== "__elements");
  const hasCoords = slots.some(s => s.x != null && s.y != null);
  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-2xl border border-primary/20" style={{
      aspectRatio: "3/4", transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease",
    }}>
      {template.isGradient ? (
        <div className="absolute inset-0" style={{ background: template.image }} />
      ) : (
        <img src={template.image} alt={template.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {template.isGradient && (
        <>
          <div className="absolute inset-3 border border-[#D6A84F]/40 rounded-lg pointer-events-none" />
          <div className="absolute inset-5 border border-[#D6A84F]/20 rounded-lg pointer-events-none" />
          {(["top-3 right-3", "top-3 left-3", "bottom-3 right-3", "bottom-3 left-3"] as const).map((pos) => (
            <div key={pos} className={`absolute ${pos} w-6 h-6 pointer-events-none`} style={{
              borderTop: pos.includes("top") ? "2px solid #D6A84F" : "none",
              borderBottom: pos.includes("bottom") ? "2px solid #D6A84F" : "none",
              borderRight: pos.includes("right") ? "2px solid #D6A84F" : "none",
              borderLeft: pos.includes("left") ? "2px solid #D6A84F" : "none",
            }} />
          ))}
        </>
      )}
      {!template.isGradient && !hasCoords && <div className="absolute inset-0 bg-black/45" />}
      {hasCoords ? (
        <div className="absolute inset-0">
          {logoUrl && (
            <div style={{ position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
              <img src={logoUrl} alt="לוגו" style={{ maxHeight: 32, maxWidth: "40%", objectFit: "contain", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))" }} />
            </div>
          )}
          {slots.map(slot => <AbsoluteSlot key={slot.id} slot={slot} value={values[slot.id] ?? slot.defaultValue} fontOverride={fontOverride} />)}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-10 gap-0.5 overflow-hidden" dir="rtl">
          {logoUrl && (
            <img src={logoUrl} alt="לוגו" className="mb-2 object-contain" style={{ maxHeight: 36, maxWidth: "45%", filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }} />
          )}
          <div className="w-24 h-px bg-[#D6A84F]/50 mb-2" />
          {slots.map(slot => {
            const val = values[slot.id] ?? slot.defaultValue;
            const isHtml = val.includes("<");
            const sz = previewFontSizePx[slot.fontSize || "sm"];
            if (!val.trim()) return null;
            return isHtml ? (
              <div key={slot.id} className="text-center leading-snug my-0.5" style={{
                fontSize: sz, fontFamily: resolveFont(slot.fontFamily, fontOverride),
                fontWeight: slot.bold ? 700 : 400, fontStyle: slot.italic ? "italic" : "normal",
                color: resolveColor(slot.color), lineHeight: slot.lineHeight ?? 1.35, direction: "rtl",
              }} dangerouslySetInnerHTML={{ __html: val }} />
            ) : (
              <StackedLine key={slot.id} slot={slot} value={val} fontOverride={fontOverride} />
            );
          })}
          <div className="w-24 h-px bg-[#D6A84F]/50 mt-2" />
        </div>
      )}

      {/* ── Placed elements layer ── */}
      {(placedElements ?? []).map(pe => (
        <div
          key={pe.uid}
          onClick={() => onSelectElement?.(pe.uid === selectedElementUid ? null : pe.uid)}
          style={{
            position: "absolute",
            left: `${pe.x}%`,
            top: `${pe.y}%`,
            width: `${pe.width}%`,
            opacity: pe.opacity,
            cursor: "pointer",
            zIndex: 20,
            outline: pe.uid === selectedElementUid ? "2px solid #D6A84F" : "none",
            outlineOffset: 2,
            borderRadius: 4,
          }}
        >
          <img
            src={pe.src}
            alt=""
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              filter: pe.tintColor ? colorToFilter(pe.tintColor) : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
            draggable={false}
          />
        </div>
      ))}

      <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.28, zIndex: 30 }}>
        <img src={hadarLogo} alt="הדר" style={{ height: 18, width: "auto", objectFit: "contain" }} />
      </div>
    </div>
  );
}

function AuthWall({ templateId }: { templateId: string }) {
  return (
    <div className="absolute inset-0 z-20 rounded-xl overflow-hidden">
      {/* Decorative blurred invitation mockup */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0B1833 0%, #0f2347 50%, #0B1833 100%)" }} />
      {/* Concentric golden rings */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="absolute border border-primary/10 rounded-full" style={{
          width: `${280 + i * 100}px`, height: `${280 + i * 100}px`,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }} />
      ))}
      {/* Simulated blurred invitation card */}
      <div className="absolute inset-8 rounded-xl opacity-20 blur-sm overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2d50 0%, #243960 100%)" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-0.5 bg-primary/60 rounded" />
          <div className="w-24 h-3 bg-primary/30 rounded" />
          <div className="w-32 h-5 bg-primary/50 rounded mt-1" />
          <div className="w-20 h-3 bg-primary/30 rounded" />
          <div className="w-16 h-0.5 bg-primary/60 rounded mt-1" />
          <div className="w-28 h-3 bg-foreground/15 rounded mt-2" />
          <div className="w-36 h-3 bg-foreground/15 rounded" />
          <div className="w-24 h-3 bg-foreground/15 rounded" />
        </div>
      </div>
      {/* Frosted glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ background: "linear-gradient(160deg, rgba(11,24,51,0.82) 0%, rgba(15,32,64,0.78) 100%)" }} />
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-8" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-primary" />
          </div>
          <div className="w-12 h-0.5 bg-primary/40 mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold mb-2 text-foreground drop-shadow-lg">נדרשת כניסה לחשבון</h3>
          <p className="text-sm text-primary/60 mb-6 leading-relaxed">כנסו כדי לשמור את העיצוב<br />ולהמשיך לשלב התשלום</p>
          <SignInButton mode="redirect" forceRedirectUrl={`${basePath}/editor/${templateId}`}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 px-7 py-5 text-base shadow-lg shadow-primary/20">
              <LogIn className="w-4 h-4" />
              כניסה / הרשמה
            </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}

function PaymentWall({ onPay, loading, designName }: { onPay: () => void; loading: boolean; designName: string }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-primary/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
          dir="rtl"
        >
          <Crown className="w-10 h-10 text-primary mx-auto mb-1" />
          <div className="w-16 h-px bg-primary/30 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2 text-foreground">קבלת העיצוב הסופי</h2>
          <p className="text-muted-foreground text-sm mb-6">
            לאחר התשלום תקבלו קבצי עיצוב סופיים בפורמטים מלאים לבית דפוס ולרשתות החברתיות, מוכנים להדפסה ושיתוף.
          </p>
          <div className="bg-secondary/40 border border-primary/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-foreground font-medium">{designName}</span>
              <span className="font-serif font-bold text-primary text-lg">₪49</span>
            </div>
            <p className="text-xs text-muted-foreground text-right">קבצי DXF, PNG, PDF • שירות לקוחות VIP</p>
          </div>
          <ul className="text-right text-xs text-muted-foreground mb-6 space-y-1.5">
            {["קבצי עיצוב סופיים לבית דפוס (PDF/PNG)", "גרסה לרשתות חברתיות (WhatsApp, Instagram)", "תיקון אחד ללא תוספת מחיר", "מסירה תוך 48 שעות"].map(item => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button
            onClick={onPay}
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2 text-base shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            {loading ? "מעביר לתשלום..." : "לתשלום מאובטח — ₪49"}
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3">
            תשלום מאובטח דרך Stripe • ניתן לבטל עד 24 שעות
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Editor() {
  const params = useParams();
  const id = params.id;
  const template = templates.find(t => t.id === id);
  const { theme, toggle } = useTheme();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const [, navigate] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const designIdParam = searchParams.get("design");
  const paymentStatus = searchParams.get("payment");

  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [designId, setDesignId] = useState<number | null>(designIdParam ? Number(designIdParam) : null);
  const [designName, setDesignName] = useState("עיצוב שלי");
  const [selectedFont, setSelectedFont] = useState(DEFAULT_FONT);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"text" | "elements">("text");
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [selectedElementUid, setSelectedElementUid] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load default font on mount
  useEffect(() => { loadGoogleFont(DEFAULT_FONT); }, []);

  const initValues = useCallback(() => {
    const init: Record<string, string> = {};
    (template?.slots || []).forEach(s => { init[s.id] = s.defaultValue; });
    return init;
  }, [template]);

  const [values, setValues] = useState<Record<string, string>>(initValues);

  // Load existing design if designId is in URL
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
          try {
            const els = JSON.parse(fv["__elements"] || "[]");
            if (Array.isArray(els)) setPlacedElements(els);
          } catch {}
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [designId, isSignedIn]);

  // Handle payment return
  useEffect(() => {
    if (paymentStatus === "success") {
      const sessionId = searchParams.get("session_id");
      if (sessionId && isSignedIn) {
        const verify = async () => {
          try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/hadar/checkout/verify?session_id=${sessionId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              if (data.status === "paid") setPaySuccess(true);
            }
          } catch {}
        };
        verify();
      }
    }
  }, [paymentStatus, isSignedIn]);

  const updateValue = (id: string, val: string) => {
    setValues(prev => ({ ...prev, [id]: val }));
    setSaved(false);
  };

  const resetAll = () => {
    setValues(initValues());
    setSaved(false);
  };

  const getFieldValuesWithElements = useCallback(() => {
    return { ...values, "__elements": JSON.stringify(placedElements) };
  }, [values, placedElements]);

  const handleAddElement = useCallback((el: { id: number; fileContent: string }) => {
    const uid = `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setPlacedElements(prev => [...prev, {
      uid, elementId: el.id, src: el.fileContent,
      x: 40, y: 40, width: 20, tintColor: "", opacity: 1,
    }]);
    setSelectedElementUid(uid);
    setSidebarTab("elements");
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

  const handleAutoSave = async (): Promise<number | null> => {
    if (!isSignedIn || !template) return null;
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
          body: JSON.stringify({ templateId: template.id, fieldValues: fv, designName }),
        });
        const data = await res.json();
        setDesignId(data.id);
        return data.id;
      }
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    await handleAutoSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadClick = () => {
    if (!isLoaded) return;
    if (!isSignedIn) return; // Auth wall shown in preview
    if (paySuccess) {
      window.open(`https://wa.me/972500000000?text=${encodeURIComponent("שלום, שילמתי עבור העיצוב שלי ואני רוצה לקבל את הקבצים הסופיים")}`, "_blank");
      return;
    }
    setShowPayment(true);
  };

  const handlePay = async () => {
    if (!isSignedIn || !template) return;
    setPayLoading(true);
    try {
      const savedDesignId = await handleAutoSave();
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/hadar/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          templateId: template.id,
          fieldValues: values,
          designName,
          designId: savedDesignId,
        }),
      });
      const data = await res.json();
      if (data.url) {
        if (data.designId) setDesignId(data.designId);
        window.location.href = data.url;
      } else {
        alert("שגיאה בפתיחת עמוד התשלום");
      }
    } catch (err) {
      alert("שגיאה, נסו שוב");
    } finally {
      setPayLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`שלום, אני מעוניין לבצע הזמנה לתבנית "${template?.title}". כבר ערכתי את הפרטים באונליין.`);
    window.open(`https://wa.me/972500000000?text=${msg}`, "_blank");
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4 text-foreground">התבנית לא נמצאה</h1>
          <Link href="/"><Button variant="outline" className="border-primary text-primary">חזרה לגלריה</Button></Link>
        </div>
      </div>
    );
  }

  const slots = template.slots || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">

      {showPayment && !paySuccess && (
        <PaymentWall onPay={handlePay} loading={payLoading} designName={designName} />
      )}

      {/* Sticky Header */}
      <header className="border-b border-primary/10 bg-background/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/template/${template.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group shrink-0">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline text-sm font-medium">חזרה</span>
            </Link>
            <div className="hidden sm:block w-px h-5 bg-primary/20" />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{template.title}</p>
              <p className="text-xs text-muted-foreground truncate">{template.subtitle}</p>
            </div>
          </div>

          <Link href="/" className="shrink-0">
            <img src={hadarLogo} alt="הדר" style={{ height: 36, width: "auto", objectFit: "contain" }} />
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggle} className="rounded-full p-1.5 border border-primary/20 text-primary hover:bg-primary/10 transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isSignedIn ? (
              <Link href="/my-designs">
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary gap-1.5 h-8 px-2 hidden sm:flex">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs">העיצובים שלי</span>
                </Button>
              </Link>
            ) : null}
            <Button size="sm" variant="ghost" onClick={resetAll} className="text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2 hidden sm:flex">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs">איפוס</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className={`gap-1.5 h-8 px-3 text-xs transition-all ${saved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"} text-primary-foreground`}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
              {saving ? "שומר..." : saved ? "נשמר!" : "שמירה"}
            </Button>
          </div>
        </div>
      </header>

      {/* Payment success banner */}
      {paySuccess && (
        <div className="bg-green-600 text-white text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          התשלום הצליח! העיצוב הסופי יישלח אליכם תוך 48 שעות. לפניות: <button onClick={handleWhatsApp} className="underline">ווצאפ</button>
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-56px)]">

        {/* ── LEFT PANEL: fields ── */}
        <aside className="lg:w-[420px] xl:w-[460px] shrink-0 border-b lg:border-b-0 lg:border-l border-primary/10 flex flex-col bg-card/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-primary/10 bg-card flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-foreground">עורך העיצוב</p>
              <p className="text-xs text-muted-foreground">{slots.length} שדות טקסט</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
              ₪{template.price}
            </span>
          </div>

          {/* Steps guide */}
          <div className="px-5 py-2.5 border-b border-primary/10 bg-primary/5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {[
                { n: "1", label: "ערכו", done: true },
                { n: "2", label: "שמרו", done: isSignedIn && saved },
                { n: "3", label: "תשלום", done: paySuccess },
                { n: "4", label: "קבצים", done: false },
              ].map((step, i) => (
                <div key={step.n} className="flex items-center gap-1">
                  {i > 0 && <span className="text-primary/30">←</span>}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${step.done ? "bg-green-600 text-white" : "bg-primary/20 text-primary"}`}>
                      {step.done ? "✓" : step.n}
                    </span>
                    <span className={step.done ? "text-green-600" : ""}>{step.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-primary/10 bg-card">
            <button
              onClick={() => setSidebarTab("text")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                sidebarTab === "text"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              טקסטים
            </button>
            <button
              onClick={() => setSidebarTab("elements")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                sidebarTab === "elements"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              אלמנטים
              {placedElements.length > 0 && (
                <span className="bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {placedElements.length}
                </span>
              )}
            </button>
          </div>

          {/* ── TAB: Text ── */}
          {sidebarTab === "text" && (
            <>
              {/* Design name input */}
              {isSignedIn && (
                <div className="px-5 py-2 border-b border-primary/10 bg-card/30">
                  <Input
                    value={designName}
                    onChange={e => setDesignName(e.target.value)}
                    placeholder="שם העיצוב שלכם..."
                    className="h-8 text-xs bg-transparent border-0 border-b border-primary/10 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary/40 text-foreground placeholder:text-muted-foreground/40"
                    dir="rtl"
                  />
                </div>
              )}

              {/* Font selector */}
              <FontSelector selected={selectedFont} onChange={setSelectedFont} />

              {/* Logo uploader */}
              <LogoUploader logoUrl={logoUrl} onChange={setLogoUrl} />

              {/* Fields list with rich text */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3 space-y-3">
                  <p className="text-[10px] text-muted-foreground">
                    בחרו חלק מהטקסט לשינוי גודל או גופן ספציפי
                  </p>
                  {slots.filter(s => s.id !== "__elements").map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="bg-background border border-primary/10 rounded-xl px-3 py-2.5 hover:border-primary/30 transition-colors focus-within:border-primary/50 focus-within:shadow-sm focus-within:shadow-primary/10">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <RichTextSlot
                              label={slot.label}
                              value={values[slot.id] ?? slot.defaultValue}
                              placeholder={slot.placeholder}
                              multiline={slot.multiline}
                              onChange={html => updateValue(slot.id, html)}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── TAB: Elements ── */}
          {sidebarTab === "elements" && (
            <ElementsPanel
              placedElements={placedElements}
              selectedUid={selectedElementUid}
              onSelect={setSelectedElementUid}
              onAdd={handleAddElement}
              onUpdate={handleUpdateElement}
              onDelete={handleDeleteElement}
            />
          )}

          {/* Bottom action bar */}
          <div className="border-t border-primary/10 bg-card p-4 space-y-2">
            {paySuccess ? (
              <Button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-11 font-bold">
                <MessageCircle className="w-4 h-4" />
                צרו קשר לקבלת הקבצים
              </Button>
            ) : isSignedIn ? (
              <Button onClick={handleDownloadClick} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 font-bold shadow-lg shadow-primary/20">
                <CreditCard className="w-4 h-4" />
                קבלת העיצוב הסופי — ₪49
              </Button>
            ) : (
              <SignInButton mode="redirect" forceRedirectUrl={`${basePath}/editor/${template.id}`}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 font-bold">
                  <LogIn className="w-4 h-4" />
                  כניסה לשמירה ותשלום
                </Button>
              </SignInButton>
            )}
            <Button onClick={handleWhatsApp} variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/10 gap-2 h-9 text-sm">
              <MessageCircle className="w-4 h-4" />
              שלחו לסטודיו דרך ווצאפ
            </Button>
          </div>
        </aside>

        {/* ── RIGHT PANEL: live preview ── */}
        <main className="flex-1 overflow-y-auto bg-secondary/30 flex flex-col items-center justify-start p-4 md:p-8 gap-4">
          <div className="flex items-center gap-2 bg-card border border-primary/10 rounded-full px-3 py-1.5 shadow-sm self-start lg:self-center">
            <span className="text-xs text-muted-foreground font-medium">תצוגה מקדימה</span>
            <div className="w-px h-4 bg-primary/20" />
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-foreground w-9 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(1.4, z + 0.1))} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div ref={previewRef} className="w-full max-w-xs sm:max-w-sm md:max-w-md relative" style={{ transformOrigin: "top center" }}>
            <InvitationPreview
              template={template}
              values={values}
              zoom={zoom}
              fontOverride={selectedFont}
              logoUrl={logoUrl}
              placedElements={placedElements}
              selectedElementUid={selectedElementUid}
              onSelectElement={uid => { setSelectedElementUid(uid); if (uid) setSidebarTab("elements"); }}
            />
            {isLoaded && !isSignedIn && <AuthWall templateId={template.id} />}
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs pb-4">
            זוהי תצוגה מקדימה. העיצוב הסופי יבוצע על-ידי הסטודיו שלנו בהתאמה מדויקת לבקשתכם.
          </p>
        </main>
      </div>
    </div>
  );
}
