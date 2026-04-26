import "./_group.css";

export function TypographyFirst() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Heebo', sans-serif", direction: "rtl", color: "#0d0d0d" }}>
      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 48px", borderBottom: "1px solid #E0D8C8" }}>
        <div style={{ display: "flex", gap: 32, fontSize: 12, letterSpacing: 2, color: "#888" }}>
          <span style={{ cursor: "pointer" }}>גלריה</span>
          <span style={{ cursor: "pointer" }}>מחירים</span>
          <span style={{ cursor: "pointer" }}>קשר</span>
        </div>
        <div style={{ fontFamily: "serif", fontSize: 28, fontWeight: 800, letterSpacing: 3, color: "#0d0d0d" }}>
          הדר
        </div>
        <button style={{ padding: "10px 26px", borderRadius: 3, background: "#0d0d0d", color: "#F5F0E8", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: 1 }}>
          כניסה
        </button>
      </nav>

      {/* Hero */}
      <div style={{ padding: "72px 48px 0", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D6A84F" }} />
              <span style={{ fontSize: 11, letterSpacing: 4, color: "#888", fontWeight: 500 }}>INVITATION STUDIO</span>
            </div>
            <h1 style={{ fontFamily: "serif", fontSize: 100, fontWeight: 800, lineHeight: 0.9, margin: 0, color: "#0d0d0d" }}>
              עיצוב
            </h1>
            <h1 style={{ fontFamily: "serif", fontSize: 100, fontWeight: 800, lineHeight: 0.9, margin: 0, color: "transparent", WebkitTextStroke: "2px #D6A84F" }}>
              הזמנות
            </h1>
            <h1 style={{ fontFamily: "serif", fontSize: 100, fontWeight: 800, lineHeight: 0.9, margin: "0 0 40px", color: "#0d0d0d" }}>
              חרדי
            </h1>
            <p style={{ color: "#666", fontSize: 16, lineHeight: 1.8, maxWidth: 420, marginBottom: 36 }}>
              תבניות מקצועיות לאירועי שמחה — ברית, בר מצווה, חתונה ועוד.<br />
              ערכו בעצמכם, שלמו פעם אחת, קבלו קבצי דפוס.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button style={{ padding: "16px 36px", border: "none", background: "#0d0d0d", color: "#F5F0E8", fontSize: 14, fontWeight: 700, letterSpacing: 1, cursor: "pointer", borderRadius: 3 }}>
                לגלריה ←
              </button>
              <span style={{ color: "#888", fontSize: 13 }}>₪49 · כל הזכויות שמורות</span>
            </div>
          </div>

          {/* Right — card preview */}
          <div style={{ width: 260, marginTop: 24, marginLeft: 48, position: "relative" }}>
            <div style={{ width: 220, height: 310, borderRadius: 4, background: "#fff", border: "1px solid #E0D8C8", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 24, marginLeft: "auto" }}>
              <div style={{ width: 30, height: 1, background: "#D6A84F" }} />
              <div style={{ fontFamily: "serif", fontSize: 11, color: "#aaa", letterSpacing: 2 }}>בסד</div>
              <div style={{ fontFamily: "serif", fontSize: 24, fontWeight: 700, color: "#0d0d0d", textAlign: "center", lineHeight: 1.3 }}>שמחת<br />בר המצווה</div>
              <div style={{ fontSize: 11, color: "#999", textAlign: "center", lineHeight: 1.9 }}>ראובן בן שמעון<br />כ"ח שבט תשפ"ו</div>
              <div style={{ fontSize: 10, color: "#bbb", textAlign: "center" }}>יש לנו הכבוד להזמינכם</div>
              <div style={{ width: 30, height: 1, background: "#D6A84F" }} />
            </div>
            <div style={{ position: "absolute", top: 20, right: -10, width: 200, height: 290, borderRadius: 4, background: "#EDE5D4", border: "1px solid #D6CAB5", zIndex: -1, transform: "rotate(3deg)" }} />
          </div>
        </div>
      </div>

      {/* Bottom band */}
      <div style={{ margin: "56px 48px 48px", borderTop: "1px solid #E0D8C8", paddingTop: 36, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 48 }}>
          {[["500+", "עיצובים"], ["12", "קטגוריות"], ["₪49", "מחיר קבוע"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "serif", color: "#0d0d0d" }}>{n}</div>
              <div style={{ fontSize: 11, color: "#aaa", letterSpacing: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["#D6A84F", "#0d0d0d", "#666", "#E0D8C8"].map((c, i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.1)" }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#aaa", letterSpacing: 1 }}>© 2026 HADAR STUDIO</div>
      </div>
    </div>
  );
}
