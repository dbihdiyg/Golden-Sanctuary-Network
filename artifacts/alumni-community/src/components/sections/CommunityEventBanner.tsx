import { useEffect, useState } from "react";
import { X, Images } from "lucide-react";

const EXPIRY_DATE = new Date("2026-04-28T00:00:00");

const EVENT_TEXT = `ה' באייר — סנדקאות של מורינו ורבינו הרב גרוסמן שליט"א לנכד אחיו הרב מרדכי גרוסמן. הברית התקיימה באולמי הדודאים בני ברק. ויקרא שמו בישראל יקותיאל יהודה — על שם האדמו"ר מצאנז זצ"ל. הרב אמר: "זה שם מיוחד וזו זכות גדולה להיקרא בשם קדוש זה". לאחר הסנדקאות הגיש הרב ברכות לשמות בוגרים הזקוקים לזיוג הגון וזרע של קיימא. אשרינו שזכינו.`;

export default function CommunityEventBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const now = new Date();
    if (now < EXPIRY_DATE) {
      const wasDismissed = sessionStorage.getItem("brit_banner_dismissed");
      if (!wasDismissed) setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("brit_banner_dismissed", "1");
    setDismissed(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <section className="relative w-full py-6 px-4 overflow-hidden" dir="rtl">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, hsl(232,30%,9%) 0%, hsl(232,30%,6%) 60%, hsl(40,60%,8%) 100%)",
        }}
      />

      {/* Gold top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
      />

      <div
        className={`relative z-10 max-w-5xl mx-auto transition-all duration-400 ${
          dismissed ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold tracking-wider"
              style={{
                background: "hsl(var(--primary) / 0.15)",
                color: "hsl(var(--primary))",
                border: "1px solid hsl(var(--primary) / 0.35)",
              }}
            >
              ✡ שמחת הקהילה
            </span>
            <span className="text-xs text-muted-foreground">ה' באייר תשפ"ה</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-full transition-colors hover:bg-white/10 text-muted-foreground hover:text-foreground"
            aria-label="סגור"
          >
            <X size={15} />
          </button>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            border: "1px solid hsl(var(--primary) / 0.25)",
            background: "hsl(232,30%,8% / 0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex flex-col md:flex-row-reverse">
            {/* Image */}
            <div className="md:w-2/5 relative overflow-hidden" style={{ minHeight: "260px" }}>
              {!imgLoaded && (
                <div className="absolute inset-0 animate-pulse" style={{ background: "hsl(232,30%,12%)" }} />
              )}
              <img
                src="/brit-grossman.png"
                alt="סנדקאות הרב גרוסמן שליט״א"
                onLoad={() => setImgLoaded(true)}
                className="w-full h-full object-cover object-top transition-opacity duration-500"
                style={{ opacity: imgLoaded ? 1 : 0, maxHeight: "340px" }}
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, hsl(232,30%,8%) 0%, transparent 35%)",
                }}
              />
            </div>

            {/* Text */}
            <div className="md:w-3/5 p-5 md:p-7 flex flex-col justify-center gap-4">
              <h2
                className="text-xl md:text-2xl font-bold leading-snug"
                style={{ color: "hsl(var(--primary))" }}
              >
                סנדקאות מורינו הרב גרוסמן שליט"א
              </h2>

              <p className="text-sm md:text-base leading-relaxed text-foreground/85">
                {EVENT_TEXT}
              </p>

              <div
                className="pt-3 border-t flex items-center justify-between"
                style={{ borderColor: "hsl(var(--primary) / 0.2)" }}
              >
                <a
                  href="/gallery"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-100"
                  style={{
                    background: "hsl(var(--primary) / 0.15)",
                    color: "hsl(var(--primary))",
                    border: "1px solid hsl(var(--primary) / 0.4)",
                  }}
                >
                  <Images size={15} />
                  לכל תמונות הקהילה
                </a>
                <p className="text-xs text-muted-foreground">
                  אולמי הדודאים, בני ברק
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gold bottom border */}
        <div
          className="mt-0 h-[1px] opacity-30"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)" }}
        />
      </div>
    </section>
  );
}
