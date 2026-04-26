import hadarLogo from "@/assets/logo-hadar.png";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Search, Crown, CheckCircle2, Clock, LayoutGrid, Image as ImageIcon, Video, Calendar, Palette, PenTool, Send, Menu, X, Sun, Moon, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth, UserButton, SignInButton } from "@clerk/react";
import { TemplateCard } from "@/components/TemplateCard";
import { templates as staticTemplates, categories as staticCategories, styles as staticStyles, Template } from "@/lib/data";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/contexts/LangContext";
import { t } from "@/lib/i18n";
import { motion, AnimatePresence, useInView, useAnimation } from "framer-motion";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");

function useGalleryTemplates() {
  const [templates, setTemplates] = useState<Template[]>(staticTemplates);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(staticCategories);
  const [styles, setStyles] = useState<string[]>(staticStyles);

  useEffect(() => {
    fetch(`${API_BASE}/api/hadar/public-templates`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Template[] = data.map(t => {
            const galleryImg = t.galleryImageUrl || t.imageUrl;
            return {
              id: String(t.id),
              title: t.title,
              subtitle: t.subtitle,
              category: t.category,
              style: t.style,
              price: Math.round(t.price / 100),
              image: galleryImg || "linear-gradient(135deg, #0B1833 0%, #1a2d54 100%)",
              isGradient: !galleryImg || /gradient|linear|radial/i.test(galleryImg),
              slots: t.slots,
              galleryImageUrl: t.galleryImageUrl,
              displayImageUrl: t.displayImageUrl,
              dimensions: t.dimensions,
            };
          });
          setTemplates(mapped);
          setCategories([...new Set(mapped.map(t => t.category).filter(Boolean))]);
          setStyles([...new Set(mapped.map(t => t.style).filter(Boolean))]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { templates, loading, categories, styles };
}

function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, isIntersecting] as const;
}

function AuthNavButton() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-1.5">
        <Link href="/my-designs">
          <Button size="sm" variant="ghost" className="text-primary border border-primary/20 hover:bg-primary/10 gap-1.5 h-8 px-2.5 text-xs">
            <User className="w-3.5 h-3.5" />
            העיצובים שלי
          </Button>
        </Link>
        <UserButton appearance={{ variables: { colorPrimary: "#D6A84F" } }} />
      </div>
    );
  }
  return (
    <SignInButton mode="redirect">
      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-8 px-3 text-xs font-bold">
        כניסה
      </Button>
    </SignInButton>
  );
}

// ─── Load custom BA Hebrew fonts via FontFace API ─────────────────────────
const BA_FONTS = [
  { name: "BA-Arzey-Bold",      file: "BAArzeyHalevanon-Bold.ttf" },
  { name: "BA-Arzey-Light",     file: "BAArzeyHalevanon-Light.ttf" },
  { name: "BA-Fontov-Bold",     file: "BA-Fontov-Bold.otf" },
  { name: "BA-Fontov",          file: "BA-Fontov-Regular.otf" },
  { name: "BA-HaYetzira",       file: "BA-HaYetzira-Regular.otf" },
  { name: "BA-HaYetzira-Light", file: "BA-HaYetzira-Light.otf" },
  { name: "BA-Kiriat-Kodesh",   file: "BA-Kiriat-Kodesh-Bold.otf" },
  { name: "BA-Moment",          file: "BA-Moment-Original.otf" },
  { name: "BA-Platforma-Black", file: "BAPlatforma-Black.otf" },
  { name: "BA-Platforma-Bold",  file: "BAPlatforma-Bold.otf" },
  { name: "BA-Platforma-Light", file: "BAPlatforma-Light.otf" },
  { name: "BA-Niflaot",         file: "BANiflaot-Black.ttf" },
  { name: "BA-Barkai",          file: "BABarkai-Regular.otf" },
  { name: "BA-Mesubin",         file: "BA-Mesubin-Rolltext.otf" },
  { name: "BA-Casablanca",      file: "BA-Casablanca-Light.otf" },
  { name: "BA-Radlheim",        file: "BARadlheim-Bold.otf" },
  { name: "BA-Rishon",          file: "BARishonLezion-Regular.ttf" },
  { name: "BA-Maim-Haim",       file: "BA-Maim-Haim-Regular.otf" },
];

function useBAFonts() {
  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/design-templates/";
    BA_FONTS.forEach(({ name, file }) => {
      const ff = new FontFace(name, `url('${base}fonts/${file}')`);
      ff.load().then(f => document.fonts.add(f)).catch(() => {});
    });
  }, []);
}

