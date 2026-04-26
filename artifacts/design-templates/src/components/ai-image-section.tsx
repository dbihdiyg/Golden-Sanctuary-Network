import { useState, useCallback } from "react";
import type { StoreType } from "polotno/model/store";
import { useAuth } from "@clerk/react";
import { Loader2, Wand2, RefreshCw, PlusCircle, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");

const PROMPT_SUGGESTIONS = [
  "ענפי זית עם עלים ירוקים, רקע לבן",
  "נרות שבת דולקים, אווירה חגיגית",
  "ספר תורה עם כתר זהב",
  "ורדים לבנים עדינים, פרחים",
  "מנורה זהובה, רקע קרם",
  "ירושלים, עיר קדושה, שקיעה",
  "יונים לבנות בשמיים כחולים",
  "שושנים ורודות, פרחי אביב",
];

const SIZE_OPTIONS = [
  { value: "1024x1024", label: "ריבוע", aspect: "1:1" },
  { value: "1024x1536", label: "לאורך", aspect: "2:3" },
  { value: "1536x1024", label: "לרוחב", aspect: "3:2" },
];

interface Props {
  store: StoreType;
}

export function AIImagePanel({ store }: Props) {
  const { getToken, isSignedIn } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1024x1536" | "1536x1024">("1024x1024");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedB64, setGeneratedB64] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const generate = useCallback(async (overridePrompt?: string) => {
    const p = overridePrompt ?? prompt;
    if (!p.trim()) { setError("יש להזין תיאור לתמונה"); return; }
    setLoading(true);
    setError(null);
    setGeneratedB64(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/hadar/generate-image`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: p, size }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `שגיאה ${res.status}`);
      }

      const data: { b64_json: string } = await res.json();
      setGeneratedB64(data.b64_json);
      setLastPrompt(p);
    } catch (e: any) {
      setError(e?.message ?? "שגיאה ביצירת תמונה");
    } finally {
      setLoading(false);
    }
  }, [prompt, size, isSignedIn, getToken]);

  const addToCanvas = useCallback(() => {
    if (!generatedB64) return;
    const dataUrl = `data:image/png;base64,${generatedB64}`;
    const page = store.activePage;
    if (!page) return;
    const w = 400;
    const h = size === "1536x1024" ? Math.round(w * (1024 / 1536))
            : size === "1024x1536" ? Math.round(w * (1536 / 1024))
            : w;
    const x = Math.max(0, (store.width - w) / 2);
    const y = Math.max(0, (store.height - h) / 2);

    page.addElement({
      type: "image",
      src: dataUrl,
      x,
      y,
      width: w,
      height: h,
      name: `AI: ${lastPrompt?.slice(0, 30) ?? "תמונה"}`,
    });
  }, [generatedB64, store, size, lastPrompt]);

  return (
    <div
      dir="rtl"
      style={{
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
        overflowY: "auto",
        fontFamily: "Heebo, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", paddingBottom: "4px", borderBottom: "1px solid rgba(214,168,79,0.3)" }}>
        <Sparkles style={{ width: 16, height: 16, color: "#D6A84F" }} />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#D6A84F" }}>יצירת תמונה עם AI</span>
      </div>

      {/* Prompt textarea */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "11px", color: "#aaa", fontWeight: 500 }}>תאר את התמונה הרצויה</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="למשל: פרחים לבנים עדינים, רקע זהוב..."
          dir="rtl"
          rows={3}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(214,168,79,0.4)",
            background: "rgba(11,24,51,0.6)",
            color: "#F8F1E3",
            fontSize: "12px",
            resize: "vertical",
            outline: "none",
            fontFamily: "Heebo, sans-serif",
            direction: "rtl",
            textAlign: "right",
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate();
          }}
        />
      </div>

      {/* Suggestions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", color: "#aaa" }}>רעיונות מהירים</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {PROMPT_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              style={{
                padding: "3px 8px",
                borderRadius: "12px",
                border: "1px solid rgba(214,168,79,0.3)",
                background: prompt === s ? "rgba(214,168,79,0.25)" : "rgba(214,168,79,0.08)",
                color: prompt === s ? "#D6A84F" : "#aaa",
                fontSize: "10px",
                cursor: "pointer",
                transition: "all 0.15s",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              {s.split(",")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <label style={{ fontSize: "11px", color: "#aaa" }}>גודל תמונה</label>
        <div style={{ display: "flex", gap: "6px" }}>
          {SIZE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSize(opt.value as typeof size)}
              style={{
                flex: 1,
                padding: "6px 4px",
                borderRadius: "6px",
                border: size === opt.value ? "1px solid #D6A84F" : "1px solid rgba(214,168,79,0.2)",
                background: size === opt.value ? "rgba(214,168,79,0.2)" : "transparent",
                color: size === opt.value ? "#D6A84F" : "#aaa",
                fontSize: "10px",
                cursor: "pointer",
                textAlign: "center",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              <div style={{ fontWeight: 600 }}>{opt.label}</div>
              <div style={{ opacity: 0.7 }}>{opt.aspect}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={() => generate()}
        disabled={loading || !prompt.trim()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          background: loading || !prompt.trim()
            ? "rgba(214,168,79,0.3)"
            : "linear-gradient(135deg, #D6A84F, #b8892f)",
          color: loading || !prompt.trim() ? "#888" : "#0B1833",
          fontWeight: 700,
          fontSize: "13px",
          cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
          fontFamily: "Heebo, sans-serif",
          transition: "all 0.2s",
        }}
      >
        {loading ? (
          <>
            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
            יוצר תמונה...
          </>
        ) : (
          <>
            <Wand2 style={{ width: 14, height: 14 }} />
            צור תמונה
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          padding: "8px 10px",
          borderRadius: "6px",
          background: "rgba(220,53,69,0.15)",
          border: "1px solid rgba(220,53,69,0.3)",
          color: "#ff6b6b",
          fontSize: "11px",
        }}>
          {error}
        </div>
      )}

      {/* Generated image preview */}
      {generatedB64 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", color: "#aaa" }}>תמונה שנוצרה</label>
          <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(214,168,79,0.4)" }}>
            <img
              src={`data:image/png;base64,${generatedB64}`}
              alt="AI generated"
              style={{ width: "100%", display: "block" }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={addToCanvas}
              style={{
                flex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                background: "linear-gradient(135deg, #D6A84F, #b8892f)",
                color: "#0B1833",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              <PlusCircle style={{ width: 13, height: 13 }} />
              הוסף לעיצוב
            </button>
            <button
              onClick={() => generate(lastPrompt ?? undefined)}
              disabled={loading}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid rgba(214,168,79,0.4)",
                background: "transparent",
                color: "#D6A84F",
                fontWeight: 600,
                fontSize: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              <RefreshCw style={{ width: 12, height: 12 }} />
              חדש
            </button>
          </div>
        </div>
      )}

      {/* Tip */}
      {!generatedB64 && !loading && (
        <div style={{ fontSize: "10px", color: "#666", textAlign: "center", paddingTop: "4px" }}>
          התמונות שנוצרות נשמרות אוטומטית בעיצוב שלך
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Custom Polotno Section ─────────────────────────────────────────────────────
// Polotno SidePanel expects: { name, Tab, Panel }
export const AIImageSection = {
  name: "ai-image",
  Tab: (props: { active: boolean }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        padding: "6px 4px",
        color: props.active ? "#D6A84F" : "inherit",
        opacity: props.active ? 1 : 0.7,
        fontSize: "10px",
        cursor: "pointer",
      }}
    >
      <Sparkles style={{ width: 20, height: 20 }} />
      <span>AI</span>
    </div>
  ),
  Panel: ({ store }: { store: StoreType }) => <AIImagePanel store={store} />,
};
