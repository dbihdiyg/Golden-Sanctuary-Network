import { useEffect, useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import hadarLogo from "@/assets/logo-hadar.png";
import {
  Crown, Plus, Trash2, Edit3, Clock, CheckCircle, CreditCard,
  ArrowRight, Loader2, Download, ShoppingBag, FileText,
  RefreshCw, MessageCircle, CreditCard as Card, Package, AlertCircle,
  Wallet, X, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { templates } from "@/lib/data";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");

// ── Types ─────────────────────────────────────────────────────────────────────
interface Design {
  id: number;
  templateId: string;
  designName: string;
  status: "draft" | "paid" | "submitted";
  createdAt: string;
  updatedAt: string;
  fieldValues: Record<string, string>;
}

interface Order {
  id: number;
  designId: number | null;
  templateId: string;
  status: "pending" | "paid" | "failed";
  amount: number | null;
  currency: string | null;
  stripeSessionId: string | null;
  createdAt: string;
  designName: string | null;
  designStatus: string | null;
}

interface SavedPaymentMethod {
  id: number;
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
}

type Tab = "drafts" | "orders" | "downloads" | "payment";

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-green-500/10 text-green-700 border border-green-500/20 rounded-full px-2 py-0.5 font-medium">
      <CheckCircle className="w-3 h-3" />שולם
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full px-2 py-0.5 font-medium">
      <Clock className="w-3 h-3" />ממתין לתשלום
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-red-500/10 text-red-700 border border-red-500/20 rounded-full px-2 py-0.5 font-medium">
      <AlertCircle className="w-3 h-3" />נכשל
    </span>
  );
  if (status === "submitted") return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-full px-2 py-0.5 font-medium">
      <CheckCircle className="w-3 h-3" />הוגש
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-medium">
      <Clock className="w-3 h-3" />טיוטה
    </span>
  );
}

