import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Play, Film, ChevronLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL ?? "";

interface VideoTemplate {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  price: number;
  previewVideoUrl: string | null;
  previewImageUrl: string | null;
  videoDuration: number | null;
  renderType: "ffmpeg" | "aefx";
  fields: { id: string; label: string }[];
}

interface RenderConfig {
  nexrenderConfigured: boolean;
}

function formatPrice(agorot: number) {
  return `₪${(agorot / 100).toFixed(0)}`;
}

function TemplateCard({ t, nexrenderConfigured }: { t: VideoTemplate; nexrenderConfigured: boolean }) {
  const isAe = t.renderType === "aefx";
  const aeBlocked = isAe && !nexrenderConfigured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: aeBlocked ? 0 : -4 }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-2xl overflow-hidden bg-white border shadow-md transition-shadow ${aeBlocked ? "border-amber-200 opacity-80" : "border-[#D6A84F]/20 hover:shadow-xl"}`}
      dir="rtl"
    >
      {/* Thumbnail / Preview */}
      <div className="relative aspect-video bg-[#0B1833] overflow-hidden">
        {t.previewVideoUrl ? (
          <video
            src={`${API}${t.previewVideoUrl}`}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : t.previewImageUrl ? (
          <img
            src={`${API}${t.previewImageUrl}`}
            alt={t.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-16 h-16 text-[#D6A84F]/40" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1833]/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-[#D6A84F] rounded-full p-4">
            <Play className="w-6 h-6 text-[#0B1833] fill-[#0B1833]" />
          </div>
        </div>
        {/* Duration badge */}
        {t.videoDuration && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {t.videoDuration}″
          </span>
        )}
        {/* AE badge */}
        {isAe && (
          <span className="absolute top-2 right-2 bg-purple-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Premium AE
          </span>
        )}
        {/* Blocked overlay */}
        {aeBlocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              בקרוב
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {t.category && (
            <Badge
              variant="outline"
              className="text-xs border-[#D6A84F]/50 text-[#D6A84F] bg-[#D6A84F]/10"
            >
              {t.category}
            </Badge>
          )}
        </div>
        <h3 className="font-bold text-[#0B1833] text-lg leading-tight">{t.title}</h3>
        {t.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{t.description}</p>
        )}
        {aeBlocked && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            תבנית Premium — בקרוב
          </p>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[#D6A84F] font-bold text-xl">{formatPrice(t.price)}</span>
          {aeBlocked ? (
            <Button
              size="sm"
              disabled
              className="bg-gray-200 text-gray-400 font-semibold rounded-full px-4 cursor-not-allowed"
            >
              בקרוב
            </Button>
          ) : (
            <Link href={`/video/${t.slug}`}>
              <Button
                size="sm"
                className="bg-[#0B1833] hover:bg-[#0B1833]/80 text-[#D6A84F] font-semibold rounded-full px-4"
              >
                התאמה אישית
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function VideoGallery() {
  const { data: templates, isLoading, isError } = useQuery<VideoTemplate[]>({
    queryKey: ["video-templates"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/hadar/video-templates`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
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

  const nexrenderConfigured = renderConfig?.nexrenderConfigured ?? true;

  return (
    <div className="min-h-screen bg-[#F8F1E3]" dir="rtl">
      {/* Hero */}
      <div className="bg-[#0B1833] text-white py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Film className="w-12 h-12 text-[#D6A84F] mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">תבניות וידאו</h1>
          <p className="text-[#D6A84F]/80 text-lg">
            הזמינו סרטון מותאם אישית לאירוע שלכם
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Nav back */}
        <Link href="/">
          <button className="flex items-center gap-1 text-[#0B1833]/60 hover:text-[#0B1833] text-sm mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            חזרה לדף הראשי
          </button>
        </Link>

        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#D6A84F]" />
          </div>
        )}
        {isError && (
          <p className="text-center text-red-600 py-16">שגיאה בטעינת תבניות. נסו שוב.</p>
        )}
        {!isLoading && !isError && templates?.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <Film className="w-16 h-16 text-[#D6A84F]/30 mx-auto" />
            <p className="text-[#0B1833]/50 text-lg">עדיין אין תבניות וידאו זמינות.</p>
          </div>
        )}
        {!isLoading && !isError && templates && templates.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard key={t.id} t={t} nexrenderConfigured={nexrenderConfigured} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
