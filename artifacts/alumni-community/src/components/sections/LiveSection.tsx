import { useState } from "react";
import { Radio, Bell, Youtube } from "lucide-react";
import ShareButton from "@/components/ShareButton";

const CHANNEL_ID = "UCdDqqlcExi8gVxHMI4mKpSA";
const CHANNEL_URL = "https://www.youtube.com/@%D7%91%D7%95%D7%92%D7%A8%D7%99-%D7%9E%D7%90%D7%99%D7%A8%D7%99%D7%9D";

export default function LiveSection() {
  const [loaded, setLoaded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <section className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28" id="live">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(220,30,30,0.10),transparent_50%),radial-gradient(ellipse_at_10%_20%,rgba(0,19,164,0.16),transparent_45%)]" />
      <div className="gold-divider absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-red-500/35 bg-red-500/10 px-5 py-2 text-xs font-black tracking-[0.25em] text-red-400 backdrop-blur-md shadow-[0_0_30px_rgba(220,30,30,0.15)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              שידור חי
            </div>
            <h2 className="font-serif text-4xl font-black text-white md:text-5xl leading-tight">
              בשידור ישיר
            </h2>
            <ShareButton sectionId="live" label="שידור חי" className="mt-3" />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
            אירועים, שיעורים ומפגשים בשידור חי — היכנס וצפה בזמן אמת.
          </p>
        </div>

        {!showPlayer ? (
          <div className="group relative flex min-h-[340px] md:min-h-[460px] flex-col items-center justify-center gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-card/60 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/25 via-background/75 to-blue-950/25" />
            <div className="absolute inset-0 bg-grid-pattern opacity-15" />

            <div className="relative flex flex-col items-center gap-6 text-center px-6">
              <div className="relative grid h-24 w-24 place-items-center rounded-full border border-red-500/35 bg-red-500/10 text-red-400 shadow-[0_0_60px_rgba(220,30,30,0.2)]">
                <span className="absolute inset-[-14px] rounded-full border border-red-500/12 animate-ping" />
                <span className="absolute inset-[-28px] rounded-full border border-red-500/6" />
                <Radio className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <p className="text-xl font-bold text-white">בדוק אם הערוץ בשידור חי</p>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  לחץ לפתיחת נגן השידור — אם הקהילה משדרת עכשיו תראה זאת מיד.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setShowPlayer(true)}
                  className="flex items-center gap-2.5 rounded-full bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(220,30,30,0.35)] transition-all duration-300 hover:bg-red-500 hover:shadow-[0_0_50px_rgba(220,30,30,0.55)] active:scale-95"
                >
                  <Radio className="h-4 w-4" />
                  פתח שידור חי
                </button>

                <a
                  href={CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-muted-foreground backdrop-blur transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/8"
                >
                  <Youtube className="h-4 w-4 text-red-400" />
                  לערוץ היוטיוב
                </a>
              </div>

              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground/60 transition hover:text-muted-foreground"
              >
                <Bell className="h-3 w-3" />
                הירשם לעדכונים בערוץ
              </a>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] border border-red-500/20 shadow-[0_0_80px_rgba(220,30,30,0.16),0_30px_90px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 border-b border-white/8 bg-card/90 px-5 py-3.5 backdrop-blur">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span className="text-sm font-bold text-white">שידור חי — בוגרי מאירים</span>
              <button
                onClick={() => setShowPlayer(false)}
                className="mr-auto rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground hover:border-white/25 hover:text-white transition-all"
              >
                סגור
              </button>
            </div>

            {!loaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/85">
                <div className="flex flex-col items-center gap-3">
                  <Radio className="h-8 w-8 animate-pulse text-red-400" />
                  <p className="text-sm text-muted-foreground">מתחבר לשידור...</p>
                </div>
              </div>
            )}

            <div className="relative" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&autoplay=1&rel=0`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="שידור חי"
                onLoad={() => setLoaded(true)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
