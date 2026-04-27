import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Film,
  Play,
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API = import.meta.env.VITE_API_BASE_URL ?? "";

interface FieldDef {
  id: string;
  label: string;
  type: "text" | "textarea";
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}

interface OverlayConfig {
  fieldId: string;
  x: number; // 0-100%
  y: number; // 0-100%
  fontSize: number;
  fontColor: string;
  shadowColor?: string;
  align: "left" | "center" | "right";
  startTime: number;
  endTime: number;
}

interface VideoTemplate {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  price: number;
  baseVideoUrl: string | null;
  previewVideoUrl: string | null;
  previewImageUrl: string | null;
  fields: FieldDef[];
  overlays: OverlayConfig[];
  videoDuration: number | null;
  videoWidth: number | null;
  videoHeight: number | null;
  renderType: "ffmpeg" | "aefx";
}

interface RenderConfig {
  nexrenderConfigured: boolean;
}

function formatPrice(agorot: number) {
  return `₪${(agorot / 100).toFixed(0)}`;
}

function OverlayPreview({
  template,
  fieldValues,
}: {
  template: VideoTemplate;
  fieldValues: Record<string, string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const videoUrl = template.previewVideoUrl || template.baseVideoUrl;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-[#0B1833] rounded-xl overflow-hidden"
    >
      {videoUrl ? (
        <video
          key={videoUrl}
          src={`${API}${videoUrl}`}
          className="w-full h-full object-contain"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : template.previewImageUrl ? (
        <img
          src={`${API}${template.previewImageUrl}`}
          alt={template.title}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/30">
          <Film className="w-12 h-12" />
          <span className="text-sm">תצוגה מקדימה</span>
        </div>
      )}

      {/* Text overlays */}
      {containerSize.w > 0 &&
        template.overlays.map((ov) => {
          const value = fieldValues[ov.fieldId];
          if (!value?.trim()) return null;
          const x = (ov.x / 100) * containerSize.w;
          const y = (ov.y / 100) * containerSize.h;
          const scaleFactor = containerSize.w / (template.videoWidth || 1920);
          const fs = (ov.fontSize || 48) * scaleFactor;
          return (
            <div
              key={ov.fieldId}
              style={{
                position: "absolute",
                left: ov.align === "right" ? "auto" : ov.align === "center" ? `${x}px` : `${x}px`,
                right: ov.align === "right" ? `${containerSize.w - x}px` : "auto",
                top: `${y}px`,
                transform: ov.align === "center" ? "translateX(-50%)" : undefined,
                fontSize: `${fs}px`,
                color: ov.fontColor || "#ffffff",
                fontFamily: "NotoSansHebrew, Arial, sans-serif",
                fontWeight: "bold",
                textShadow: `2px 2px 4px ${ov.shadowColor || "rgba(0,0,0,0.8)"}`,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                direction: "rtl",
                lineHeight: 1.2,
              }}
            >
              {value}
            </div>
          );
        })}
    </div>
  );
}

export default function VideoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { isSignedIn, isLoaded } = useAuth();

  const { data: template, isLoading, isError } = useQuery<VideoTemplate>({
    queryKey: ["video-template", slug],
    queryFn: async () => {
      const res = await fetch(`${API}/api/hadar/video-templates/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: renderConfig } = useQuery<RenderConfig>({
    queryKey: ["render-config"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/hadar/render-config`);
      if (!res.ok) return { nexrenderConfigured: false };
      return res.json();
    },
    staleTime: 60_000,
  });

  const isAe = template?.renderType === "aefx";
  const aeBlocked = isAe && !(renderConfig?.nexrenderConfigured ?? true);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Initialize defaults
  useEffect(() => {
    if (template?.fields) {
      const defaults: Record<string, string> = {};
      for (const f of template.fields) {
        if (f.defaultValue) defaults[f.id] = f.defaultValue;
      }
      setFieldValues(defaults);
    }
  }, [template]);

  async function handleCheckout() {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    if (!template) return;

    setSubmittedOnce(true);

    // Validate required fields
    const missing = (template.fields ?? []).filter(
      (f) => f.required && !fieldValues[f.id]?.trim()
    );
    if (missing.length > 0) {
      setError(`נא למלא את השדות הבאים: ${missing.map((f) => f.label).join(", ")}`);
      // Scroll to first missing field
      const firstId = missing[0].id;
      const el = fieldRefs.current[firstId];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/hadar/video-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: slug, fieldValues }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F1E3] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#D6A84F]" />
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="min-h-screen bg-[#F8F1E3] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-[#0B1833] font-semibold">תבנית לא נמצאה</p>
        <Button variant="outline" onClick={() => navigate("/video")}>חזרה לגלריה</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F1E3]" dir="rtl">
      {/* Header */}
      <div className="bg-[#0B1833] text-white px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/video")}
          className="flex items-center gap-1 text-[#D6A84F]/70 hover:text-[#D6A84F] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">גלריית וידאו</span>
        </button>
        <span className="text-white/40">/</span>
        <span className="text-sm font-medium truncate">{template.title}</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <OverlayPreview template={template} fieldValues={fieldValues} />
            <div className="bg-white rounded-xl p-4 border border-[#D6A84F]/20 space-y-2">
              <h2 className="font-bold text-[#0B1833] text-xl">{template.title}</h2>
              {template.category && (
                <span className="inline-block text-xs bg-[#D6A84F]/10 text-[#D6A84F] border border-[#D6A84F]/30 rounded-full px-3 py-0.5">
                  {template.category}
                </span>
              )}
              {template.description && (
                <p className="text-gray-500 text-sm leading-relaxed">{template.description}</p>
              )}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-[#D6A84F]/20 overflow-hidden"
          >
            <div className="bg-[#0B1833] px-6 py-4">
              <h3 className="text-[#D6A84F] font-bold text-lg">מלאו את הפרטים שלכם</h3>
              <p className="text-white/60 text-sm mt-1">הפרטים שתזינו יופיעו בסרטון</p>
            </div>

            <div className="p-6 space-y-5">
              {template.fields.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">אין שדות להזנה לתבנית זו.</p>
              )}

              {template.fields.map((field) => {
                const val = fieldValues[field.id] ?? "";
                const charCount = val.length;
                const maxLen = field.maxLength ?? 0;
                const pct = maxLen > 0 ? charCount / maxLen : 0;
                const hasFieldError = submittedOnce && field.required && !val.trim();
                const isNearLimit = maxLen > 0 && pct >= 0.8;
                const isAtLimit = maxLen > 0 && pct >= 0.95;

                const counterColor = isAtLimit
                  ? "text-red-500 font-semibold"
                  : isNearLimit
                  ? "text-amber-500"
                  : "text-gray-400";

                const borderClass = hasFieldError
                  ? "border-red-400 focus-visible:ring-red-400"
                  : "border-[#D6A84F]/30 focus-visible:ring-[#D6A84F]";

                return (
                  <div
                    key={field.id}
                    className="space-y-1.5"
                    ref={(el) => { fieldRefs.current[field.id] = el; }}
                  >
                    <div className="flex items-center justify-between">
                      <Label className={`font-semibold text-sm ${hasFieldError ? "text-red-500" : "text-[#0B1833]"}`}>
                        {field.label}
                        {field.required && (
                          <span className={`mr-1 ${hasFieldError ? "text-red-500" : "text-red-400"}`}>*</span>
                        )}
                      </Label>
                      {maxLen > 0 && (
                        <motion.span
                          key={charCount}
                          className={`text-xs tabular-nums transition-colors ${counterColor}`}
                          animate={isAtLimit ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.2 }}
                        >
                          {charCount}/{maxLen}
                        </motion.span>
                      )}
                    </div>

                    {field.type === "textarea" ? (
                      <Textarea
                        dir="rtl"
                        placeholder={field.placeholder ?? ""}
                        maxLength={maxLen || undefined}
                        value={val}
                        onChange={(e) => {
                          setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }));
                        }}
                        rows={3}
                        className={`text-right resize-none transition-colors ${borderClass}`}
                      />
                    ) : (
                      <Input
                        dir="rtl"
                        type="text"
                        placeholder={field.placeholder ?? ""}
                        maxLength={maxLen || undefined}
                        value={val}
                        onChange={(e) => {
                          setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }));
                        }}
                        className={`text-right transition-colors ${borderClass}`}
                      />
                    )}

                    <AnimatePresence>
                      {hasFieldError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          שדה חובה — נא להזין {field.label}
                        </motion.p>
                      )}
                      {isAtLimit && !hasFieldError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-500"
                        >
                          הגעתם למגבלת התווים ({maxLen} תווים)
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Alert variant="destructive" className="text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AE unavailable warning */}
              {aeBlocked && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">תבנית Premium — בקרוב</p>
                    <p className="text-xs text-amber-700 mt-0.5">תבנית זו מבוססת After Effects ותהיה זמינה בקרוב. בינתיים תוכלו לבחור תבנית אחרת.</p>
                  </div>
                </div>
              )}

              {/* Price + Checkout */}
              <div className="border-t border-[#D6A84F]/20 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">מחיר לסרטון</span>
                  <span className="text-[#D6A84F] font-bold text-2xl">{formatPrice(template.price)}</span>
                </div>

                {aeBlocked ? (
                  <div className="space-y-2">
                    <Button disabled className="w-full bg-gray-100 text-gray-400 font-bold text-base py-6 rounded-xl cursor-not-allowed">
                      בקרוב
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-[#D6A84F]/30 text-[#0B1833]"
                      onClick={() => navigate("/")}
                    >
                      חזרה לגלריה לבחירת תבנית אחרת
                    </Button>
                  </div>
                ) : !isLoaded ? (
                  <Button disabled className="w-full">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    טוען...
                  </Button>
                ) : !isSignedIn ? (
                  <div className="space-y-2">
                    <Alert className="border-[#D6A84F]/30 bg-[#D6A84F]/5 text-sm">
                      <Lock className="h-4 w-4 text-[#D6A84F]" />
                      <AlertDescription className="text-[#0B1833]">
                        יש להתחבר כדי להמשיך לתשלום
                      </AlertDescription>
                    </Alert>
                    <Button
                      className="w-full bg-[#0B1833] hover:bg-[#0B1833]/80 text-[#D6A84F] font-bold"
                      onClick={() => navigate("/sign-in")}
                    >
                      התחברות / הרשמה
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-[#D6A84F] hover:bg-[#D6A84F]/90 text-[#0B1833] font-bold text-base py-6 rounded-xl"
                    onClick={handleCheckout}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin ml-2" />
                        מעביר לתשלום...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 ml-2 fill-current" />
                        הזמינו את הסרטון — {formatPrice(template.price)}
                      </>
                    )}
                  </Button>
                )}

                {!aeBlocked && (
                  <p className="text-xs text-gray-400 text-center">
                    לאחר התשלום הסרטון יוכן ויישלח לאזור ההורדות שלכם
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