// ─── Invitation card data for the fan carousel ────────────────────────────
const HERO_CARDS = [
  { title: "שמחת הבר מצווה", sub: "ראובן בן שמעון · ח׳ אדר תשפ״ו", bg: "linear-gradient(155deg,#0f1e3a 0%,#1a2d54 60%,#0d1830 100%)" },
  { title: "שמחת נישואין", sub: "אברהם ושרה · כ״ה אדר תשפ״ו", bg: "linear-gradient(155deg,#1a0f0f 0%,#2d1a0f 60%,#150a0a 100%)" },
  { title: "ברית מילה", sub: "יוסף בן דוד · ה׳ שבט תשפ״ו", bg: "linear-gradient(155deg,#0a1a0f 0%,#0f2d1a 60%,#071510 100%)" },
  { title: "קידוש לכבוד השבת", sub: "משפחת לוי · פרשת בשלח", bg: "linear-gradient(155deg,#1a1a0f 0%,#2d2a0f 60%,#15130a 100%)" },
  { title: "ערב עיון מיוחד", sub: "הרב פלוני שליט״א · כ״ח שבט", bg: "linear-gradient(155deg,#1a0f1a 0%,#250f2d 60%,#130a15 100%)" },
];

function InvitationMiniCard({ title, sub, bg, style }: { title: string; sub: string; bg: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: 200, height: 280, borderRadius: 12, background: bg,
      border: "1px solid rgba(214,168,79,0.25)",
      boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(214,168,79,0.06)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 8, padding: "24px 18px", direction: "rtl", position: "absolute",
      ...style,
    }}>
      <div style={{ position: "absolute", inset: 7, borderRadius: 7, border: "1px solid rgba(214,168,79,0.08)", pointerEvents: "none" }} />
      {/* corner marks */}
      {([[8,8,"top","right"],[8,8,"top","left"],[8,8,"bottom","right"],[8,8,"bottom","left"]] as const).map(([t,l,v,h], i) => (
        <div key={i} style={{ position:"absolute", [v]: t, [h]: l, width:8, height:8,
          borderTop: v==="top" ? "1px solid rgba(214,168,79,0.4)" : undefined,
          borderBottom: v==="bottom" ? "1px solid rgba(214,168,79,0.4)" : undefined,
          borderRight: h==="right" ? "1px solid rgba(214,168,79,0.4)" : undefined,
          borderLeft: h==="left" ? "1px solid rgba(214,168,79,0.4)" : undefined,
        }} />
      ))}
      <div style={{ width: 32, height: 1, background: "rgba(214,168,79,0.5)" }} />
      <div style={{ color: "rgba(214,168,79,0.35)", fontSize: 8, letterSpacing: 3 }}>בסייעתא דשמיא</div>
      <div style={{ fontFamily: "serif", fontSize: 17, fontWeight: 700, color: "#D6A84F", textAlign: "center", lineHeight: 1.3 }}>{title}</div>
      <div style={{ color: "rgba(248,241,227,0.4)", fontSize: 10, textAlign: "center", lineHeight: 1.8 }}>{sub}</div>
      <div style={{ width: 32, height: 1, background: "rgba(214,168,79,0.5)" }} />
      <div style={{ color: "rgba(214,168,79,0.18)", fontSize: 7, letterSpacing: 4, fontFamily: "serif" }}>הדר</div>
    </div>
  );
}

