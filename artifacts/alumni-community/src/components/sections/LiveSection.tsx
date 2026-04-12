import { useState } from "react";
import { Radio, Bell } from "lucide-react";

const CHANNEL_ID = "UCdDqqlcExi8gVxHMI4mKpSA";
const CHANNEL_URL = "https://www.youtube.com/@%D7%91%D7%95%D7%92%D7%A8%D7%99-%D7%9E%D7%90%D7%99%D7%A8%D7%99%D7%9D";

export default function LiveSection() {
  const [loaded, setLoaded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <section className="relative overflow-hidden px-4 py-12 md:px-6 md:py-20" id="live">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(220,30,30,0.12),transparent_55%),radial-gradient(ellipse_at_10%_20%,rgba(0,19,164,0.18),transparent_45%)]" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-red-400 backdrop-blur">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              שידור חי
            </div>
            <h2 className="font-serif text-4xl font-black text-white md:text-5xl">
              בשידור ישיר
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
            אירועים, שיעורים ומפגשים בשידור חי — היכנס וצפה בזמן אמת.
          </p>
        </div>

        {!showPlayer ? (
          <div className="group relative flex min-h-[340px] md:min-h-[460px] flex-col items-center justify-center gap-6 rounded-[2rem] border border-white/10 bg-card/60 backdrop-blur-sm shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-background/80 to-blue-950/30" />
            </div>

            <div className="relative flex flex-col items-center gap-5 text-center px-6">
              <div className="relative grid h-24 w-24 place-items-center rounded-full border border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_60px_rgba(220,30,30,0.25)]">
                <span className="absolute inset-[-12px] rounded-full border border-red-500/15 animate-ping" />
                <Radio className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <p className="text-xl font-bold text-white">בדוק אם הערוץ בשידור חי</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  לחץ לפתיחת נגן השידור — אם הקהילה משדרת עכשיו תראה זאת מיד.
                </p>
              </div>

              <button
                onClick={() => setShowPlayer(true)}
                className="flex items-center gap-2 rounded-full bg-red-600 px-7 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(220,30,30,0.4)] transition hover:bg-red-500 hover:shadow-[0_0_50px_rgba(220,30,30,0.55)] active:scale-95"
              >
                <Radio className="h-4 w-4" />
                פתח שידור חי
              </button>

              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-bold text-muted-foreground backdrop-blur transition hover:border-white/30 hover:text-white"
              >
                <Bell className="h-3.5 w-3.5" />
                הירשם לעדכונים בערוץ
              </a>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] border border-red-500/25 shadow-[0_0_80px_rgba(220,30,30,0.2),0_30px_90px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2.5 border-b border-white/10 bg-card/80 px-5 py-3 backdrop-blur">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span className="text-sm font-bold text-white">שידור חי — בוגרי מאירים</span>
              <button
                onClick={() => setShowPlayer(false)}
                className="mr-auto text-xs text-muted-foreground hover:text-white transition"
              >
                סגור
              </button>
            </div>

            {!loaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
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
