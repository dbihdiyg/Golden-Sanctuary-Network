import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, Link, useLocation, useSearch } from "wouter";
import { useAuth, useUser, SignInButton } from "@clerk/react";
import { ArrowRight, Crown, MessageCircle, Download, RotateCcw, CheckCircle2, ZoomIn, ZoomOut, Sun, Moon, Lock, Loader2, User, CreditCard, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { templates, TextSlot } from "@/lib/data";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";

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

function StackedLine({ slot, value }: { slot: TextSlot; value: string }) {
  if (!value.trim()) return null;
  const sz = previewFontSizePx[slot.fontSize || "sm"];
  return (
    <div className="text-center leading-snug my-0.5 whitespace-pre-line" style={{
      fontSize: sz,
      fontFamily: slot.fontFamily === "serif" ? "'Noto Serif Hebrew', serif" : "'Heebo', sans-serif",
      fontWeight: slot.bold ? 700 : 400,
      fontStyle: slot.italic ? "italic" : "normal",
      color: resolveColor(slot.color),
      lineHeight: slot.lineHeight ?? 1.35,
    }}>
      {value}
    </div>
  );
}

function AbsoluteSlot({ slot, value }: { slot: TextSlot; value: string }) {
  if (!value.trim() || slot.x == null || slot.y == null) return null;
  const sz = previewFontSizePx[slot.fontSize || "sm"];
  const w = slot.width ?? 80;
  return (
    <div style={{
      position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, width: `${w}%`,
      transform: "translateX(-50%)", fontSize: sz,
      fontFamily: slot.fontFamily === "serif" ? "'Noto Serif Hebrew', serif" : "'Heebo', sans-serif",
      fontWeight: slot.bold ? 700 : 400, fontStyle: slot.italic ? "italic" : "normal",
      color: resolveColor(slot.color), textAlign: slot.align ?? "center",
      lineHeight: slot.lineHeight ?? 1.35, whiteSpace: "pre-line", direction: "rtl", pointerEvents: "none",
    }}>
      {value}
    </div>
  );
}

function InvitationPreview({ template, values, zoom }: {
  template: typeof templates[0]; values: Record<string, string>; zoom: number;
}) {
  const slots = template.slots || [];
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
          {slots.map(slot => <AbsoluteSlot key={slot.id} slot={slot} value={values[slot.id] ?? slot.defaultValue} />)}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 py-10 gap-0.5 overflow-hidden" dir="rtl">
          <div className="w-24 h-px bg-[#D6A84F]/50 mb-2" />
          {slots.map(slot => <StackedLine key={slot.id} slot={slot} value={values[slot.id] ?? slot.defaultValue} />)}
          <div className="w-24 h-px bg-[#D6A84F]/50 mt-2" />
        </div>
      )}
      <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1 opacity-30 pointer-events-none">
        <Crown className="w-2.5 h-2.5 text-[#D6A84F]" />
        <span className="text-[9px] font-serif text-[#D6A84F] tracking-widest">הדר</span>
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
  const previewRef = useRef<HTMLDivElement>(null);

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
          setValues(data.fieldValues || initValues());
          setDesignName(data.designName || "עיצוב שלי");
          if (data.status === "paid") setPaySuccess(true);
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

  const handleAutoSave = async (): Promise<number | null> => {
    if (!isSignedIn || !template) return null;
    setSaving(true);
    try {
      const token = await getToken();
      if (designId) {
        await fetch(`${API_BASE}/api/hadar/designs/${designId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fieldValues: values, designName }),
        });
        return designId;
      } else {
        const res = await fetch(`${API_BASE}/api/hadar/designs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ templateId: template.id, fieldValues: values, designName }),
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

          <Link href="/" className="relative shrink-0">
            <Crown className="w-3.5 h-3.5 text-primary absolute -top-3 left-1/2 -translate-x-1/2" />
            <span className="font-serif font-bold text-xl text-foreground">הדר</span>
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
              <p className="font-semibold text-sm text-foreground">עריכת טקסטים</p>
              <p className="text-xs text-muted-foreground">{slots.length} שדות לעריכה</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
              ₪{template.price}
            </span>
          </div>

          {/* Steps guide */}
          <div className="px-5 py-3 border-b border-primary/10 bg-primary/5">
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {[
                { n: "1", label: "ערכו טקסטים", done: true },
                { n: "2", label: "שמרו", done: isSignedIn && saved },
                { n: "3", label: "תשלום", done: paySuccess },
                { n: "4", label: "קבצי עיצוב", done: false },
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
            <InvitationPreview template={template} values={values} zoom={zoom} />
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
