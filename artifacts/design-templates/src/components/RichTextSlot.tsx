import { useRef, useState, useCallback, useEffect } from "react";
import { HEBREW_FONTS } from "@/pages/editor";
import { ChevronDown, ChevronUp } from "lucide-react";

const FONT_SIZES = [10, 12, 14, 16, 18, 22, 28, 36, 48];

interface RichTextSlotProps {
  label: string;
  value: string;
  placeholder: string;
  multiline: boolean;
  onChange: (html: string) => void;
}

export function RichTextSlot({ label, value, placeholder, multiline, onChange }: RichTextSlotProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [fontOpen, setFontOpen] = useState(false);

  useEffect(() => {
    if (divRef.current && divRef.current.innerHTML !== value) {
      const sel = window.getSelection();
      const range = sel?.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      divRef.current.innerHTML = value;
      if (range && divRef.current.contains(range.startContainer)) {
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [value]);

  const applyStyle = useCallback((style: Record<string, string>) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    try {
      const span = document.createElement("span");
      Object.assign(span.style, style);
      range.surroundContents(span);
      onChange(divRef.current?.innerHTML ?? "");
      sel.removeAllRanges();
      setToolbarVisible(false);
    } catch {
      // selection crosses multiple elements — apply via execCommand fallback
      if (style.fontSize) {
        document.execCommand("fontSize", false, "7");
        const fontEls = divRef.current?.querySelectorAll('font[size="7"]') ?? [];
        fontEls.forEach(el => {
          const s = el as HTMLElement;
          s.removeAttribute("size");
          s.style.fontSize = style.fontSize;
        });
      }
      if (style.fontFamily) {
        document.execCommand("fontName", false, style.fontFamily);
      }
      onChange(divRef.current?.innerHTML ?? "");
    }
  }, [onChange]);

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !divRef.current?.contains(sel.anchorNode)) {
      setToolbarVisible(false);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = divRef.current.getBoundingClientRect();
    setToolbarPos({
      top: rect.top - containerRect.top - 44,
      left: rect.left - containerRect.left + rect.width / 2 - 100,
    });
    setToolbarVisible(true);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [handleSelectionChange]);

  const bump = (delta: number) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer.parentElement;
    const currentSize = node ? parseFloat(getComputedStyle(node).fontSize) : 14;
    const newSize = Math.max(8, Math.min(96, currentSize + delta));
    applyStyle({ fontSize: `${newSize}px` });
  };

  return (
    <div className="group relative flex flex-col gap-1">
      <label className="block text-[11px] font-medium text-muted-foreground leading-none">{label}</label>

      {/* Floating toolbar */}
      {toolbarVisible && (
        <div
          className="absolute z-50 flex items-center gap-0.5 bg-card border border-primary/20 rounded-lg shadow-xl px-2 py-1.5 text-xs"
          style={{ top: toolbarPos.top, left: toolbarPos.left, minWidth: 200, direction: "rtl" }}
          onMouseDown={e => e.preventDefault()}
        >
          {/* Size controls */}
          <button
            className="px-2 py-1 rounded hover:bg-primary/10 text-primary font-bold text-sm leading-none"
            onClick={() => bump(-2)}
            title="הקטן"
          >A-</button>
          <button
            className="px-2 py-1 rounded hover:bg-primary/10 text-primary font-bold text-sm leading-none"
            onClick={() => bump(2)}
            title="הגדל"
          >A+</button>

          <div className="w-px h-4 bg-primary/20 mx-1" />

          {/* Quick size presets */}
          {[12, 16, 22, 32].map(sz => (
            <button
              key={sz}
              className="px-1.5 py-0.5 rounded hover:bg-primary/10 text-muted-foreground font-medium"
              onClick={() => applyStyle({ fontSize: `${sz}px` })}
            >{sz}</button>
          ))}

          <div className="w-px h-4 bg-primary/20 mx-1" />

          {/* Font family mini picker */}
          <div className="relative">
            <button
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10 text-muted-foreground"
              onClick={() => setFontOpen(o => !o)}
            >
              <span>גופן</span>
              {fontOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {fontOpen && (
              <div
                className="absolute top-full right-0 mt-1 bg-card border border-primary/20 rounded-lg shadow-xl z-50 overflow-y-auto"
                style={{ maxHeight: 160, minWidth: 140, direction: "rtl" }}
                onMouseDown={e => e.preventDefault()}
              >
                {HEBREW_FONTS.slice(0, 10).map(f => (
                  <button
                    key={f.family}
                    className="w-full text-right px-3 py-1.5 hover:bg-primary/10 text-sm"
                    style={{ fontFamily: `'${f.family}', serif` }}
                    onClick={() => { applyStyle({ fontFamily: `'${f.family}', serif` }); setFontOpen(false); }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        dir="rtl"
        onInput={e => onChange(e.currentTarget.innerHTML)}
        onBlur={() => setTimeout(() => setToolbarVisible(false), 200)}
        className={`w-full text-sm bg-transparent border-b border-primary/10 focus:outline-none focus:border-primary/40 text-foreground px-0 py-0.5 ${multiline ? "min-h-[48px]" : "min-h-[28px]"} whitespace-pre-wrap`}
        style={{ direction: "rtl", unicodeBidi: "bidi-override" }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(var(--muted-foreground) / 0.4);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
