import "./_group.css";

export function GlassMorphism() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#04010f", fontFamily: "'Heebo', sans-serif", direction: "rtl" }}>
      {/* Ambient glow blobs */}
      <div className="absolute" style={{ width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,168,79,0.18) 0%, transparent 70%)", top: -200, right: -100, filter: "blur(60px)" }} />
      <div className="absolute" style={{ width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(100,60,200,0.20) 0%, transparent 70%)", bottom: 0, left: -100, filter: "blur(80px)" }} />
      <div className="absolute" style={{ width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,168,79,0.10) 0%, transparent 70%)", top: "40%", left: "40%", filter: "blur(50px)" }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5" style={{ borderBottom: "1px solid rgba(214,168,79,0.12)", backdropFilter: "blur(20px)", background: "rgba(10,5,30,0.4)" }}>
        <div className="flex items-center gap-8" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          <span className="cursor-pointer hover:text-white transition-colors">גלריה</span>
          <span className="cursor-pointer hover:text-white transition-colors">שירותים</span>
          <span className="cursor-pointer hover:text-white transition-colors">צור קשר</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D6A84F", boxShadow: "0 0 10px #D6A84F" }} />
          <span style={{ fontFamily: "serif", fontSize: 24, fontWeight: 700, color: "#F8F1E3", letterSpacing: 2 }}>הדר</span>
        </div>
        <div style={{ padding: "8px 22px", borderRadius: 100, border: "1px solid rgba(214,168,79,0.4)", color: "#D6A84F", fontSize: 13, cursor: "pointer", backdropFilter: "blur(10px)", background: "rgba(214,168,79,0.06)" }}>
          כניסה
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-16 pb-8 px-10 text-center">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 100, border: "1px solid rgba(214,168,79,0.3)", background: "rgba(214,168,79,0.06)", marginBottom: 32, backdropFilter: "blur(10px)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D6A84F", boxShadow: "0 0 8px #D6A84F" }} />
          <span style={{ color: "#D6A84F", fontSize: 12, letterSpacing: 3, fontWeight: 500 }}>סטודיו לעיצוב הזמנות</span>
        </div>
        <h1 style={{ fontFamily: "serif", fontSize: 88, fontWeight: 700, lineHeight: 1.1, margin: "0 0 20px", background: "linear-gradient(180deg, #ffffff 0%, rgba(214,168,79,0.8) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          הדר
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, maxWidth: 460, lineHeight: 1.7 }}>
          עיצוב הזמנות חרדי ברמה גבוהה — מהמחשב שלכם ועד לדפוס
        </p>
        <div className="flex gap-4 mt-8">
          <button style={{ padding: "14px 36px", borderRadius: 100, background: "linear-gradient(135deg, #D6A84F, #f0c97a)", color: "#0a0520", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", boxShadow: "0 0 40px rgba(214,168,79,0.35)" }}>
            צפו בתבניות →
          </button>
          <button style={{ padding: "14px 36px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: 15, cursor: "pointer", backdropFilter: "blur(10px)", background: "rgba(255,255,255,0.04)" }}>
            איך זה עובד
          </button>
        </div>
      </div>

      {/* Glass cards row */}
      <div className="relative z-10 px-10 pt-4 pb-10 flex gap-5 justify-center flex-wrap">
        {[
          { label: "בר מצווה", price: "₪49", gradient: "linear-gradient(135deg, rgba(214,168,79,0.15), rgba(214,168,79,0.03))", glow: "rgba(214,168,79,0.15)" },
          { label: "חתונה", price: "₪49", gradient: "linear-gradient(135deg, rgba(130,80,200,0.15), rgba(80,40,180,0.03))", glow: "rgba(130,80,200,0.15)" },
          { label: "שבת שבע ברכות", price: "₪49", gradient: "linear-gradient(135deg, rgba(60,150,220,0.12), rgba(20,80,160,0.03))", glow: "rgba(60,150,220,0.12)" },
        ].map((card, i) => (
          <div key={i} style={{ width: 280, borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(30px)", background: card.gradient, padding: "28px 24px", position: "relative", overflow: "hidden", boxShadow: `0 20px 60px ${card.glow}`, cursor: "pointer" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />
            <div style={{ width: 50, height: 50, borderRadius: 12, background: "rgba(255,255,255,0.06)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(214,168,79,0.5)" }} />
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{card.label}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 20 }}>12 תבניות · RTL · עברית</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#D6A84F", fontSize: 20, fontWeight: 700 }}>{card.price}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>לעריכה →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom stats bar */}
      <div className="relative z-10 mx-10 mb-8 rounded-2xl flex justify-around py-5" style={{ border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.025)" }}>
        {[["500+", "עיצובים שנמסרו"], ["98%", "שביעות רצון"], ["3 דקות", "זמן עריכה ממוצע"]].map(([n, l], i) => (
          <div key={i} className="text-center">
            <div style={{ color: "#D6A84F", fontSize: 26, fontWeight: 700 }}>{n}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
