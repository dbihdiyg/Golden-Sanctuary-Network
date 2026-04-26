import { useState, useEffect } from "react";
import { Plus, Trash2, Minus, ChevronDown, ChevronUp, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");

export type PlacedElement = {
  uid: string;
  elementId: number;
  src: string;
  x: number;
  y: number;
  width: number;
  tintColor: string;
  opacity: number;
};

interface LibraryElement {
  id: number;
  name: string;
  category: string;
  fileContent: string;
  mimeType: string;
}

const PRESET_COLORS = [
  { label: "ללא", value: "" },
  { label: "זהב", value: "#D6A84F" },
  { label: "שמנת", value: "#F8F1E3" },
  { label: "נייבי", value: "#0B1833" },
  { label: "לבן", value: "#FFFFFF" },
  { label: "שחור", value: "#000000" },
  { label: "אדום", value: "#C0392B" },
  { label: "כחול", value: "#2471A3" },
  { label: "ירוק", value: "#1E8449" },
  { label: "סגול", value: "#7D3C98" },
];

function colorToFilter(hex: string): string {
  if (!hex) return "";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 60) {
    return "brightness(0)";
  }
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const hue = Math.round(Math.atan2(Math.sqrt(3) * (gn - bn), 2 * rn - gn - bn) * (180 / Math.PI));
  return `brightness(0) invert(1) sepia(1) hue-rotate(${hue}deg) saturate(3)`;
}

interface ElementsPanelProps {
  placedElements: PlacedElement[];
  selectedUid: string | null;
  onSelect: (uid: string | null) => void;
  onAdd: (el: LibraryElement) => void;
  onUpdate: (uid: string, patch: Partial<PlacedElement>) => void;
  onDelete: (uid: string) => void;
}

