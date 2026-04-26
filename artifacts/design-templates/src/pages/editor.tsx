import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link, useLocation, useSearch } from "wouter";
import { useAuth, useClerk } from "@clerk/react";
import { createStore } from "polotno/model/store";
import { Workspace } from "polotno/canvas/workspace";
import { SidePanel, TextSection, ElementsSection, BackgroundSection, LayersSection } from "polotno/side-panel";
import { Toolbar } from "polotno/toolbar";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import type { StoreType } from "polotno/model/store";
import "polotno/polotno.blueprint.css";
import "@/styles/polotno-rtl.css";

import {
  ArrowRight, Crown, Download, CheckCircle2, Loader2, Save, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HEBREW_FONTS, loadGoogleFont, injectCustomFont } from "@/lib/fonts";
import hadarLogo from "@/assets/logo-hadar.png";
import { Template } from "@/lib/data";
import { AIImageSection } from "@/components/ai-image-section";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const POLOTNO_KEY = import.meta.env.VITE_POLOTNO_KEY ?? "";

// ── Font list for Polotno ─────────────────────────────────────────────────────
// Polotno addFont expects { fontFamily, url }. For Google Fonts we pass the
// CSS URL — Polotno knows how to extract the actual woff2 from it.

function getGoogleFontUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
}

interface PolotnoFont { fontFamily: string; url: string; }

// Only register LOCAL fonts (BA fonts with actual file URLs) with Polotno.
// Google Fonts are already loaded by the browser via <link> tags at runtime.
const POLOTNO_LOCAL_FONTS: PolotnoFont[] = HEBREW_FONTS
  .filter(f => f.file || f.fileUrl)
  .map(f => {
    if (f.file) return { fontFamily: f.family, url: `${basePath}/fonts/${f.file}` };
    const u = f.fileUrl!;
    return { fontFamily: f.family, url: u.startsWith("/api") ? API_BASE + u : u };
  });

// All font families for the font picker (both local and Google)
const ALL_FONT_FAMILIES = HEBREW_FONTS.map(f => f.family);

// ── Build a blank Polotno JSON from a template ────────────────────────────────
function buildDefaultJson(template: Template): object {
  const w = template.dimensions?.width ?? 800;
  const h = template.dimensions?.height ?? 1100;

  const children: object[] = [];

  // Background image layer
  if (template.image) {
    children.push({
      id: "bg-image",
      type: "image",
      src: template.image,
      x: 0,
      y: 0,
      width: w,
      height: h,
      locked: true,
      selectable: false,
      name: "תמונת רקע",
    });
  }

  // Pre-populate text slots from the template
  const slots = (template.slots ?? []).filter(
    s =>
      !["__elements","__slotStyles","__logoPos","__slotPositions","__userSlots","__lockedSlots"].includes(s.id)
  );

  slots.forEach((slot, i) => {
    const slotW = Math.round(w * ((slot.width ?? 80) / 100));
    const cx = Math.round(w * ((slot.x ?? 50) / 100));
    const cy = Math.round(h * ((slot.y ?? (15 + i * 10)) / 100));
    const x = cx - Math.round(slotW / 2);

    const fontSizePx = slot.fontSizePx ?? sizeEnum(slot.fontSize);
    const fillColor = resolveColor(slot.color);
    const fontFamily = resolveFontFamily(slot.fontFamily);

    children.push({
      id: slot.id,
      type: "text",
      text: slot.defaultValue ?? slot.placeholder ?? "",
      x,
      y: cy,
      width: slotW,
      height: fontSizePx * 2,
      fontSize: fontSizePx,
      fontFamily,
      fontWeight: slot.bold ? "bold" : "normal",
      fontStyle: slot.italic ? "italic" : "normal",
      fill: fillColor,
      align: slot.align === "right" ? "right" : slot.align === "left" ? "left" : "center",
      direction: "rtl",
      name: slot.label || `שדה ${i + 1}`,
      selectable: !slot.fixed,
      removable: !slot.fixed,
      contentEditable: !slot.fixed,
      styleEditable: !slot.fixed,
    });
  });

  return {
    width: w,
    height: h,
    pages: [
      {
        id: "page-1",
        children,
        background: template.dimensions ? "transparent" : "#0B1833",
      },
    ],
    fonts: POLOTNO_LOCAL_FONTS.map(f => ({ fontFamily: f.fontFamily, url: f.url })),
    unit: "px",
    dpi: 72,
  };
}

