import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  Crown,
  ListOrdered,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API = import.meta.env.VITE_API_BASE_URL ?? "";

interface VideoJob {
  job: {
    id: number;
    status: string;
    priority: string;
    fieldValues: Record<string, string>;
    outputUrl: string | null;
    errorMessage: string | null;
    pricePaid: number | null;
    progressPct: number;
    queuePosition: number | null;
    isRendering: boolean;
    estimatedCompletionAt: string | null;
    renderStartedAt: string | null;
    renderCompletedAt: string | null;
    createdAt: string;
  };
  template: {
    title: string;
    slug: string;
    tier: string;
    previewImageUrl: string | null;
    fields: { id: string; label: string }[];
  };
}

// ── ETA countdown hook ──────────────────────────────────────────────────────
function useEtaCountdown(estimatedAt: string | null): string {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!estimatedAt) { setLabel(""); return; }
    const update = () => {
      const diffMs = new Date(estimatedAt).getTime() - Date.now();
      if (diffMs <= 0) { setLabel("כמעט מוכן..."); return; }
      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      setLabel(mins > 0 ? `~${mins} דקות` : `~${secs} שניות`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [estimatedAt]);
  return label;
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full bg-[#0B1833]/10 rounded-full h-1.5 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-l from-[#D6A84F] to-[#D6A84F]/60 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(4, pct)}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: {
    label: "ממתין לתשלום",
    color: "bg-yellow-50 text-yellow-700 border-yellow-300",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  queued: {
    label: "בתור עיבוד",
    color: "bg-blue-50 text-blue-700 border-blue-300",
    icon: <ListOrdered className="w-3.5 h-3.5" />,
  },
  paid: {
    label: "בתור עיבוד",
    color: "bg-blue-50 text-blue-700 border-blue-300",
    icon: <ListOrdered className="w-3.5 h-3.5" />,
  },
  rendering: {
    label: "מייצר סרטון",
    color: "bg-purple-50 text-purple-700 border-purple-300",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  ready: {
    label: "מוכן להורדה",
    color: "bg-green-50 text-green-700 border-green-300",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  failed: {
    label: "שגיאה בעיבוד",
    color: "bg-red-50 text-red-700 border-red-300",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const isActiveStatus = (s: string) => ["queued", "paid", "rendering"].includes(s);

// ── Job card ─────────────────────────────────────────────────────────────────
function JobCard({ row }: { row: VideoJob }) {
  const { job, template } = row;
  const st = STATUS_MAP[job.status] ?? STATUS_MAP.rendering;
  const isPremium = job.priority === "premium" || template.tier === "premium";
  const isActive = isActiveStatus(job.status);
  const isRendering = job.status === "rendering";
  const pct = job.progressPct ?? 0;
  const eta = useEtaCountdown(isActive ? job.estimatedCompletionAt : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#D6A84F]/20 shadow-sm overflow-hidden"
      dir="rtl"
    >
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-28 sm:w-36 bg-[#0B1833] flex-shrink-0 flex items-center justify-center relative">
          {template.previewImageUrl ? (
            <img
              src={`${API}${template.previewImageUrl}`}
              alt={template.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Film className="w-8 h-8 text-[#D6A84F]/40" />
          )}
          {isPremium && (
            <div className="absolute top-2 right-2 bg-[#D6A84F] rounded-full p-0.5">
              <Crown className="w-3 h-3 text-[#0B1833]" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-[#0B1833] leading-tight">{template.title}</h3>
            <span
              className={`inline-flex items-center gap-1 text-xs border rounded-full px-2.5 py-0.5 font-medium shrink-0 ${st.color}`}
            >
              {st.icon}
              {st.label}
            </span>
          </div>

          {/* Field values */}
          <div className="text-sm text-gray-500 space-y-0.5">
            {template.fields.slice(0, 3).map((f) => {
              const val = job.fieldValues[f.id];
              if (!val) return null;
              return (
                <p key={f.id} className="truncate">
                  <span className="text-gray-400">{f.label}:</span>{" "}
                  <span className="text-[#0B1833]">{val}</span>
                </p>
              );
            })}
          </div>

          {/* Date */}
          <p className="text-xs text-gray-400">
            {new Date(job.createdAt).toLocaleDateString("he-IL", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>

          {/* Error */}
          {job.status === "failed" && job.errorMessage && (
            <p className="text-xs text-red-500 leading-relaxed">{job.errorMessage}</p>
          )}
        </div>
      </div>

      {/* Progress section — shown when queued or rendering */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#D6A84F]/10"
          >
            <div className="px-4 py-3 bg-[#F8F1E3]/50 space-y-2">
              {/* Queue position */}
              {job.queuePosition !== null && job.status !== "rendering" && (
                <div className="flex items-center justify-between text-xs text-[#0B1833]/60">
                  <span className="flex items-center gap-1">
                    <ListOrdered className="w-3 h-3" />
                    מיקום בתור: <strong className="text-[#0B1833]">#{job.queuePosition}</strong>
                  </span>
                  {isPremium && (
                    <span className="flex items-center gap-1 text-[#D6A84F] font-medium">
                      <Crown className="w-3 h-3" />
                      עדיפות פרמיום
                    </span>
                  )}
                </div>
              )}

              {/* Progress bar (only during rendering) */}
              {isRendering && <ProgressBar pct={pct} />}

              {/* Status text + ETA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-purple-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>
                    {isRendering
                      ? `מעבד... ${pct > 0 ? `${pct}%` : ""}`
                      : "ממתין לתורו בתור..."}
                  </span>
                </div>
                {eta && (
                  <span className="text-xs text-[#0B1833]/50 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {eta}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download button */}
      {job.status === "ready" && job.outputUrl && (
        <div className="px-4 py-3 border-t border-[#D6A84F]/10">
          <a
            href={`${API}/api/hadar/video-jobs/${job.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="sm"
              className="bg-[#D6A84F] hover:bg-[#D6A84F]/90 text-[#0B1833] font-bold rounded-full gap-1.5"
            >
              <Download className="w-4 h-4" />
              הורדת הסרטון
            </Button>
          </a>
        </div>
      )}
    </motion.div>
  );
}

// ── Notification toast for newly ready jobs ──────────────────────────────────
function ReadyToast({ title, onClose }: { title: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-6 right-6 bg-[#0B1833] text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-3 z-50 max-w-sm"
      dir="rtl"
    >
      <Bell className="w-5 h-5 text-[#D6A84F] shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-sm">הסרטון מוכן!</p>
        <p className="text-xs text-white/60 truncate">{title}</p>
      </div>
      <button onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none">×</button>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyVideos() {
  const { isSignedIn, isLoaded } = useAuth();
  const [, navigate] = useLocation();
  const [readyToast, setReadyToast] = useState<{ id: number; title: string } | null>(null);
  const prevStatusRef = useRef<Record<number, string>>({});

  const { data: jobs, isLoading, isError, refetch } = useQuery<VideoJob[]>({
    queryKey: ["my-video-jobs"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/hadar/video-jobs`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: !!isSignedIn,
    refetchInterval: (query) => {
      const data = query.state.data as VideoJob[] | undefined;
      const hasActive = data?.some(r => isActiveStatus(r.job.status));
      return hasActive ? 4000 : false;
    },
  });

  // Detect newly-ready jobs and show toast
  useEffect(() => {
    if (!jobs) return;
    for (const { job, template } of jobs) {
      const prev = prevStatusRef.current[job.id];
      if (prev && prev !== "ready" && job.status === "ready") {
        setReadyToast({ id: job.id, title: template.title });
      }
      prevStatusRef.current[job.id] = job.status;
    }
  }, [jobs]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate("/sign-in");
  }, [isLoaded, isSignedIn]);

  const hasActive = jobs?.some(r => isActiveStatus(r.job.status));

  return (
    <div className="min-h-screen bg-[#F8F1E3]" dir="rtl">
      {/* Header */}
      <div className="bg-[#0B1833] text-white px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Film className="w-8 h-8 text-[#D6A84F]" />
          <div>
            <h1 className="text-2xl font-bold">הסרטונים שלי</h1>
            <p className="text-[#D6A84F]/70 text-sm">הורידו את הסרטונים שהזמנתם</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Nav + actions */}
        <div className="flex items-center justify-between">
          <Link href="/video">
            <button className="flex items-center gap-1 text-[#0B1833]/60 hover:text-[#0B1833] text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" />
              גלריית וידאו
            </button>
          </Link>
          <div className="flex items-center gap-2">
            {hasActive && (
              <span className="text-xs text-purple-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                עדכון אוטומטי
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-[#0B1833]/60 hover:text-[#0B1833]"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4" />
              רענן
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#D6A84F]" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center py-16 gap-3">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <p className="text-red-600">שגיאה בטעינת הסרטונים</p>
            <Button variant="outline" onClick={() => refetch()}>נסה שוב</Button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && jobs?.length === 0 && (
          <div className="flex flex-col items-center py-24 gap-4">
            <Film className="w-16 h-16 text-[#D6A84F]/30" />
            <p className="text-[#0B1833]/50 text-lg">עדיין לא הזמנתם סרטונים</p>
            <Link href="/video">
              <Button className="bg-[#0B1833] hover:bg-[#0B1833]/80 text-[#D6A84F]">
                לגלריית הסרטונים
              </Button>
            </Link>
          </div>
        )}

        {/* Jobs list */}
        {!isLoading && !isError && jobs && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((row) => (
              <JobCard key={row.job.id} row={row} />
            ))}
          </div>
        )}

        {/* Legend */}
        {jobs && jobs.length > 0 && (
          <p className="text-center text-xs text-[#0B1833]/30 pt-4">
            * עדכון אוטומטי כל 4 שניות בזמן עיבוד סרטון
          </p>
        )}
      </div>

      {/* Ready toast */}
      <AnimatePresence>
        {readyToast && (
          <ReadyToast
            key={readyToast.id}
            title={readyToast.title}
            onClose={() => setReadyToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