export function ElementsPanel({
  placedElements, selectedUid, onSelect, onAdd, onUpdate, onDelete,
}: ElementsPanelProps) {
  const [library, setLibrary] = useState<LibraryElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [placedOpen, setPlacedOpen] = useState(true);
  const [customColor, setCustomColor] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/hadar/public-elements`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setLibrary(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedEl = placedElements.find(e => e.uid === selectedUid) ?? null;

  const groupedLibrary: Record<string, LibraryElement[]> = {};
  for (const el of library) {
    const cat = el.category || "general";
    if (!groupedLibrary[cat]) groupedLibrary[cat] = [];
    groupedLibrary[cat].push(el);
  }

  return (
    <div className="flex-1 overflow-y-auto">

      {/* ── Library ── */}
      <div className="border-b border-primary/10">
        <button
          className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/5 transition-colors"
          onClick={() => setLibraryOpen(o => !o)}
        >
          <span className="text-xs font-semibold text-foreground">ספריית אלמנטים</span>
          {libraryOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>

        {libraryOpen && (
          <div className="px-4 pb-4">
            {loading && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
            {!loading && library.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                אין אלמנטים עדיין.<br />הוסיפו דרך פאנל הניהול.
              </p>
            )}
            {Object.entries(groupedLibrary).map(([cat, els]) => (
              <div key={cat} className="mb-3">
                <p className="text-[10px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wide">{cat}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {els.map(el => (
                    <button
                      key={el.id}
                      onClick={() => onAdd(el)}
                      className="aspect-square rounded-lg border border-primary/10 hover:border-primary/40 bg-background/60 flex items-center justify-center p-2 transition-all hover:scale-105 group relative"
                      title={el.name}
                    >
                      <img
                        src={el.fileContent}
                        alt={el.name}
                        className="w-full h-full object-contain"
                        style={{ filter: "brightness(1.2) drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
                      />
                      <span className="absolute bottom-0.5 left-0 right-0 text-[8px] text-center text-muted-foreground truncate px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {el.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Placed elements controls ── */}
      {placedElements.length > 0 && (
        <div className="border-b border-primary/10">
          <button
            className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-primary/5 transition-colors"
            onClick={() => setPlacedOpen(o => !o)}
          >
            <span className="text-xs font-semibold text-foreground">
              אלמנטים שהוספו ({placedElements.length})
            </span>
            {placedOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>

          {placedOpen && (
            <div className="px-4 pb-4 space-y-2">
              {placedElements.map((pe, i) => (
                <div
                  key={pe.uid}
                  onClick={() => onSelect(pe.uid === selectedUid ? null : pe.uid)}
                  className={`rounded-xl border p-2.5 cursor-pointer transition-all ${
                    pe.uid === selectedUid
                      ? "border-primary/50 bg-primary/10"
                      : "border-primary/10 bg-background/60 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-md border border-primary/10 bg-background flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={pe.src}
                        alt=""
                        className="w-full h-full object-contain"
                        style={{ filter: pe.tintColor ? colorToFilter(pe.tintColor) : "" }}
                      />
                    </div>
                    <span className="text-xs text-foreground flex-1 truncate">אלמנט {i + 1}</span>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(pe.uid); }}
                      className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {pe.uid === selectedUid && (
                    <div className="space-y-3 pt-1" onClick={e => e.stopPropagation()}>
                      {/* Position X / Y */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-1">מיקום X</label>
                          <input
                            type="range" min={0} max={90} value={pe.x}
                            onChange={e => onUpdate(pe.uid, { x: Number(e.target.value) })}
                            className="w-full accent-primary h-1"
                          />
                          <span className="text-[10px] text-muted-foreground">{pe.x}%</span>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-1">מיקום Y</label>
                          <input
                            type="range" min={0} max={90} value={pe.y}
                            onChange={e => onUpdate(pe.uid, { y: Number(e.target.value) })}
                            className="w-full accent-primary h-1"
                          />
                          <span className="text-[10px] text-muted-foreground">{pe.y}%</span>
                        </div>
                      </div>

                      {/* Size */}
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">גודל</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdate(pe.uid, { width: Math.max(5, pe.width - 5) })}
                            className="w-6 h-6 rounded border border-primary/20 flex items-center justify-center hover:bg-primary/10"
                          ><Minus className="w-3 h-3" /></button>
                          <input
                            type="range" min={5} max={80} value={pe.width}
                            onChange={e => onUpdate(pe.uid, { width: Number(e.target.value) })}
                            className="flex-1 accent-primary h-1"
                          />
                          <button
                            onClick={() => onUpdate(pe.uid, { width: Math.min(80, pe.width + 5) })}
                            className="w-6 h-6 rounded border border-primary/20 flex items-center justify-center hover:bg-primary/10"
                          ><Plus className="w-3 h-3" /></button>
                          <span className="text-[10px] text-muted-foreground w-7 text-left">{pe.width}%</span>
                        </div>
                      </div>

                      {/* Opacity */}
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">שקיפות</label>
                        <input
                          type="range" min={10} max={100} value={Math.round(pe.opacity * 100)}
                          onChange={e => onUpdate(pe.uid, { opacity: Number(e.target.value) / 100 })}
                          className="w-full accent-primary h-1"
                        />
                      </div>

                      {/* Tint color */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Palette className="w-3 h-3 text-primary" />
                          <label className="text-[10px] text-muted-foreground font-medium">צבע</label>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c.value}
                              title={c.label}
                              onClick={() => onUpdate(pe.uid, { tintColor: c.value })}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${
                                pe.tintColor === c.value ? "border-primary scale-110" : "border-primary/20 hover:border-primary/50"
                              }`}
                              style={{
                                background: c.value || "transparent",
                                backgroundImage: c.value ? undefined : "repeating-conic-gradient(#aaa 0% 25%, transparent 0% 50%) 0 0 / 8px 8px",
                              }}
                            />
                          ))}
                          {/* Custom color input */}
                          <input
                            type="color"
                            value={customColor || pe.tintColor || "#D6A84F"}
                            onChange={e => { setCustomColor(e.target.value); onUpdate(pe.uid, { tintColor: e.target.value }); }}
                            className="w-6 h-6 rounded-full border border-primary/20 cursor-pointer"
                            title="צבע מותאם"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { colorToFilter };