function HeroSection() {
  useBAFonts();
  const [activeIdx, setActiveIdx] = useState(0);
  const total = HERO_CARDS.length;

  useEffect(() => {
    const id = setInterval(() => setActiveIdx(i => (i + 1) % total), 3000);
    return () => clearInterval(id);
  }, [total]);

  const getCardStyle = (i: number): React.CSSProperties => {
    const offset = ((i - activeIdx) % total + total) % total;
    const isFront = offset === 0;
    const spread = [0, -140, 140, -260, 260][offset] ?? (offset * 100);
    const rot = [0, -18, 18, -32, 32][offset] ?? (offset * 15);
    const depth = [5, 3, 3, 1, 1][offset] ?? 0;
    const op = [1, 0.65, 0.65, 0.3, 0.3][offset] ?? 0;
    const sc = [1, 0.88, 0.88, 0.76, 0.76][offset] ?? 0.7;
    return {
      transform: `translateX(${spread}px) rotate(${rot}deg) scale(${sc})`,
      zIndex: depth, opacity: op,
      transition: "all 0.7s cubic-bezier(0.34,1.2,0.64,1)",
      filter: isFront ? "none" : "blur(0.5px)",
      cursor: isFront ? "default" : "pointer",
    };
  };

  return (
    <section style={{ minHeight: "100vh", background: "linear-gradient(180deg,#060e1f 0%,#0B1833 40%,#0d1c38 100%)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, paddingBottom: 40 }}>

      {/* ── Background atmosphere ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4 }}
          style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,168,79,0.07) 0%, transparent 60%)", filter: "blur(40px)" }}
        />
        <div style={{ position: "absolute", bottom: "5%", right: "8%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(214,168,79,0.04) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", top: "15%", left: "8%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(80,120,220,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />
        {/* Thin gold horizontal divider */}
        <div style={{ position: "absolute", top: "62%", left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(214,168,79,0.07), transparent)" }} />
        {/* Starfield dots */}
        {[...Array(18)].map((_, i) => (
          <motion.div key={i}
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ repeat: Infinity, duration: 2.5 + (i % 5) * 0.7, delay: i * 0.3 }}
            style={{ position: "absolute", width: i % 4 === 0 ? 2 : 1, height: i % 4 === 0 ? 2 : 1, borderRadius: "50%", background: "#D6A84F",
              top: `${10 + (i * 23 % 78)}%`, left: `${5 + (i * 37 % 90)}%` }} />
        ))}
      </div>

      {/* ── LOGO — Large, glowing, centered ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 10, marginBottom: 24 }}
      >
        {/* Glow halo behind logo */}
        <div style={{ position: "absolute", inset: -80, background: "radial-gradient(circle, rgba(214,168,79,0.22) 0%, transparent 65%)", filter: "blur(24px)", pointerEvents: "none" }} />
        <img
          src={hadarLogo}
          alt="הדר — סטודיו לעיצוב הזמנות"
          style={{
            height: "clamp(90px, 14vw, 148px)", width: "auto",
            objectFit: "contain", position: "relative",
            filter: "drop-shadow(0 0 24px rgba(214,168,79,0.55)) drop-shadow(0 0 60px rgba(214,168,79,0.22)) drop-shadow(0 8px 32px rgba(0,0,0,0.6))",
          }}
        />
      </motion.div>

      {/* ── Studio identity badge ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}
      >
        <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, transparent, rgba(214,168,79,0.5))" }} />
        <span style={{ color: "rgba(214,168,79,0.65)", fontSize: 11, letterSpacing: 5, fontFamily: "'BA-Platforma-Light', monospace", textTransform: "uppercase" }}>
          סטודיו לעיצוב הזמנות חרדיות
        </span>
        <div style={{ width: 36, height: 1, background: "linear-gradient(270deg, transparent, rgba(214,168,79,0.5))" }} />
      </motion.div>

      {/* ── MAIN HEADLINE in BA-Arzey-Bold ── */}
      <motion.h1
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 10, fontFamily: "'BA-Arzey-Bold', 'Frank Ruhl Libre', serif", fontWeight: 400, textAlign: "center", lineHeight: 1.05, margin: "0 0 8px", direction: "rtl", fontSize: "clamp(48px, 7.5vw, 104px)", letterSpacing: -1 }}
      >
        <span style={{ color: "#F8F1E3" }}>הזמנות </span>
        <span style={{ color: "#D6A84F", textShadow: "0 0 80px rgba(214,168,79,0.45), 0 0 30px rgba(214,168,79,0.25)" }}>מהוד</span>
        <span style={{ color: "#F8F1E3" }}> ומהדר</span>
      </motion.h1>

      {/* ── Tagline in BA-Moment ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.5 }}
        style={{ position: "relative", zIndex: 10, fontFamily: "'BA-Moment', 'Noto Serif Hebrew', serif", color: "rgba(248,241,227,0.42)", fontSize: "clamp(16px, 2.5vw, 22px)", textAlign: "center", marginBottom: 44, letterSpacing: 0.5, direction: "rtl" }}
      >
        ערכו · שלמו · קבלו — בדקות
      </motion.p>

      {/* ── 3D FAN CAROUSEL ── */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 10, width: 200, height: 280, marginBottom: 48 }}
      >
        {HERO_CARDS.map((card, i) => (
          <InvitationMiniCard key={i} title={card.title} sub={card.sub} bg={card.bg}
            style={{ ...getCardStyle(i), top: 0, left: 0 }}
          />
        ))}
      </motion.div>

      {/* ── Dots indicator ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
        style={{ position: "relative", zIndex: 10, display: "flex", gap: 6, marginBottom: 34 }}
      >
        {HERO_CARDS.map((_, i) => (
          <button key={i} onClick={() => setActiveIdx(i)}
            style={{ width: i === activeIdx ? 24 : 6, height: 3, borderRadius: 2, background: i === activeIdx ? "#D6A84F" : "rgba(214,168,79,0.2)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.4s" }} />
        ))}
      </motion.div>

      {/* ── CTA BUTTONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.65 }}
        style={{ position: "relative", zIndex: 10, display: "flex", gap: 14, alignItems: "center" }}
      >
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(214,168,79,0.45)" }}
          whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
          style={{ padding: "14px 38px", border: "none", borderRadius: 8, background: "#D6A84F", color: "#0B1833", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'BA-Platforma-Bold', inherit", letterSpacing: 0.5 }}
        >
          לגלריה ←
        </motion.button>
        <Link href="/order">
          <motion.button
            whileHover={{ background: "rgba(214,168,79,0.1)", borderColor: "rgba(214,168,79,0.5)" }}
            whileTap={{ scale: 0.96 }}
            style={{ padding: "14px 34px", border: "1px solid rgba(214,168,79,0.22)", borderRadius: 8, background: "transparent", color: "rgba(248,241,227,0.55)", fontSize: 15, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
          >
            הזמינו עכשיו
          </motion.button>
        </Link>
      </motion.div>

      {/* ── Scroll hint ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
      >
        <span style={{ color: "rgba(214,168,79,0.22)", fontSize: 9, letterSpacing: 4, fontFamily: "monospace" }}>גלגלו</span>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.7 }}
          style={{ width: 18, height: 28, borderRadius: 10, border: "1px solid rgba(214,168,79,0.16)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 5 }}
        >
          <div style={{ width: 3, height: 6, borderRadius: 2, background: "rgba(214,168,79,0.35)" }} />
        </motion.div>
      </motion.div>

    </section>
  );
}

// ─── "למה הדר?" — Typographic showcase section ────────────────────────────
const WHY_ITEMS = [
  {
    num: "א",
    title: "עיצוב ברמת סטודיו",
    body: "כל תבנית עוצבה בידי מעצבים מקצועיים עם שנים של ניסיון בעיצוב חרדי. קבלו תוצאה שנראית כמו הוצאה אלפי שקלים — במחיר של תבנית.",
    font: "BA-Arzey-Bold",
    numFont: "BA-Platforma-Black",
    accent: "#D6A84F",
  },
  {
    num: "ב",
    title: "כשרות עיצובית אמיתית",
    body: "סגנון חרדי מהדרין: ללא תמונות מעורבות, כתב מסורתי, ניסוחים הלכתיים נכונים — הכול מוכן לשימוש ישיר בלי לבדוק פעמיים.",
    font: "BA-Kiriat-Kodesh",
    numFont: "BA-Niflaot",
    accent: "#B8973E",
  },
  {
    num: "ג",
    title: "מהיר כמו ברק",
    body: "ממלאים פרטים, שולמים ₪49 — מקבלים קובץ מוכן לשיתוף בוואטסאפ ולהדפסה. כל התהליך לוקח פחות מעשר דקות.",
    font: "BA-Fontov-Bold",
    numFont: "BA-Radlheim",
    accent: "#C8A048",
  },
  {
    num: "ד",
    title: "גופנים עבריים בלעדיים",
    body: "אוסף ייחודי של גופנים עבריים מקצועיים שלא תמצאו בשום מקום אחר — מהמסורתי למודרני, מהאלגנטי לחגיגי.",
    font: "BA-Moment",
    numFont: "BA-Barkai",
    accent: "#D6A84F",
  },
];

function WhyHadarSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      style={{ background: "linear-gradient(180deg, #060e1f 0%, #0a1428 50%, #060e1f 100%)", padding: "100px 0 80px", position: "relative", overflow: "hidden", direction: "rtl" }}
    >
      {/* Background ornament */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", border: "1px solid rgba(214,168,79,0.04)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, borderRadius: "50%", border: "1px solid rgba(214,168,79,0.06)" }} />
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(214,168,79,0.15), transparent)" }} />
        <div style={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(214,168,79,0.15), transparent)" }} />
      </div>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        style={{ textAlign: "center", marginBottom: 72, position: "relative" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 18 }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, rgba(214,168,79,0.4))" }} />
          <span style={{ color: "rgba(214,168,79,0.5)", fontSize: 10, letterSpacing: 6, fontFamily: "'BA-Platforma-Light', monospace" }}>למה לבחור בהדר</span>
          <div style={{ width: 60, height: 1, background: "linear-gradient(270deg, transparent, rgba(214,168,79,0.4))" }} />
        </div>
        <h2 style={{ fontFamily: "'BA-Arzey-Bold', 'Frank Ruhl Libre', serif", fontWeight: 400, fontSize: "clamp(32px, 5vw, 58px)", color: "#F8F1E3", lineHeight: 1.1, margin: 0 }}>
          הזמנה טובה מספרת<br />
          <span style={{ color: "#D6A84F", textShadow: "0 0 60px rgba(214,168,79,0.3)" }}>את הסיפור שלכם</span>
        </h2>
      </motion.div>

      {/* 4 value-prop cards */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32 }}>
        {WHY_ITEMS.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: idx * 0.15 }}
            style={{
              background: "linear-gradient(160deg, rgba(214,168,79,0.05) 0%, rgba(11,24,51,0.6) 100%)",
              border: "1px solid rgba(214,168,79,0.1)",
              borderRadius: 16,
              padding: "40px 32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Corner decoration */}
            <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: "1px solid rgba(214,168,79,0.3)", borderRight: "1px solid rgba(214,168,79,0.3)" }} />
            <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: "1px solid rgba(214,168,79,0.3)", borderLeft: "1px solid rgba(214,168,79,0.3)" }} />

            {/* Large decorative Hebrew letter */}
            <div style={{
              fontFamily: `'${item.numFont}', serif`,
              fontSize: 96, lineHeight: 1, color: "rgba(214,168,79,0.07)",
              position: "absolute", top: -8, left: 16,
              userSelect: "none", pointerEvents: "none",
            }}>
              {item.num}
            </div>

            {/* Accent line */}
            <div style={{ width: 40, height: 3, background: `linear-gradient(90deg, ${item.accent}, transparent)`, borderRadius: 2, marginBottom: 24 }} />

            {/* Title in custom font */}
            <h3 style={{
              fontFamily: `'${item.font}', 'Frank Ruhl Libre', serif`,
              fontSize: 26, fontWeight: 400, color: "#F8F1E3",
              margin: "0 0 16px", lineHeight: 1.2, position: "relative",
            }}>
              {item.title}
            </h3>

            {/* Body in BA-HaYetzira */}
            <p style={{
              fontFamily: "'BA-HaYetzira', 'Noto Serif Hebrew', serif",
              fontSize: 15, lineHeight: 1.85, color: "rgba(248,241,227,0.5)",
              margin: 0, position: "relative",
            }}>
              {item.body}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Floating font showcase strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.6 }}
        style={{ maxWidth: 1200, margin: "64px auto 0", padding: "0 32px" }}
      >
        <div style={{ border: "1px solid rgba(214,168,79,0.08)", borderRadius: 12, padding: "32px 40px", background: "rgba(214,168,79,0.02)", textAlign: "center" }}>
          <div style={{ color: "rgba(214,168,79,0.35)", fontSize: 10, letterSpacing: 5, marginBottom: 28, fontFamily: "monospace" }}>
            — גופנים עבריים ייחודיים זמינים בעורך —
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 40px", justifyContent: "center", alignItems: "center" }}>
            {[
              { text: "אלגנטי ועדין", font: "BA-Casablanca", size: 28 },
              { text: "חגיגי ומרשים", font: "BA-Arzey-Bold", size: 32 },
              { text: "מודרני ונקי", font: "BA-Platforma-Bold", size: 22 },
              { text: "רגשי ומיוחד", font: "BA-Moment", size: 28 },
              { text: "כשר ומסורתי", font: "BA-Kiriat-Kodesh", size: 26 },
              { text: "עוצמה ויוקרה", font: "BA-Fontov-Bold", size: 24 },
            ].map((s, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 + i * 0.1 }}
                style={{ fontFamily: `'${s.font}', serif`, fontSize: s.size, color: i % 2 === 0 ? "#D6A84F" : "rgba(248,241,227,0.75)", lineHeight: 1.4 }}
              >
                {s.text}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

    </section>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("הכל");
  const [activeStyle, setActiveStyle] = useState<string>("הכל");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { lang, toggleLang } = useLang();
  const { templates, loading: templatesLoading, categories, styles } = useGalleryTemplates();
  
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const [clockRef, clockIntersecting] = useIntersectionObserver({ threshold: 0.5 });
  const [stepsRef, stepsIntersecting] = useIntersectionObserver({ threshold: 0.2 });

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth) * 2 - 1);
      setMouseY((e.clientY / window.innerHeight) * 2 - 1);
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!clockIntersecting) return;
    let start = 0;
    const end = 24;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [clockIntersecting]);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = activeCategory === "הכל" || t.category === activeCategory;
    const matchesStyle = activeStyle === "הכל" || t.style === activeStyle;
    const matchesSearch = t.title.includes(searchQuery) || t.subtitle.includes(searchQuery);
    return matchesCategory && matchesStyle && matchesSearch;
  });

  const sloganWords = "עיצוב ווידאו לאירועים — במהירות של תבנית, ברמה של סטודיו".split(" ");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 selection:text-primary-foreground transition-colors duration-300"
    >
      
      {/* Fixed Header — transparent at top, solid when scrolled */}
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          transition: "background 0.35s, backdrop-filter 0.35s, box-shadow 0.35s, border-color 0.35s",
          background: scrolled ? "rgba(9,20,44,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(214,168,79,0.1)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 36px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left: nav links (hidden on mobile) */}
          <nav className="hidden md:flex" style={{ gap: 28, direction: "rtl", alignItems: "center" }}>
            {[
              { href: "#gallery", label: "גלריה", isLink: false },
              { href: "#services", label: "שירותים", isLink: false },
              { href: "/help", label: "מדריכים", isLink: true },
              { href: "#contact", label: "צור קשר", isLink: false },
            ].map(item => item.isLink ? (
              <Link key={item.label} href={item.href}>
                <span style={{ color: "rgba(248,241,227,0.45)", fontSize: 13, textDecoration: "none", cursor: "pointer", transition: "color 0.2s", fontFamily: "inherit" }}
                  onMouseEnter={(e: any) => (e.currentTarget.style.color = "#D6A84F")}
                  onMouseLeave={(e: any) => (e.currentTarget.style.color = "rgba(248,241,227,0.45)")}
                >{item.label}</span>
              </Link>
            ) : (
              <a key={item.label} href={item.href} style={{ color: "rgba(248,241,227,0.45)", fontSize: 13, textDecoration: "none", transition: "color 0.2s", fontFamily: "inherit" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#D6A84F")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(248,241,227,0.45)")}
              >{item.label}</a>
            ))}
          </nav>

          {/* Center: logo */}
          <Link href="/">
            <img src={hadarLogo} alt="הדר" style={{ height: 46, width: "auto", cursor: "pointer", objectFit: "contain" }} />
          </Link>

          {/* Right: auth + controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="hidden md:block">
              <AuthNavButton />
            </div>
            <button onClick={toggleLang} style={{ padding: "6px 12px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3, color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 2, background: "transparent", cursor: "pointer", fontFamily: "monospace" }}>
              {lang === "he" ? "EN" : "עב"}
            </button>
            <button onClick={toggle} style={{ padding: 7, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3, color: "rgba(255,255,255,0.45)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}>
              {theme === "dark" ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ padding: 7, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3, color: "rgba(255,255,255,0.45)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}>
              {isMenuOpen ? <X style={{ width: 16, height: 16 }} /> : <Menu style={{ width: 16, height: 16 }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div style={{ background: "rgba(9,20,44,0.98)", borderBottom: "1px solid rgba(214,168,79,0.1)", padding: "16px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
            <Link href="/"><span style={{ color: "#D6A84F", fontSize: 13, display: "block", cursor: "pointer" }} onClick={() => setIsMenuOpen(false)}>{t("nav_home", lang)}</span></Link>
            <a href="#gallery" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, display: "block" }} onClick={() => setIsMenuOpen(false)}>{t("nav_gallery", lang)}</a>
            <a href="#services" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, display: "block" }} onClick={() => setIsMenuOpen(false)}>{t("nav_services", lang)}</a>
            <Link href="/order"><span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, display: "block", cursor: "pointer" }} onClick={() => setIsMenuOpen(false)}>{t("nav_order", lang)}</span></Link>
            <Link href="/help"><span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, display: "block", cursor: "pointer" }} onClick={() => setIsMenuOpen(false)}>{t("nav_help", lang)}</span></Link>
            <a href="#contact" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, display: "block" }} onClick={() => setIsMenuOpen(false)}>{t("nav_contact", lang)}</a>
            <div style={{ paddingTop: 8 }}><AuthNavButton /></div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════
           WOW HERO — Logo + Custom Fonts + Fan Carousel
          ══════════════════════════════════════════════ */}
      <HeroSection />

      {/* ══════════════════════════════════════════════
           WHY HADAR — Typographic value proposition
          ══════════════════════════════════════════════ */}
      <WhyHadarSection />

      {/* 24-Hour Promise Module */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
            
            <div 
              ref={clockRef}
              className={`relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm transition-all duration-1000 ${clockIntersecting ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            >
              {/* Rotating SVG Ring */}
              <motion.svg 
                className="absolute inset-0 w-full h-full text-primary" 
                viewBox="0 0 100 100"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              >
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
                <motion.line 
                  x1="50" y1="50" x2="50" y2="15" 
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  style={{ originX: "50px", originY: "50px" }}
                />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
              </motion.svg>
              
              <div className="text-center z-10 relative">
                <span className="block text-primary/80 font-medium mb-1 text-sm md:text-base">{t("promise_hours", lang)}</span>
                <div className="font-serif text-6xl md:text-8xl font-bold text-primary tabular-nums leading-none bg-background/60 rounded-full px-2 py-1 backdrop-blur-sm shadow-[0_0_15px_rgba(214,168,79,0.2)]">{count}</div>
                <span className="block text-primary/80 font-medium mt-1 text-sm md:text-base">{t("promise_hours_suffix", lang as any) || "שעות"}</span>
              </div>
            </div>

            <div className={`space-y-6 max-w-md text-center md:text-right transition-all duration-1000 delay-300 ${clockIntersecting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <h2 className="font-serif text-4xl font-bold text-foreground">{t("promise_title", lang)}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                אתם צריכים את העיצוב מהר, אבל לא רוצים להתפשר על האיכות. אנחנו מספקים סקיצה ראשונית ברמה הגבוהה ביותר תוך יממה אחת בלבד.
              </p>
              <div className="flex flex-col gap-4 mt-6">
                {['מהיר — זמן תגובה מיידי', 'מדויק — קולע לטעם שלכם', 'מקצועי — רמת גימור של סטודיו'].map((item, i) => (
                  <div key={i} className="flex items-center justify-center md:justify-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-lg font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section id="services" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">השירותים שלנו</h2>
            <p className="text-xl text-muted-foreground">כל מה שאתם צריכים לאירוע מושלם</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto auto-rows-[250px]">
            
            {/* הזמנות לחתונה (Large, takes 2 cols on md) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80')] bg-cover bg-center" />
              <div className="relative z-20">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary backdrop-blur-md">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-3xl font-bold mb-2">הזמנות לחתונה</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">עיצובים יוקרתיים שמשדרים הוד והדר, מותאמים אישית לטעם שלכם.</p>
                <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
              </div>
            </motion.div>

            {/* הזמנות לקידוש */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
              className="group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors"
            >
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/10 z-10" />
               <div className="relative z-20">
                 <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                    <ImageIcon className="w-6 h-6" />
                 </div>
                 <h3 className="font-serif text-2xl font-bold mb-2">הזמנות לקידוש</h3>
                 <p className="text-sm text-muted-foreground mb-4">הזמנות קלאסיות ומרשימות.</p>
                 <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
               </div>
            </motion.div>

            {/* מודעות לאירועים */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
              className="group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors"
            >
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/10 z-10" />
               <div className="relative z-20">
                 <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                    <PenTool className="w-6 h-6" />
                 </div>
                 <h3 className="font-serif text-2xl font-bold mb-2">מודעות לאירועים</h3>
                 <p className="text-sm text-muted-foreground mb-4">מודעות בולטות ומכובדות לישיבות וארגונים.</p>
                 <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
               </div>
            </motion.div>

            {/* קליפי וידאו (Large, takes 2 cols on md) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
              className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10" />
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-[url('https://images.unsplash.com/photo-1516280440502-861053422037?auto=format&fit=crop&q=80')] bg-cover bg-center" />
              <div className="relative z-20">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary backdrop-blur-md">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-3xl font-bold mb-2">קליפי וידאו</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">מצגות מרגשות וקליפים קצרים להקרנה באירועים ושמחות.</p>
                <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
              </div>
            </motion.div>

             {/* עיצובים לחגים ושבת */}
             <motion.div 
               initial={{ opacity: 0, x: -30 }} 
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
               whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(214,168,79,0.15)" }}
               className="group relative overflow-hidden rounded-3xl bg-secondary border border-white/5 p-8 flex flex-col justify-end hover:border-primary/50 transition-colors hidden md:flex"
             >
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/10 z-10" />
               <div className="relative z-20">
                 <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                    <Calendar className="w-6 h-6" />
                 </div>
                 <h3 className="font-serif text-2xl font-bold mb-2">לחגים ושבתות</h3>
                 <p className="text-sm text-muted-foreground mb-4">עיצובים ייעודיים למועדי ישראל.</p>
                 <Link href="/order"><span className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer">גלה עוד &larr;</span></Link>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3-Step Order Process */}
      <section className="py-24 bg-background border-t border-white/5" ref={stepsRef}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">איך זה עובד?</h2>
            <p className="text-xl text-muted-foreground">פשוט, מהיר ואיכותי</p>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between gap-12 md:gap-4">
            {/* Connecting Line Desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-secondary overflow-hidden">
              <motion.div 
                className="h-full bg-primary origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

             {/* Connecting Line Mobile */}
             <div className="md:hidden absolute top-0 bottom-0 right-12 w-0.5 bg-secondary overflow-hidden">
              <motion.div 
                className="w-full bg-primary origin-top"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>

            {[
              { num: 1, title: "בחרו תבנית", desc: "סיירו בגלריה שלנו ומצאו את הסגנון המושלם עבורכם.", icon: <Palette /> },
              { num: 2, title: "מלאו פרטים", desc: "הגישו בריף קצר עם כל הטקסטים והבקשות שלכם.", icon: <Send /> },
              { num: 3, title: "קבלו תוך 24 שעות", desc: "סקיצה ראשונה אצלכם לאישור, בסטנדרט הגבוה ביותר.", icon: <Clock /> }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.3 }}
                className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-6 md:w-1/3"
              >
                <div className="w-24 h-24 rounded-full bg-secondary border-4 border-background flex items-center justify-center relative flex-shrink-0 shadow-lg shadow-black/50">
                  <div className="text-primary w-10 h-10">
                    {step.icon}
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.3 + 0.3 }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-md"
                  >
                    {step.num}
                  </motion.div>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Gallery */}
      <section id="gallery" className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
             <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">הגלריה שלנו</h2>
             <p className="text-xl text-muted-foreground">מגוון תבניות מרהיבות מוכנות להתאמה אישית</p>
          </div>
        
          {/* Filters */}
          <div className="bg-background/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 md:p-6 mb-12 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Search */}
              <div className="relative max-w-md w-full">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="חפשו סגנון, אירוע או תבנית..." 
                  className="pl-4 pr-12 bg-secondary/50 border-white/10 focus-visible:ring-primary h-12 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Style Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <span className="text-base text-muted-foreground ml-2 whitespace-nowrap font-medium">סגנון:</span>
                <button 
                  onClick={() => setActiveStyle("הכל")}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeStyle === "הכל" ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"}`}
                >
                  הכל
                </button>
                {styles.map(style => (
                  <button 
                    key={style}
                    onClick={() => setActiveStyle(style)}
                    className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeStyle === style ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Strip */}
            <div className="flex items-center gap-8 overflow-x-auto mt-6 pb-2 hide-scrollbar border-t border-white/5 pt-6">
              <button 
                onClick={() => setActiveCategory("הכל")}
                className={`text-base font-medium whitespace-nowrap transition-all relative pb-2 ${activeCategory === "הכל" ? "text-primary" : "text-muted-foreground hover:text-white"}`}
              >
                הכל
                {activeCategory === "הכל" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-base font-medium whitespace-nowrap transition-all relative pb-2 ${activeCategory === cat ? "text-primary" : "text-muted-foreground hover:text-white"}`}
                >
                  {cat}
                  {activeCategory === cat && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {templatesLoading ? (
            <div className="flex justify-center items-center py-24 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>טוען תבניות...</span>
            </div>
          ) : (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.07 } },
              hidden: {}
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template, index) => (
                <TemplateCard key={template.id} template={template} index={index} />
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-background/50 rounded-2xl border border-white/5">
                <p className="text-2xl text-muted-foreground font-medium">לא נמצאו תבניות התואמות את החיפוש שלכם.</p>
                <Button variant="link" className="text-primary mt-4 text-lg" onClick={() => {setSearchQuery(""); setActiveCategory("הכל"); setActiveStyle("הכל");}}>
                  נקה סינונים
                </Button>
              </div>
            )}
          </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
             <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">לקוחות מספרים</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "הזמנו עיצוב לחתונת הבת. הסקיצה הגיעה תוך פחות מ-24 שעות והייתה מדויקת להפליא. רמת גימור שלא רואים כל יום, בסטנדרט חסידי מוקפד.", name: "משפחת לוי", role: "ירושלים" },
              { text: "כמזכיר ישיבה, אני צריך מודעות באופן תדיר. 'הדר' מבינים בדיוק את הסגנון הנדרש ופועלים במהירות שיא. פתרון מושלם למוסדות.", name: "הרב אברהם כהן", role: "מזכיר ישיבה, בני ברק" },
              { text: "השירות אדיב והמחיר מצוין ביחס לאיכות. העיצוב לבר המצווה היה פשוט מושלם, קלאסי ויוקרתי בדיוק כמו שרצינו.", name: "יעקב מ.", role: "ביתר עילית" }
            ].map((t, i) => (
              <div key={i} className="bg-secondary p-8 rounded-2xl border border-primary/20 relative shadow-lg">
                 <div className="absolute top-6 right-6 text-primary/20 font-serif text-6xl leading-none">"</div>
                 <p className="text-lg relative z-10 text-foreground mb-8 leading-relaxed">
                   {t.text}
                 </p>
                 <div>
                   <h4 className="font-bold text-lg text-primary">{t.name}</h4>
                   <span className="text-sm text-muted-foreground">{t.role}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order CTA Banner */}
      <section className="py-24 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">מוכנים להתחיל?</h2>
          <p className="text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
            ספרו לנו על האירוע שלכם, ונתחיל לעבוד על סקיצה יוקרתית.
          </p>
          <Link href="/order">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-xl px-12 h-16 rounded-full shadow-2xl transition-transform font-bold">
                שלחו בריף אישי
              </Button>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/5 bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
           <div className="flex flex-col items-center justify-center mb-8">
              <img src={hadarLogo} alt="הדר" style={{ height: 80, width: "auto", objectFit: "contain" }} />
            </div>
          <p className="text-muted-foreground mb-8">עיצוב ווידאו לאירועים — במהירות של תבנית, ברמה של סטודיו.</p>
          <p className="text-sm text-muted-foreground/60">© {new Date().getFullYear()} הדר. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </motion.div>
  );
}