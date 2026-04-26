import "./_group.css";

export function Cinematic() {
  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "'Heebo', sans-serif", direction: "rtl", background: "#0c0c0c" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 36px", position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 }}>
        <div style={{ display: "flex", gap: 28, color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: 2 }}>
          <span>GALLERY</span>
          <span>STUDIO</span>
        </div>
        <div style={{ fontFamily: "serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: 4 }}>הדר</div>
        <button style={{ padding: "8px 20px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, color: "rgba(255,255,255,0.6)", fontSize: 11, letterSpacing: 2, background: "transparent", cursor: "pointer" }}>
          ENTER
        </button>
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "55% 45%" }}>
        {/* Left — text panel */}
        <div style={{ background: "#0c0c0c", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "100px 60px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: 200, right: -50, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,168,79,0.06) 0%, transparent 70%)" }} />
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: 6, marginBottom: 24, fontFamily: "monospace" }}>
            INVITATION DESIGN STUDIO — 2026
          </div>
          <h1 style={{ fontFamily: "serif", fontSize: 80, fontWeight: 700, color: "#fff", lineHeight: 0.95, margin: "0 0 32px" }}>
            עיצוב<br />
            <span style={{ color: "#D6A84F" }}>מהוד</span><br />
            ומהדר
          </h1>
          <div style={{ width: 48, height: 1, background: "#D6A84F", marginBottom: 24 }} />
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, lineHeight: 1.9, maxWidth: 360 }}>
            הזמנות חרדיות בסטנדרט הגבוה ביותר.<br />
            עריכה עצמית, תשלום חד-פעמי של ₪49,<br />
            קבלת קבצי דפוס תוך דקות.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
            <button style={{ padding: "14px 32px", border: "none", borderRadius: 4, background: "#D6A84F", color: "#0c0c0c", fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: "pointer" }}>
              לגלריה ←
            </button>
            <button style={{ padding: "14px 32px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: 1, cursor: "pointer" }}>
              WATCH DEMO
            </button>
          </div>
        </div>

        {/* Right — visual panel */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #1a1007 0%, #0d0d0d 100%)" }} />
          {/* Simulated invitation card */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-4deg)", width: 240, height: 340, borderRadius: 12, background: "linear-gradient(145deg, #1a1508 0%, #241c0a 100%)", border: "1px solid rgba(214,168,79,0.25)", boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(214,168,79,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 24 }}>
            <div style={{ width: 40, height: 1, background: "rgba(214,168,79,0.5)" }} />
            <div style={{ color: "rgba(214,168,79,0.4)", fontSize: 9, letterSpacing: 3 }}>בסייעתא דשמיא</div>
            <div style={{ fontFamily: "serif", fontSize: 26, fontWeight: 700, color: "#D6A84F", textAlign: "center", lineHeight: 1.2 }}>שמחת<br />בר המצווה</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center", lineHeight: 1.8 }}>ראובן בן שמעון<br />ח׳ אדר תשפ״ו</div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, textAlign: "center", lineHeight: 1.8 }}>יש לנו את הכבוד להזמינכם<br />לסעודת מצווה</div>
            <div style={{ width: 40, height: 1, background: "rgba(214,168,79,0.5)" }} />
          </div>
          {/* Second card behind */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-35%, -45%) rotate(6deg)", width: 240, height: 340, borderRadius: 12, background: "linear-gradient(145deg, #0d1520 0%, #0a1018 100%)", border: "1px solid rgba(100,150,255,0.1)", opacity: 0.6 }} />
          {/* Ambient light */}
          <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,168,79,0.08) 0%, transparent 70%)", filter: "blur(30px)" }} />
          {/* Frame counter */}
          <div style={{ position: "absolute", bottom: 24, right: 24, color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "monospace", letterSpacing: 3 }}>01 / 12</div>
          <div style={{ position: "absolute", bottom: 24, left: 24, display: "flex", gap: 6 }}>
            {[1,2,3].map(i => <div key={i} style={{ width: i === 1 ? 20 : 6, height: 2, borderRadius: 1, background: i === 1 ? "#D6A84F" : "rgba(255,255,255,0.2)" }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
