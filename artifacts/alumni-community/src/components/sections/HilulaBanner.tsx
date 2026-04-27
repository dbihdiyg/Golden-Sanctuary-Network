import { useState } from "react";
import { X, Flame } from "lucide-react";

const EXPIRY_DATE = new Date("2026-04-28T21:00:00Z");
const YOUTUBE_ID = "g3xmmp9k0gE";

const TRANSCRIPT = `בוגרי מגדל אור, הנפלאים והיקרים, הצמודים לליבנו כבנים ממש —
מתפללים עליכם, אוהבים אתכם.

היה חבר שלכם, שלנו, תלמיד — לוי יצחק,
לצערנו נהרג. אתם יודעים.

"ואהבת לרעך" — זה לא רק כשהוא חי, גם כשהוא מת.
כי יהודי — לא מת.
הוא מחכה לעזרה שלכם.

בואו תתחזקו, כל אחד:
בתפילין, בשבת, בכשרות, בטהרה, בצניעות, בלימוד התורה, בתפילה.
וכל זה — לעילוי נשמת לוי יצחק בן אליהו ועדינה.

יהיה לכם זכות — לעלות את נשמתו, לעשות לו טובה למעלה.
ובזכות זה — השם ייתן לכם אורך ימים, שנים טובות,
שלא יינזק אף אחד, שלא יקרה שום תאונות.

ונזכה יחד, לגאולה השלמה, לתחיית המתים,
לראות אותו חוזר למשפחה — בתוך שמחה עם כלל ישראל.

אמן ואמן.`;

export default function HilulaBanner() {
  const isExpired = new Date() >= EXPIRY_DATE;
  const [dismissed, setDismissed] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  const handleDismiss = () => {
    setAnimOut(true);
    setTimeout(() => setDismissed(true), 400);
  };

  if (isExpired || dismissed) return null;

  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #2d1a00 0%, #3b2000 40%, #1a0d00 100%)",
        borderTop: "4px solid #c9a028",
        borderBottom: "4px solid #c9a028",
        transition: "opacity 0.4s, transform 0.4s",
        opacity: animOut ? 0 : 1,
        transform: animOut ? "translateY(-8px)" : "translateY(0)",
      }}
    >
      {/* Top candle-glow border */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, transparent, #c9a028, #ffe4a0, #c9a028, transparent)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
              style={{
                background: "rgba(181,154,106,0.12)",
                color: "#c9a96e",
                border: "1px solid rgba(181,154,106,0.3)",
              }}
            >
              <Flame size={12} className="shrink-0" style={{ color: "#d4a843" }} />
              יום הזיכרון
            </span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              ל׳ ניסן תשפ״ו
            </span>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="סגור"
            className="p-1.5 rounded-full transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Main card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(181,154,106,0.18)",
            background: "rgba(255,255,255,0.025)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 0 60px rgba(181,154,106,0.03)",
          }}
        >
          <div className="flex flex-col lg:flex-row-reverse gap-0">
            {/* Video side */}
            <div className="lg:w-[45%] relative bg-black" style={{ minHeight: "240px" }}>
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1`}
                title="פנייה לבוגרים — הרב גרוסמן שליט״א"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none", minHeight: "240px" }}
              />
            </div>

            {/* Text side */}
            <div className="lg:w-[55%] p-5 md:p-7 flex flex-col justify-center gap-4">
              {/* Title */}
              <div>
                <h2
                  className="text-xl md:text-2xl font-bold leading-snug mb-1"
                  style={{ color: "#c9a96e" }}
                >
                  לעילוי נשמת לוי יצחק בן אליהו ועדינה ז״ל
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                  הרב גרוסמן שליט״א בפנייה מרגשת לבוגרי מגדל אור
                </p>
              </div>

              {/* Divider */}
              <div
                className="h-px w-16"
                style={{ background: "linear-gradient(90deg, rgba(181,154,106,0.6), transparent)" }}
              />

              {/* Transcript */}
              <div
                className="text-sm leading-[1.95] overflow-y-auto max-h-52 pr-1"
                style={{
                  color: "rgba(255,255,255,0.72)",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(181,154,106,0.3) transparent",
                  fontFamily: "'Frank Ruhl Libre', serif",
                  whiteSpace: "pre-line",
                }}
              >
                {TRANSCRIPT}
              </div>

              {/* Footer note */}
              <div
                className="pt-3 border-t text-xs flex items-center gap-2"
                style={{
                  borderColor: "rgba(181,154,106,0.15)",
                  color: "rgba(255,255,255,0.38)",
                }}
              >
                <Flame size={11} style={{ color: "#c9a96e", flexShrink: 0 }} />
                <span>
                  תהא נשמתו צרורה בצרור החיים. בואו תיקחו על עצמכם מצווה אחת לזיכרו.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="h-px mt-0 opacity-25"
          style={{ background: "linear-gradient(90deg, transparent, #b59a6a, transparent)" }}
        />
      </div>
    </section>
  );
}
