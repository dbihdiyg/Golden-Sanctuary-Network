import { useState, useEffect } from "react";
import { Play, Loader2 } from "lucide-react";
import VideoModal from "@/components/VideoModal";
import ShareButton from "@/components/ShareButton";

interface Video {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  published: string;
}

export const VIDEO_CATEGORIES = [
  { key: "הכל", label: "הכל" },
  { key: "שיעורים", label: "שיעורים" },
  { key: "מפגשים", label: "מפגשים" },
  { key: "ברכות", label: "ברכות" },
  { key: "דברי פתיחה", label: "דברי פתיחה" },
  { key: "סיפורי בוגרים", label: "סיפורי בוגרים" },
  { key: "כללי", label: "כללי" },
];

const FALLBACK: Video[] = [
  {
    id: "CaLgv1ZKfeA",
    title: "שיעור / אירוע מגדל אור — חדש",
    category: "שיעורים",
    thumbnail: "https://img.youtube.com/vi/CaLgv1ZKfeA/maxresdefault.jpg",
    published: "",
  },
  {
    id: "hzMacELExrU",
    title: "שיעור / אירוע מגדל אור",
    category: "שיעורים",
    thumbnail: "https://img.youtube.com/vi/hzMacELExrU/maxresdefault.jpg",
    published: "",
  },
];

const SHORTS_IDS = new Set([
  "YyjYaoD_eeM",
  "dw-0tv1JCDY",
  "WJR3UNFD-AA",
  "jtECZkvt_WY",
  "fa2zbBBpJto",
]);

interface Props {
  standalone?: boolean;
}

export default function VideoSection({ standalone = false }: Props) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("הכל");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const cmsRes = await fetch("/api/cms/videos");
        if (cmsRes.ok) {
          const cmsData = await cmsRes.json();
          if (Array.isArray(cmsData) && cmsData.length > 0) {
            const mapped: Video[] = cmsData.map((v: {
              youtubeId: string; title: string; category: string; dateLabel: string;
            }) => ({
              id: v.youtubeId,
              title: v.title,
              category: v.category || "כללי",
              thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
              published: v.dateLabel || "",
            }));
            setVideos(mapped);
            return;
          }
        }
      } catch (_) {}

      try {
        const ytRes = await fetch("/api/youtube");
        const data = await ytRes.json();
        const all: Video[] = data.videos ?? [];
        const filtered = all.filter((v) => !SHORTS_IDS.has(v.id));
        if (filtered.length > 0) setVideos(filtered);
      } catch (_) {}
    };

    fetchVideos().finally(() => setLoading(false));
  }, []);

  const displayed =
    activeCategory === "הכל"
      ? videos
      : videos.filter((v) => v.category === activeCategory);

  const inner = (
    <div className={standalone ? "relative mx-auto max-w-6xl space-y-10" : "space-y-8"}>
      {standalone && (
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">וידאו</p>
            <h2 className="text-4xl font-black text-white md:text-6xl">קולות מהקהילה</h2>
            <ShareButton sectionId="video" label="קולות מהקהילה" className="mt-1" />
          </div>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            תכנים מצולמים, ברכות, שיעורים וסיפורים שמאפשרים להרגיש קרוב גם מרחוק.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2" dir="rtl">
        {VIDEO_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`rounded-full border px-5 py-1.5 text-sm font-bold transition ${
              activeCategory === cat.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/15 bg-white/5 text-muted-foreground hover:border-primary/40 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
        {loading && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            טוען סרטונים...
          </span>
        )}
      </div>

      {displayed.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          אין סרטונים בקטגוריה זו כרגע.
        </p>
      ) : (
        <div className="grid gap-7 md:grid-cols-2">
          {displayed.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setActiveUrl(`https://www.youtube.com/watch?v=${video.id}`)}
              className="group relative min-h-[240px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-card text-right shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition duration-500 hover:-translate-y-2 hover:border-primary/50 reveal-up md:min-h-[390px]"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-blue-brand/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/50 bg-primary/15 text-primary shadow-[0_0_55px_rgba(245,192,55,0.32)] backdrop-blur-md transition duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <span className="absolute inset-[-10px] animate-ping rounded-full border border-primary/15" />
                  <Play className="mr-1 h-9 w-9 fill-current" />
                </span>
              </div>
              <div className="absolute bottom-0 right-0 left-0 space-y-3 p-7">
                <span className="inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-white/70 backdrop-blur">
                  {video.category}
                </span>
                <h3 className="font-serif text-2xl font-bold leading-snug text-white">
                  {video.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (!standalone) {
    return (
      <>
        {activeUrl && <VideoModal url={activeUrl} onClose={() => setActiveUrl(null)} />}
        {inner}
      </>
    );
  }

  return (
    <>
      {activeUrl && <VideoModal url={activeUrl} onClose={() => setActiveUrl(null)} />}
      <section
        className="relative overflow-hidden px-4 py-12 md:px-6 md:py-24"
        id="video"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(245,192,55,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(0,19,164,0.28),transparent_28%)]" />
        {inner}
      </section>
    </>
  );
}
