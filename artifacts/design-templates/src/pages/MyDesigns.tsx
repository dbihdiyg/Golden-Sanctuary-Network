import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { Link, useLocation } from "wouter";
import hadarLogo from "@/assets/logo-hadar.png";
import { Crown, Plus, Trash2, Edit3, Clock, CheckCircle, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { templates } from "@/lib/data";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");

interface Design {
  id: number;
  templateId: string;
  designName: string;
  status: "draft" | "paid" | "submitted";
  createdAt: string;
  updatedAt: string;
  fieldValues: Record<string, string>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-green-500/10 text-green-600 border border-green-500/20 rounded-full px-2 py-0.5 font-medium">
      <CheckCircle className="w-3 h-3" />שולם
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

export default function MyDesigns() {
  const { getToken } = useAuth();
  const [, navigate] = useLocation();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/hadar/designs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDesigns(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getToken]);

  const handleDelete = async (id: number) => {
    if (!confirm("למחוק עיצוב זה?")) return;
    setDeleting(id);
    try {
      const token = await getToken();
      await fetch(`${API_BASE}/api/hadar/designs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDesigns(d => d.filter(x => x.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">
      <header className="border-b border-primary/10 bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium hidden sm:inline">חזרה לגלריה</span>
          </Link>
          <Link href="/">
            <img src={hadarLogo} alt="הדר" style={{ height: 38, width: "auto", objectFit: "contain", cursor: "pointer" }} />
          </Link>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-1">העיצובים שלי</h1>
            <p className="text-muted-foreground">כל הטיוטות וההזמנות שיצרתם</p>
          </div>
          <Link href="/">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              עיצוב חדש
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-primary/10">
            <Crown className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <h2 className="font-serif text-xl text-foreground mb-2">עדיין אין עיצובים</h2>
            <p className="text-muted-foreground mb-6">בחרו תבנית מהגלריה והתחילו לערוך</p>
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                לגלריה התבניות
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.map((design, i) => {
              const template = templates.find(t => t.id === design.templateId);
              return (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-primary/10 rounded-xl overflow-hidden hover:border-primary/30 transition-colors group"
                >
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
                        <p className="font-semibold text-sm text-foreground truncate">{design.designName}</p>
                        <p className="text-xs text-muted-foreground truncate">{template?.title || design.templateId}</p>
                      </div>
                      <StatusBadge status={design.status} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(design.updatedAt).toLocaleDateString("he-IL")}
                      </span>
                      <div className="flex items-center gap-1">
                        {design.status === "draft" && (
                          <Link href={`/editor/${design.templateId}?design=${design.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary hover:bg-primary/10 gap-1">
                              <CreditCard className="w-3 h-3" />לתשלום
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(design.id)}
                          disabled={deleting === design.id}
                        >
                          {deleting === design.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
