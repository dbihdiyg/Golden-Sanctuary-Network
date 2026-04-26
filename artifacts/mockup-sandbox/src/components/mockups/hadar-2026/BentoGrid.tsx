import "./_group.css";

export function BentoGrid() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0a0a0a", fontFamily: "'Heebo', sans-serif", direction: "rtl" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <button style={{ padding: "9px 22px", borderRadius: 8, background: "#D6A84F", color: "#0a0a0a", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
          התחלה →
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "serif", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>הדר</span>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D6A84F", display: "inline-block" }} />
        </div>
        <div style={{ display: "flex", gap: 24, color: "#555", fontSize: 13 }}>
          <span style={{ cursor: "pointer" }}>גלריה</span>
          <span style={{ cursor: "pointer" }}>מחירים</span>
          <span style={{ cursor: "pointer" }}>אודות</span>
        </div>
      </nav>

      {/* Bento grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "280px 200px", gap: 8, padding: "8px 24px 8px" }}>
        {/* Hero cell — spans 2 rows */}
        <div style={{ gridRow: "1 / 3", borderRadius: 20, background: "linear-gradient(160deg, #111 40%, #1a1206 100%)", border: "1px solid #1e1e1e", padding: 36, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 24, right: 24, width: 48, height: 48, borderRadius: 12, background: "rgba(214,168,79,0.12)", border: "1px solid rgba(214,168,79,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "serif", fontSize: 22, color: "#D6A84F", fontWeight: 700 }}>ה</div>
          </div>
          <div style={{ position: "absolute", top: 60, right: 60, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,168,79,0.12) 0%, transparent 70%)", filter: "blur(20px)" }} />
          <div style={{ color: "#333", fontSize: 12, letterSpacing: 4, marginBottom: 12, fontWeight: 500 }}>STUDIO · 2026</div>
          <h1 style={{ fontFamily: "serif", fontSize: 72, fontWeight: 800, color: "#fff", lineHeight: 1, margin: "0 0 16px" }}>עיצוב<br />שמדבר<br /><span style={{ color: "#D6A84F" }}>בעברית.</span></h1>
          <p style={{ color: "#555", fontSize: 14, maxWidth: 320, lineHeight: 1.7 }}>תבניות הזמנה חרדיות מקצועיות — עריכה עצמאית, תשלום אחד, קבלה מיידית.</p>
          <div style={{ marginTop: 24 }}>
            <button style={{ padding: "12px 28px", borderRadius: 10, background: "#D6A84F", color: "#0a0a0a", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
              לגלריית התבניות →
            </button>
          </div>
        </div>

        {/* Stats cell */}
        <div style={{ borderRadius: 20, background: "#D6A84F", border: "1px solid #D6A84F", padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 52, fontWeight: 800, color: "#0a0a0a", lineHeight: 1 }}>500+</div>
          <div style={{ color: "rgba(0,0,0,0.55)", fontSize: 13, marginTop: 6, fontWeight: 500 }}>עיצובים שנמסרו</div>
        </div>

        {/* Badge cell */}
        <div style={{ borderRadius: 20, background: "#111", border: "1px solid #1e1e1e", padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["בר מצווה", "חתונה", "שמחות"].map((t, i) => (
              <span key={i} style={{ padding: "5px 10px", borderRadius: 6, background: "#1a1a1a", color: "#666", fontSize: 11, border: "1px solid #222" }}>{t}</span>
            ))}
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 22, lineHeight: 1.2 }}>12 קטגוריות<br />עיצוב</div>
            <div style={{ color: "#444", fontSize: 12, marginTop: 6 }}>מתעדכן כל חודש</div>
          </div>
        </div>

        {/* How it works cell */}
        <div style={{ borderRadius: 20, background: "#111", border: "1px solid #1e1e1e", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ color: "#555", fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>איך זה עובד</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["01", "בחרו תבנית"], ["02", "ערכו טקסטים"], ["03", "שלמו וקבלו"]].map(([n, t]) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#D6A84F", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{n}</span>
                <span style={{ color: "#aaa", fontSize: 13 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price cell */}
        <div style={{ borderRadius: 20, background: "#0d0d0d", border: "1px solid #1e1e1e", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>מחיר קבוע</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#fff" }}>₪49</div>
          <div style={{ color: "#444", fontSize: 12, marginTop: 4 }}>כולל קבצי דפוס</div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{ margin: "8px 24px", borderRadius: 14, background: "#111", border: "1px solid #1e1e1e", padding: "14px 24px", display: "flex", gap: 40, justifyContent: "center", color: "#444", fontSize: 12, letterSpacing: 2 }}>
        {["✦ בר מצווה", "✦ חתונה", "✦ שבע ברכות", "✦ הכנסת ספר תורה", "✦ שמחת בת", "✦ ברית מילה"].map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}
