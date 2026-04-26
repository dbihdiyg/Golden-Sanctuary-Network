import { useState, useCallback, useRef } from "react";
import { useParams, Link } from "wouter";
import { ArrowRight, Crown, MessageCircle, Download, RotateCcw, CheckCircle2, ZoomIn, ZoomOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { templates, TextSlot } from "@/lib/data";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";

// px font sizes for CSS — used in both modes
const previewFontSizePx: Record<string, number> = {
  xs: 9,
  sm: 11,
  md: 13,
  lg: 16,
  xl: 20,
  "2xl": 26,
};

// Color resolver
function resolveColor(color?: string): string {
  if (color === "gold") return "#D6A84F";
  if (color === "dark") return "#0B1833";
  if (color === "cream") return "#F8F1E3";
  return "#F8F1E3"; // default cream/white
}

// Stacked mode: renders one text block in a vertical flow
function StackedLine({ slot, value }: { slot: TextSlot; value: string }) {
  if (!value.trim()) return null;
  const sz = previewFontSizePx[slot.fontSize || "sm"];
  return (
    <div
      className="text-center leading-snug my-0.5 whitespace-pre-line"
      style={{
        fontSize: sz,
        fontFamily: slot.fontFamily === "serif" ? "'Noto Serif Hebrew', serif" : "'Heebo', sans-serif",
        fontWeight: slot.bold ? 700 : 400,
        fontStyle: slot.italic ? "italic" : "normal",
        color: resolveColor(slot.color),
        lineHeight: slot.lineHeight ?? 1.35,
      }}
    >
      {value}
    </div>
  );
}

// Absolute mode: renders text at exact x/y percentage coordinates
function AbsoluteSlot({ slot, value, containerW, containerH }: {
  slot: TextSlot;
  value: string;
  containerW: number;
  containerH: number;
}) {
  if (!value.trim() || slot.x == null || slot.y == null) return null;

  const sz = previewFontSizePx[slot.fontSize || "sm"];
  const w = slot.width ?? 80;

  return (
    <div
      style={{
        position: "absolute",
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${w}%`,
        transform: "translateX(-50%)",
        fontSize: sz,
        fontFamily: slot.fontFamily === "serif" ? "'Noto Serif Hebrew', serif" : "'Heebo', sans-serif",
        fontWeight: slot.bold ? 700 : 400,
        fontStyle: slot.italic ? "italic" : "normal",
        color: resolveColor(slot.color),
        textAlign: slot.align ?? "center",
        lineHeight: slot.lineHeight ?? 1.35,
        whiteSpace: "pre-line",
        direction: "rtl",
        pointerEvents: "none",
      }}
    >
      {value}
    </div>
  );
}

function InvitationPreview({ template, values, zoom }: {
  template: typeof templates[0];
  values: Record<string, string>;
  zoom: number;
}) {
  const slots = template.slots || [];

  // Detect mode: if ANY slot has x/y coordinates → use absolute positioning
  const hasCoords = slots.some(s => s.x != null && s.y != null);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl shadow-2xl border border-primary/20"
      style={{
        aspectRatio: "3/4",
        transform: `scale(${zoom})`,
        transformOrigin: "top center",
        transition: "transform 0.2s ease",
      }}
    >
      {/* ── BACKGROUND ── */}
      {template.isGradient ? (
        <div className="absolute inset-0" style={{ background: template.image }} />
      ) : (
        <img
          src={template.image}
          alt={template.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* For gradient templates: decorative frame & ornaments */}
      {template.isGradient && (
        <>
          <div className="absolute inset-3 border border-[#D6A84F]/40 rounded-lg pointer-events-none" />
          <div className="absolute inset-5 border border-[#D6A84F]/20 rounded-lg pointer-events-none" />
          {(["top-3 right-3", "top-3 left-3", "bottom-3 right-3", "bottom-3 left-3"] as const).map((pos) => (
            <div key={pos} className={`absolute ${pos} w-6 h-6 pointer-events-none`}
              style={{
                borderTop: pos.includes("top") ? "2px solid #D6A84F" : "none",
                borderBottom: pos.includes("bottom") ? "2px solid #D6A84F" : "none",
                borderRight: pos.includes("right") ? "2px solid #D6A84F" : "none",
                borderLeft: pos.includes("left") ? "2px solid #D6A84F" : "none",
              }}
            />
          ))}
        </>
      )}

      {/* For photo templates without coords: semi-transparent overlay for readability */}
      {!template.isGradient && !hasCoords && (
        <div className="absolute inset-0 bg-black/45" />
      )}

      {/* ── TEXT LAYER ── */}
      {hasCoords ? (
        // ABSOLUTE MODE: each slot placed at its exact x/y position
        <div className="absolute inset-0">
          {slots.map(slot => (
            <AbsoluteSlot
              key={slot.id}
              slot={slot}
              value={values[slot.id] ?? slot.defaultValue}
              containerW={400}
              containerH={533}
            />
          ))}
        </div>
      ) : (
        // STACKED MODE: centered vertical flow (default for templates without coords)
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-10 gap-0.5 overflow-hidden" dir="rtl">
          <div className="w-24 h-px bg-[#D6A84F]/50 mb-2" />
          {slots.map(slot => (
            <StackedLine key={slot.id} slot={slot} value={values[slot.id] ?? slot.defaultValue} />
          ))}
          <div className="w-24 h-px bg-[#D6A84F]/50 mt-2" />
        </div>
      )}

      {/* Studio watermark */}
      <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1 opacity-30 pointer-events-none">
        <Crown className="w-2.5 h-2.5 text-[#D6A84F]" />
        <span className="text-[9px] font-serif text-[#D6A84F] tracking-widest">הדר</span>
      </div>
    </div>
  );
}

export default function Editor() {
  const params = useParams();
  const id = params.id;
  const template = templates.find(t => t.id === id);
  const { theme, toggle } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const initValues = useCallback(() => {
    const init: Record<string, string> = {};
    (template?.slots || []).forEach(s => { init[s.id] = s.defaultValue; });
    return init;
  }, [template]);

  const [values, setValues] = useState<Record<string, string>>(initValues);

  const updateValue = (id: string, val: string) => {
    setValues(prev => ({ ...prev, [id]: val }));
    setSaved(false);
  };

  const resetAll = () => {
    setValues(initValues());
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          <Link href="/">
            <Button variant="outline" className="border-primary text-primary">חזרה לגלריה</Button>
          </Link>
        </div>
      </div>
    );
  }

  const slots = template.slots || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">

      {/* Sticky Header */}
      <header className="border-b border-primary/10 bg-background/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Left: back + title */}
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

          {/* Center: logo */}
          <Link href="/" className="relative shrink-0">
            <Crown className="w-3.5 h-3.5 text-primary absolute -top-3 left-1/2 -translate-x-1/2" />
            <span className="font-serif font-bold text-xl text-foreground">הדר</span>
          </Link>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggle} className="rounded-full p-1.5 border border-primary/20 text-primary hover:bg-primary/10 transition-colors">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button size="sm" variant="ghost" onClick={resetAll} className="text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2 hidden sm:flex">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs">איפוס</span>
            </Button>
            <Button size="sm" onClick={handleSave} className={`gap-1.5 h-8 px-3 text-xs transition-all ${saved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"} text-primary-foreground`}>
              {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
              {saved ? "נשמר!" : "שמירה"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row h-[calc(100vh-56px)]">

        {/* ── LEFT PANEL: fields ── */}
        <aside className="lg:w-[420px] xl:w-[460px] shrink-0 border-b lg:border-b-0 lg:border-l border-primary/10 flex flex-col bg-card/50 overflow-hidden">

          {/* Panel header */}
          <div className="px-5 py-3 border-b border-primary/10 bg-card flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-foreground">עריכת טקסטים</p>
              <p className="text-xs text-muted-foreground">{slots.length} שדות לעריכה</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
              ₪{template.price}
            </span>
          </div>

          {/* Steps guide */}
          <div className="px-5 py-3 border-b border-primary/10 bg-primary/5">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>ערכו את הטקסטים</span>
              </div>
              <div className="text-primary/30">←</div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>שלחו בווצאפ</span>
              </div>
            </div>
          </div>

          {/* Fields list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 space-y-2">
              {slots.map((slot, index) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <div className="flex items-start gap-3 bg-background border border-primary/10 rounded-xl px-3 py-2.5 hover:border-primary/30 transition-colors focus-within:border-primary/50 focus-within:shadow-sm focus-within:shadow-primary/10">

                    {/* Line number */}
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-1.5">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 leading-none">
                        {slot.label}
                      </label>
                      {slot.multiline ? (
                        <Textarea
                          value={values[slot.id] ?? slot.defaultValue}
                          onChange={e => updateValue(slot.id, e.target.value)}
                          placeholder={slot.placeholder}
                          rows={2}
                          className="resize-none text-sm bg-transparent border-0 border-b border-primary/10 focus-visible:ring-0 focus-visible:border-primary/40 rounded-none px-0 py-0.5 min-h-0 h-auto text-foreground placeholder:text-muted-foreground/40"
                          dir="rtl"
                        />
                      ) : (
                        <Input
                          value={values[slot.id] ?? slot.defaultValue}
                          onChange={e => updateValue(slot.id, e.target.value)}
                          placeholder={slot.placeholder}
                          className="text-sm bg-transparent border-0 border-b border-primary/10 focus-visible:ring-0 focus-visible:border-primary/40 rounded-none px-0 py-0.5 h-7 text-foreground placeholder:text-muted-foreground/40"
                          dir="rtl"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="border-t border-primary/10 bg-card p-4 space-y-2">
            <Button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-11 font-bold"
            >
              <MessageCircle className="w-4 h-4" />
              שלחו לסטודיו דרך ווצאפ
            </Button>
            <Button
              variant="outline"
              className="w-full border-primary/20 text-primary hover:bg-primary/10 gap-2 h-9 text-sm"
              onClick={handleSave}
            >
              <Download className="w-4 h-4" />
              שמרו טיוטה
            </Button>
          </div>
        </aside>

        {/* ── RIGHT PANEL: live preview ── */}
        <main className="flex-1 overflow-y-auto bg-secondary/30 flex flex-col items-center justify-start p-4 md:p-8 gap-4">

          {/* Zoom controls */}
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

          {/* Preview container */}
          <div ref={previewRef} className="w-full max-w-xs sm:max-w-sm md:max-w-md" style={{ transformOrigin: "top center" }}>
            <InvitationPreview template={template} values={values} zoom={zoom} />
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground text-center max-w-xs pb-4">
            זוהי תצוגה מקדימה. העיצוב הסופי יבוצע על-ידי הסטודיו שלנו בהתאמה מדויקת לבקשתכם.
          </p>
        </main>
      </div>
    </div>
  );
}