function sizeEnum(size?: string): number {
  const map: Record<string, number> = { xs: 12, sm: 16, md: 20, lg: 28, xl: 38, "2xl": 52 };
  return map[size ?? "md"] ?? 20;
}

function resolveColor(color?: string): string {
  if (!color) return "#F8F1E3";
  if (color.startsWith("#") || color.startsWith("rgb")) return color;
  const named: Record<string, string> = {
    gold: "#D6A84F", white: "#FFFFFF", dark: "#0B1833", cream: "#F8F1E3",
  };
  return named[color] ?? "#F8F1E3";
}

function resolveFontFamily(ff?: string): string {
  if (!ff || ff === "serif") return "Frank Ruhl Libre";
  if (ff === "sans") return "Heebo";
  return ff;
}

// ── Singleton store (one per tab lifecycle) ───────────────────────────────────
let _store: StoreType | null = null;
function getStore(): StoreType {
  if (!_store) {
    _store = createStore({ key: POLOTNO_KEY, showCredit: !POLOTNO_KEY });
    _store.setUnit({ unit: "px", dpi: 72 });

    // Register local BA fonts with the store (Google Fonts load via CSS)
    POLOTNO_LOCAL_FONTS.forEach(f => {
      try { _store!.addFont({ fontFamily: f.fontFamily, url: f.url }); } catch {}
    });
    // Load Google Fonts via CSS link tags
    HEBREW_FONTS.filter(f => !f.file && !f.fileUrl).forEach(f => {
      loadGoogleFont(f.family);
    });
  }
  return _store;
}

