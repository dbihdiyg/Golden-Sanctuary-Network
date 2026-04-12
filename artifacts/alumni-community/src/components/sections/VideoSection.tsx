import { useState } from "react";
import { Play } from "lucide-react";
import VideoModal from "@/components/VideoModal";

const videos = [
  {
    title: "שיעור / אירוע מגדל אור",
    text: "סרטון חדש שהועלה לספריית הקהילה.",
    image: "https://img.youtube.com/vi/TPQ-MDNOLu4/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=TPQ-MDNOLu4",
  },
  {
    title: "דברי פתיחה למפגש הבוגרים",
    text: "מסר קצר על שורשים, אחריות וחיבור מתמשך.",
    image: "/rabbi-mic.jpg",
    url: "https://www.youtube.com/watch?v=azdY5mFGjU0",
  },
];

export default function VideoSection() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  return (
    <>
      {activeUrl && <VideoModal url={activeUrl} onClose={() => setActiveUrl(null)} />}

      <section className="relative overflow-hidden px-4 py-12 md:px-6 md:py-24" id="video">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(245,192,55,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(0,19,164,0.28),transparent_28%)]" />
        <div className="relative mx-auto max-w-6xl space-y-12">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-bold tracking-[0.28em] text-blue-brand">וידאו</p>
              <h2 className="text-4xl font-black text-white md:text-6xl">קולות מהקהילה</h2>
            </div>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              תכנים מצולמים, ברכות, שיעורים וסיפורים שמאפשרים להרגיש קרוב גם מרחוק.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2">
            {videos.map((video, index) => (
              <button
                key={video.title}
                onClick={() => setActiveUrl(video.url)}
                className="group relative min-h-[240px] md:min-h-[390px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-card shadow-[0_30px_90px_rgba(0,0,0,0.45)] transition duration-500 hover:-translate-y-2 hover:border-primary/50 reveal-up text-right"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <img src={video.image} alt={video.title} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-blue-brand/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="relative grid h-24 w-24 place-items-center rounded-full border border-primary/50 bg-primary/15 text-primary shadow-[0_0_55px_rgba(245,192,55,0.32)] backdrop-blur-md transition duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                    <span className="absolute inset-[-10px] rounded-full border border-primary/15 animate-ping" />
                    <Play className="mr-1 h-9 w-9 fill-current" />
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 left-0 space-y-3 p-7">
                  <h3 className="font-serif text-3xl font-bold text-white">{video.title}</h3>
                  <p className="max-w-lg leading-relaxed text-muted-foreground">{video.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
