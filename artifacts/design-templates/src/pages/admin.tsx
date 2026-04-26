import { useState } from "react";
import { Link } from "wouter";
import { Crown, Lock, Plus, Trash2, Edit2, Eye, Package, ShoppingBag, BarChart3, LogOut, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { templates as initialTemplates } from "@/lib/data";

const ADMIN_PASSWORD = "hadar2026";

interface Order {
  id: string;
  name: string;
  type: string;
  date: string;
  status: "ממתין" | "בעבודה" | "הושלם";
  whatsapp: string;
}

const mockOrders: Order[] = [
  { id: "1", name: "רחל ומשה כהן", type: "הזמנה לחתונה", date: "2026-05-10", status: "ממתין", whatsapp: "0501234567" },
  { id: "2", name: "אברהם לוי", type: "הזמנה לקידוש", date: "2026-05-03", status: "בעבודה", whatsapp: "0521234567" },
  { id: "3", name: "שרה גולדברג", type: "מודעה לאירוע", date: "2026-04-28", status: "הושלם", whatsapp: "0541234567" },
  { id: "4", name: "יצחק ורבקה פישר", type: "קליפ וידאו", date: "2026-05-15", status: "ממתין", whatsapp: "0511234567" },
];

const statusColors: Record<string, string> = {
  "ממתין": "text-amber-400 bg-amber-400/10 border-amber-400/30",
  "בעבודה": "text-blue-400 bg-blue-400/10 border-blue-400/30",
  "הושלם": "text-green-400 bg-green-400/10 border-green-400/30",
};

type Tab = "orders" | "templates" | "stats";

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [templates, setTemplates] = useState(initialTemplates);

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-primary/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <Crown className="w-6 h-6 text-primary absolute -top-4 left-1/2 -translate-x-1/2" />
              <span className="font-serif font-bold text-3xl text-foreground">הדר</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Lock className="w-4 h-4" />
              <span>כניסה לממשק ניהול</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw">סיסמת אדמין</Label>
              <Input
                id="pw"
                type="password"
                dir="ltr"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setPwError(false); }}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className={`h-11 bg-background border ${pwError ? "border-red-500" : "border-primary/20"}`}
                placeholder="הכניסו סיסמה"
              />
              {pwError && <p className="text-red-400 text-sm">סיסמה שגויה</p>}
            </div>
            <Button onClick={login} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-bold">
              כניסה
            </Button>
            <Link href="/">
              <p className="text-center text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors mt-2">
                חזרה לאתר
              </p>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">
      {/* Top bar */}
      <header className="border-b border-primary/10 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Crown className="w-4 h-4 text-primary absolute -top-3 left-1/2 -translate-x-1/2" />
              <span className="font-serif font-bold text-xl text-foreground">הדר</span>
            </div>
            <span className="text-muted-foreground text-sm border-r border-primary/20 pr-3">ממשק ניהול</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Eye className="w-4 h-4" /> צפה באתר
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setAuthed(false)} className="gap-2 text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" /> יציאה
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "הזמנות סה״כ", value: orders.length, icon: ShoppingBag, color: "text-primary" },
            { label: "ממתינות", value: orders.filter(o => o.status === "ממתין").length, icon: Package, color: "text-amber-400" },
            { label: "בעבודה", value: orders.filter(o => o.status === "בעבודה").length, icon: Edit2, color: "text-blue-400" },
            { label: "הושלמו", value: orders.filter(o => o.status === "הושלם").length, icon: Check, color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-primary/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-primary/10 pb-0">
          {(["orders", "templates", "stats"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "orders" ? "הזמנות" : t === "templates" ? "תבניות" : "סטטיסטיקות"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card border border-primary/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">רשימת הזמנות</h2>
                  <span className="text-sm text-muted-foreground">{orders.length} הזמנות</span>
                </div>
                <div className="divide-y divide-primary/5">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{order.name}</p>
                        <p className="text-sm text-muted-foreground">{order.type} · {order.date}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">ווצאפ: {order.whatsapp}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: e.target.value as Order["status"] } : o))}
                          className="text-xs bg-background border border-primary/20 rounded-lg px-2 py-1.5 text-foreground cursor-pointer"
                        >
                          <option>ממתין</option>
                          <option>בעבודה</option>
                          <option>הושלם</option>
                        </select>
                        <a href={`https://wa.me/972${order.whatsapp.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-400/10 h-8 px-2 text-xs">
                            ווצאפ
                          </Button>
                        </a>
                        <Button variant="ghost" size="sm" onClick={() => setOrders(prev => prev.filter(o => o.id !== order.id))}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "templates" && (
            <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-card border border-primary/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                  <h2 className="font-semibold">ניהול תבניות</h2>
                  <Button size="sm" className="bg-primary text-primary-foreground gap-2 hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> הוספת תבנית
                  </Button>
                </div>
                <div className="divide-y divide-primary/5">
                  {templates.map((tmpl) => (
                    <div key={tmpl.id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-primary/20 flex items-center justify-center bg-secondary/50">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tmpl.title}</p>
                          <p className="text-sm text-muted-foreground">{tmpl.category} · {tmpl.style}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-primary">₪{tmpl.price}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm"
                          onClick={() => setTemplates(prev => prev.filter(t => t.id !== tmpl.id))}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-primary/10 rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" /> הזמנות לפי סוג
                  </h3>
                  {[
                    { label: "הזמנות לחתונה", pct: 40 },
                    { label: "הזמנות לקידוש", pct: 25 },
                    { label: "מודעות לאירועים", pct: 20 },
                    { label: "קליפי וידאו", pct: 15 },
                  ].map((item) => (
                    <div key={item.label} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="text-primary font-medium">{item.pct}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-primary/10 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">הכנסות החודש</h3>
                  <p className="text-4xl font-bold text-primary mb-2">₪2,840</p>
                  <p className="text-sm text-muted-foreground mb-6">+18% לעומת החודש הקודם</p>
                  <div className="space-y-3">
                    {[
                      { label: "הזמנות שהושלמו", value: "12" },
                      { label: "ממוצע להזמנה", value: "₪237" },
                      { label: "לקוחות חדשים", value: "8" },
                      { label: "זמן אספקה ממוצע", value: "18 שעות" },
                    ].map((stat) => (
                      <div key={stat.label} className="flex justify-between text-sm border-b border-primary/5 pb-2">
                        <span className="text-muted-foreground">{stat.label}</span>
                        <span className="font-medium text-foreground">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