// ── Main Editor component ─────────────────────────────────────────────────────
export default function PolotnoEditor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const designIdParam = searchParams.get("design");
  const paymentStatus = searchParams.get("payment");

  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { redirectToSignIn } = useClerk();

  const [template, setTemplate] = useState<Template | "loading" | null>("loading");
  const [designId, setDesignId] = useState<number | null>(
    designIdParam ? Number(designIdParam) : null
  );
  const [designName, setDesignName] = useState("עיצוב שלי");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [storeReady, setStoreReady] = useState(false);

  const store = getStore();

  // ── Load custom fonts from API ──────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/hadar/public-fonts`)
      .then(r => r.json())
      .then((fonts: { name: string; displayName: string; fileUrl: string; mimeType: string }[]) => {
        if (!Array.isArray(fonts)) return;
        fonts.forEach(f => {
          injectCustomFont({ id: 0, name: f.name, displayName: f.displayName, fileUrl: f.fileUrl, mimeType: f.mimeType, isActive: true });
          try {
            const url = f.fileUrl.startsWith("/api") ? API_BASE + f.fileUrl : f.fileUrl;
            store.addFont({ fontFamily: f.displayName || f.name, url });
          } catch {}
        });
      })
      .catch(() => {});
  }, []);

  // ── Load template ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/hadar/public-templates`)
      .then(r => r.json())
      .then((list: any[]) => {
        const found = list.find((t: any) => String(t.id) === id);
        if (!found) { setTemplate(null); return; }
        setTemplate({
          id: String(found.id),
          slug: found.slug,
          title: found.title,
          subtitle: found.subtitle ?? "",
          category: found.category ?? "",
          style: found.style ?? "",
          price: found.price ?? 4900,
          image: found.imageUrl
            ? `${API_BASE}/api/hadar/media/hadar-templates/${found.imageUrl.split("/").pop()}`
            : "",
          slots: found.slots ?? [],
          galleryImageUrl: found.galleryImageUrl,
          displayImageUrl: found.displayImageUrl,
          dimensions: found.dimensions,
        });
      })
      .catch(() => setTemplate(null));
  }, [id]);

  // ── Load design or init canvas when template ready ─────────────────────────
  useEffect(() => {
    if (!template || template === "loading") return;

    const load = async () => {
      if (designId && isSignedIn) {
        try {
          const token = await getToken();
          const res = await fetch(`${API_BASE}/api/hadar/designs/${designId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const fv = data.fieldValues ?? {};
            setDesignName(data.designName ?? "עיצוב שלי");

            // Check if paid
            if (data.status === "paid") setPaySuccess(true);

            // Load Polotno JSON if it exists in fieldValues
            if (fv.__polotnoJson) {
              try {
                const json = typeof fv.__polotnoJson === "string"
                  ? JSON.parse(fv.__polotnoJson)
                  : fv.__polotnoJson;
                store.loadJSON(json);
                setStoreReady(true);
                return;
              } catch (e) {
                console.warn("[HADAR] Failed to parse saved Polotno JSON, starting fresh", e);
              }
            }
          }
        } catch (e) {
          console.error("[HADAR] Failed to load design", e);
        }
      }

      // Fresh start — build from template
      const json = buildDefaultJson(template);
      store.loadJSON(json);
      setStoreReady(true);
    };

    load();
  }, [template, designId, isSignedIn]);

  // ── Handle payment return ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    if (paymentStatus === "cancelled") {
      setPayError("התשלום בוטל — הטיוטה שמורה, ניתן לנסות שנית");
    } else if (paymentStatus === "success") {
      const sessionId = searchParams.get("session_id");
      if (!sessionId || !isSignedIn) return;
      const verify = async () => {
        setVerifying(true);
        try {
          const token = await getToken();
          const res = await fetch(`${API_BASE}/api/hadar/checkout/verify?session_id=${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.status === "paid") {
            setPaySuccess(true);
            setPayError(null);
          } else if (res.ok && data.status === "unpaid") {
            setTimeout(async () => {
              try {
                const r2 = await fetch(`${API_BASE}/api/hadar/checkout/verify?session_id=${sessionId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const d2 = await r2.json().catch(() => ({}));
                if (r2.ok && d2.status === "paid") { setPaySuccess(true); setPayError(null); }
                else setPayError("התשלום לא אושר — פנו לתמיכה");
              } catch { setPayError("שגיאת רשת — רעננו את הדף"); }
              finally { setVerifying(false); }
            }, 3000);
            return;
          } else {
            setPayError(`שגיאה: ${data.error ?? res.status}`);
          }
        } catch { setPayError("שגיאת רשת — נסו שנית"); }
        finally { setVerifying(false); }
      };
      verify();
    }
  }, [paymentStatus, isSignedIn, isLoaded]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (): Promise<number | null> => {
    if (!isSignedIn || !template || template === "loading") {
      if (!isSignedIn) redirectToSignIn({ redirectUrl: `${basePath}/editor/${id}` });
      return null;
    }
    setSaving(true);
    try {
      const json = store.toJSON();
      const fv = { __polotnoJson: json };
      const token = await getToken();
      if (designId) {
        await fetch(`${API_BASE}/api/hadar/designs/${designId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fieldValues: fv, designName }),
        });
        setSaved(true);
        return designId;
      } else {
        const res = await fetch(`${API_BASE}/api/hadar/designs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ templateId: id, fieldValues: fv, designName }),
        });
        const data = await res.json();
        setDesignId(data.id);
        setSaved(true);
        navigate(`${basePath}/editor/${id}?design=${data.id}`, { replace: true });
        return data.id;
      }
    } catch (e) { console.error("[HADAR] save failed", e); return null; }
    finally { setSaving(false); }
  }, [isSignedIn, template, store, designId, designName, id]);

  // ── Checkout ────────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (paySuccess) { handleDownload(); return; }
    if (!isSignedIn) {
      redirectToSignIn({ redirectUrl: `${basePath}/editor/${id}` });
      return;
    }
    const savedId = await handleSave();
    if (!savedId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/hadar/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ designId: savedId, templateId: id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setPayError(`שגיאה: ${data.error ?? "נסה שנית"}`);
    } catch { setPayError("שגיאת רשת"); }
  };

  // ── Download PNG ────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!designId) { setPayError("יש לשמור את העיצוב תחילה"); return; }
    setDownloading(true);
    setPayError(null);
    try {
      const token = await getToken();
      const authRes = await fetch(`${API_BASE}/api/hadar/designs/${designId}/download-auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!authRes.ok) {
        const d = await authRes.json().catch(() => ({}));
        setPayError(authRes.status === 403 ? "ההורדה דורשת תשלום" : `שגיאה: ${d.error ?? authRes.status}`);
        return;
      }
      // Export via Polotno
      await store.saveAsImage({ fileName: `hadar-${designName.replace(/\s+/g, "-")}.png`, mimeType: "image/png", pixelRatio: 3 });
    } catch (e: any) {
      setPayError(`שגיאה בהורדה: ${e?.message ?? "נסו שנית"}`);
    } finally {
      setDownloading(false);
    }
  };

  // ── WhatsApp ────────────────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const msg = `שלום, אני מעוניין בעיצוב הזמנה — ${designName}`;
    window.open(`https://wa.me/972501234567?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const tmpl = template !== "loading" && template !== null ? template : null;
  const price = tmpl ? (tmpl.price / 100).toFixed(0) : "49";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-dvh overflow-hidden" dir="rtl" style={{ fontFamily: "Heebo, sans-serif" }}>

      {/* ── Header ── */}
      <header className="shrink-0 h-12 bg-card border-b border-primary/20 flex items-center px-3 gap-2 z-20">
        <Link href={`${basePath}/template/${id}`}>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs">
            <ArrowRight className="w-3.5 h-3.5" />
            <img src={hadarLogo} alt="הדר" className="h-6 w-auto" />
          </button>
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <input
            value={designName}
            onChange={e => { setDesignName(e.target.value); setSaved(false); }}
            className="bg-transparent text-center text-sm font-bold text-foreground border-none outline-none w-52 truncate"
            dir="rtl"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {verifying && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />מאמת תשלום...
            </span>
          )}
          {payError && (
            <span className="text-xs text-destructive max-w-[200px] truncate">{payError}</span>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className={`gap-1 h-7 px-3 text-xs ${saved ? "bg-green-600 hover:bg-green-700" : ""} text-primary-foreground`}
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            {saving ? "שומר..." : saved ? "נשמר!" : "שמירה"}
          </Button>

          <Button
            size="sm"
            onClick={handleCheckout}
            disabled={downloading}
            className="gap-1.5 h-7 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold"
          >
            {downloading
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : paySuccess
              ? <Download className="w-3.5 h-3.5" />
              : <Crown className="w-3.5 h-3.5" />
            }
            {paySuccess ? "הורד PNG" : `לתשלום — ₪${price}`}
          </Button>

          <button onClick={handleWhatsApp} className="text-muted-foreground hover:text-foreground transition-colors" title="שלח לסטודיו">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Payment success banner */}
      {paySuccess && (
        <div className="shrink-0 bg-green-600 text-white text-center py-1.5 text-xs font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          התשלום הצליח! ניתן להוריד את הקובץ.
          <button onClick={handleDownload} disabled={downloading} className="underline font-bold">הורד עכשיו</button>
        </div>
      )}

      {/* Loading state */}
      {template === "loading" && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      {template === null && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground">התבנית לא נמצאה</p>
          <Link href={`${basePath}/`}>
            <Button variant="outline">חזרה לגלריה</Button>
          </Link>
        </div>
      )}

      {/* ── Polotno Editor ── */}
      {template && template !== "loading" && (
        <div className="flex-1 overflow-hidden" style={{ direction: "ltr" }}>
          <PolotnoContainer style={{ width: "100%", height: "100%" }}>
            <SidePanelWrap>
              <SidePanel
                store={store}
                sections={[TextSection, ElementsSection, BackgroundSection, LayersSection, AIImageSection]}
                defaultSection="text"
              />
            </SidePanelWrap>
            <WorkspaceWrap>
              <Toolbar store={store} downloadButtonEnabled={false} />
              <Workspace
                store={store}
                backgroundColor="#1a2744"
                pageBorderColor="#D6A84F44"
                activePageBorderColor="#D6A84F"
              />
            </WorkspaceWrap>
          </PolotnoContainer>
        </div>
      )}
    </div>
  );
}