function formatAmount(amount: number | null) {
  if (!amount) return "₪49";
  return `₪${Math.round(amount / 100)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function brandIcon(brand: string) {
  const b = brand.toLowerCase();
  if (b === "visa") return "💳 Visa";
  if (b === "mastercard") return "💳 Mastercard";
  if (b === "amex") return "💳 Amex";
  return `💳 ${brand}`;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "downloads", label: "ההורדות שלי", icon: <Download className="w-4 h-4" /> },
  { id: "orders",    label: "ההזמנות שלי",   icon: <Package className="w-4 h-4" /> },
  { id: "drafts",    label: "הטיוטות שלי",   icon: <Edit3 className="w-4 h-4" /> },
  { id: "payment",   label: "פרטי תשלום",     icon: <Card className="w-4 h-4" /> },
];

// ── Downloads tab ─────────────────────────────────────────────────────────────
function DownloadsTab({ orders }: { orders: Order[] }) {
  const paidOrders = orders.filter(o => o.status === "paid");
  if (paidOrders.length === 0) {
    return (
      <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-primary/10">
        <Download className="w-12 h-12 text-primary/30 mx-auto mb-4" />
        <h2 className="font-serif text-xl text-foreground mb-2">עדיין אין הורדות</h2>
        <p className="text-muted-foreground mb-6 text-sm">לאחר תשלום, העיצובים שלכם יופיעו כאן להורדה חוזרת</p>
        <Link href="/"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">בחרו תבנית ועצבו</Button></Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {paidOrders.map((order, i) => (
        <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-card border border-green-500/20 rounded-xl p-4 flex items-center gap-4 hover:border-green-500/40 transition-colors">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{order.designName || "עיצוב ללא שם"}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              הזמנה #{order.id} · {formatDate(order.createdAt)} · {formatAmount(order.amount)}
            </p>
          </div>
          <div className="shrink-0">
            {order.designId ? (
              <Link href={`/editor/${order.templateId}?design=${order.designId}`}>
                <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs h-8">
                  <Download className="w-3.5 h-3.5" />הורד / ערוך
                </Button>
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">קובץ לא זמין</span>
            )}
          </div>
        </motion.div>
      ))}
      <p className="text-center text-xs text-muted-foreground pt-4">
        לחצו על "הורד / ערוך" כדי לפתוח את העיצוב בעורך ולהוריד את הקובץ הסופי
      </p>
    </div>
  );
}

// ── Orders tab ────────────────────────────────────────────────────────────────
function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-primary/10">
        <ShoppingBag className="w-12 h-12 text-primary/30 mx-auto mb-4" />
        <h2 className="font-serif text-xl text-foreground mb-2">אין הזמנות עדיין</h2>
        <p className="text-muted-foreground mb-6 text-sm">לאחר ביצוע הזמנה, היא תופיע כאן</p>
        <Link href="/"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">לגלריה התבניות</Button></Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {orders.map((order, i) => (
        <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="bg-card border border-primary/10 rounded-xl p-4 flex items-center gap-4 hover:border-primary/20 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{order.designName || "עיצוב ללא שם"}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              הזמנה #{order.id} · {formatDate(order.createdAt)} · {formatAmount(order.amount)}
            </p>
          </div>
          <div className="shrink-0">
            {order.status === "paid" && order.designId ? (
              <Link href={`/editor/${order.templateId}?design=${order.designId}`}>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 border-primary/20 text-primary hover:bg-primary/10">
                  <Download className="w-3.5 h-3.5" />הורד
                </Button>
              </Link>
            ) : order.status === "pending" && order.designId ? (
              <Link href={`/editor/${order.templateId}?design=${order.designId}`}>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 border-amber-500/30 text-amber-700 hover:bg-amber-50">
                  <CreditCard className="w-3.5 h-3.5" />לתשלום
                </Button>
              </Link>
            ) : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Drafts tab ────────────────────────────────────────────────────────────────
function DraftsTab({ drafts, deleting, onDelete }: { drafts: Design[]; deleting: number | null; onDelete: (id: number) => void }) {
  if (drafts.length === 0) {
    return (
      <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-primary/10">
        <Crown className="w-12 h-12 text-primary/30 mx-auto mb-4" />
        <h2 className="font-serif text-xl text-foreground mb-2">אין טיוטות</h2>
        <p className="text-muted-foreground mb-6 text-sm">בחרו תבנית מהגלריה והתחילו לערוך</p>
        <Link href="/"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">לגלריה התבניות</Button></Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {drafts.map((design, i) => {
        const template = templates.find(t => t.id === design.templateId);
        return (
          <motion.div key={design.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-primary/10 rounded-xl overflow-hidden hover:border-primary/30 transition-colors group">
            <div className="aspect-[3/2] bg-secondary/30 relative overflow-hidden">
              {template?.isGradient ? (
                <div className="absolute inset-0" style={{ background: template.image }} />
              ) : template?.image ? (
                <img src={template.image} alt={template.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B1833] to-[#1a2d5a]" />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                <Link href={`/editor/${design.templateId}?design=${design.id}`}>
                  <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />המשיכו לערוך
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{design.designName}</p>
                  <p className="text-xs text-muted-foreground truncate">{template?.title || design.templateId}</p>
                </div>
                <StatusBadge status={design.status} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-muted-foreground">{new Date(design.updatedAt).toLocaleDateString("he-IL")}</span>
                <div className="flex items-center gap-1">
                  <Link href={`/editor/${design.templateId}?design=${design.id}`}>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1">
                      <CreditCard className="w-3 h-3" />לתשלום
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    onClick={() => onDelete(design.id)} disabled={deleting === design.id}>
                    {deleting === design.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Payment tab ───────────────────────────────────────────────────────────────
function PaymentTab({ token }: { token: string }) {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hadar/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMethods(await res.json());
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm("להסיר כרטיס זה?")) return;
    setDeleting(id);
    try {
      await fetch(`${API_BASE}/api/hadar/payment-methods/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMethods(m => m.filter(x => x.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-start gap-2">
        <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">אבטחת תשלומים</span> — פרטי הכרטיס מאוחסנים אצל Stripe בצורה מוצפנת. לא נשמרים אצלנו פרטים רגישים.
        </div>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-primary/10">
          <Wallet className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-foreground mb-2">אין כרטיס שמור</h2>
          <p className="text-muted-foreground text-sm">כרטיסי אשראי שתשלמו בהם יופיעו כאן לשימוש עתידי מהיר</p>
        </div>
      ) : (
        <div className="space-y-2">
          {methods.map((pm, i) => (
            <motion.div key={pm.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-primary/10 rounded-xl px-4 py-3.5 flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-br from-[#0B1833] to-[#1a2d5a] rounded-md flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wide">{pm.brand}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{brandIcon(pm.brand)} •••• {pm.last4}</p>
                <p className="text-xs text-muted-foreground">
                  תוקף: {pm.expMonth?.toString().padStart(2, "0")}/{pm.expYear}
                  {pm.isDefault && <span className="mr-2 text-primary font-medium">ברירת מחדל</span>}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0"
                onClick={() => handleDelete(pm.id)} disabled={deleting === pm.id}>
                {deleting === pm.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pt-2">
        לעדכון כרטיס, בצעו עסקה חדשה עם הכרטיס הרצוי
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MyDesigns() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [, navigate] = useLocation();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("downloads");
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (isLoaded && !isSignedIn) { navigate("/sign-in"); }
  }, [isLoaded, isSignedIn]);

  const load = async () => {
    setLoading(true);
    try {
      const t = await getToken();
      setToken(t || "");
      const headers = { Authorization: `Bearer ${t}` };
      const [designsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/api/hadar/designs`, { headers }),
        fetch(`${API_BASE}/api/hadar/orders`, { headers }),
      ]);
      if (designsRes.ok) setDesigns(await designsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (err) {
      console.error("[HADAR] MyDesigns load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isSignedIn) load(); }, [isSignedIn]);

  const handleDelete = async (id: number) => {
    if (!confirm("למחוק עיצוב זה?")) return;
    setDeleting(id);
    try {
      const t = await getToken();
      await fetch(`${API_BASE}/api/hadar/designs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      setDesigns(d => d.filter(x => x.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const drafts = designs.filter(d => d.status !== "paid");
  const paidOrders = orders.filter(o => o.status === "paid");

  const badgeCounts: Partial<Record<Tab, number>> = {
    downloads: paidOrders.length,
    orders: orders.length,
    drafts: drafts.length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">
      {/* Header */}
      <header className="border-b border-primary/10 bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium hidden sm:inline">חזרה לגלריה</span>
          </Link>
          <Link href="/">
            <img src={hadarLogo} alt="הדר" style={{ height: 38, width: "auto", objectFit: "contain", cursor: "pointer" }} />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/support">
              <Button size="sm" variant="ghost" className="gap-1.5 h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                <MessageCircle className="w-3.5 h-3.5" />תמיכה
              </Button>
            </Link>
            <button onClick={load} title="רענן" className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-1">האזור האישי</h1>
            <p className="text-muted-foreground text-sm">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </p>
          </div>
          <Link href="/">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />עיצוב חדש
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 mb-6 p-1 bg-secondary/40 rounded-xl overflow-x-auto">
          {TABS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {icon}
              <span>{label}</span>
              {badgeCounts[id] !== undefined && badgeCounts[id]! > 0 && (
                <span className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold ${
                  id === "downloads" ? "bg-green-500 text-white" : "bg-primary/20 text-primary"
                }`}>{badgeCounts[id]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && tab !== "payment" ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === "downloads" && <motion.div key="downloads" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><DownloadsTab orders={orders} /></motion.div>}
            {tab === "orders"    && <motion.div key="orders"    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><OrdersTab orders={orders} /></motion.div>}
            {tab === "drafts"    && <motion.div key="drafts"    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><DraftsTab drafts={drafts} deleting={deleting} onDelete={handleDelete} /></motion.div>}
            {tab === "payment"   && <motion.div key="payment"   initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{token && <PaymentTab token={token} />}</motion.div>}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
