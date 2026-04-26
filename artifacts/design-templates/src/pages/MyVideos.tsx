import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Film,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API = import.meta.env.VITE_API_BASE_URL ?? "";

interface VideoJob {
  job: {
    id: number;
    status: string;
    fieldValues: Record<string, string>;
    outputUrl: string | null;
    errorMessage: string | null;
    pricePaid: number | null;
    createdAt: string;
  };
  template: {
    title: string;
    slug: string;
    previewImageUrl: string | null;
    fields: { id: string; label: string }[];
  };
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: {
    label: "ממתין לתשלום",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  paid: {
    label: "תשלום אושר",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  rendering: {
    label: "מייצר סרטון...",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
  },
  ready: {
    label: "מוכן להורדה",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  failed: {
    label: "שגיאה בעיבוד",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

function JobCard({ row }: { row: VideoJob }) {
  const { job, template } = row;
  const status = STATUS_MAP[job.status] ?? STATUS_MAP.rendering;
  const isProcessing = job.status === "paid" || job.status === "rendering";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#D6A84F]/20 shadow-sm overflow-hidden flex gap-0"
      dir="rtl"
    >
      {/* Thumbnail */}
      <div className="w-28 sm:w-36 bg-[#0B1833] flex-shrink-0 flex items-center justify-center">
        {template.previewImageUrl ? (
          <img
            src={`${API}${template.previewImageUrl}`}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Film className="w-8 h-8 text-[#D6A84F]/40" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <h3 className="font-bold text-[#0B1833]">{template.title}</h3>
          <span
            className={`inline-flex items-center gap-1 text-xs border rounded-full px-2.5 py-0.5 font-medium ${status.color}`}
          >
            {status.icon}
            {status.label}
          </span>
        </div>

        {/* Field values summary */}
        <div className="text-sm text-gray-500 space-y-0.5">
          {template.fields.slice(0, 3).map((f) => {
            const val = job.fieldValues[f.id];
            if (!val) return null;
            return (
              <p key={f.id}>
                <span className="text-gray-400">{f.label}: </span>
                <span className="text-[#0B1833]">{val}</span>
              </p>
            );
          })}
        </div>

        {/* Date */}
        <p className="text-xs text-gray-400">
          הוזמן:{" "}
          {new Date(job.createdAt).toLocaleDateString("he-IL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {/* Error */}
        {job.status === "failed" && job.errorMessage && (
          <p className="text-xs text-red-500">{job.errorMessage}</p>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-purple-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>הסרטון שלכם בהכנה — רענון אוטומטי</span>
          </div>
        )}

        {/* Download button */}
        {job.status === "ready" && job.outputUrl && (
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
        )}
      </div>
    </motion.div>
  );
}

export default function MyVideos() {
  const { isSignedIn, isLoaded } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

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
      const hasProcessing = data?.some(
        (r) => r.job.status === "paid" || r.job.status === "rendering"
      );
      return hasProcessing ? 5000 : false;
    },
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate("/sign-in");
  }, [isLoaded, isSignedIn]);

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
        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link href="/video">
            <button className="flex items-center gap-1 text-[#0B1833]/60 hover:text-[#0B1833] text-sm transition-colors">
              <ChevronLeft className="w-4 h-4" />
              גלריית וידאו
            </button>
          </Link>
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

        {/* Jobs */}
        {!isLoading && !isError && jobs && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((row) => (
              <JobCard key={row.job.id} row={row} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
