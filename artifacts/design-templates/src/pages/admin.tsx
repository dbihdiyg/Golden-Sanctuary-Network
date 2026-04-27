import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import hadarLogo from "@/assets/logo-hadar.png";
import {
  Lock, Plus, Trash2, Edit2, Eye, Check, X, RefreshCw, ArrowRight,
  ChevronDown, ChevronUp, Loader2, AlertCircle, LogOut, Download,
  Film, Clock, BarChart3, DollarSign, Send, MessageSquare, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.BASE_URL.replace(/\/[^/]*\/?$/, "");

async function adminFetch(path: string, token: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...opts,
    headers: { "x-admin-secret": token, "Content-Type": "application/json", ...((opts.headers as any) || {}) },
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Tickets Manager ──────────────────────────────────────────────────────────
interface AdminTicket {
  id: number;
  clerkUserId: string;
  userEmail: string;
  subject: string;
  status: string;
  unreadAdmin: number;
  unreadUser: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminTicketMessage {
  id: number;
  ticketId: number;
  senderType: "user" | "admin";
  senderLabel: string;
  message: string;
  attachmentUrl: string | null;
  createdAt: string;
}

const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "פתוחה",
  in_progress: "בטיפול",
  closed: "סגורה",
};

const QUICK_REPLIES = [
  "תודה על פנייתך! הצוות שלנו יבחן את הבעיה ויחזור אליך בהקדם.",
  "הבעיה תוקנה! אנא נסו שוב וספרו לנו אם הכל תקין.",
  "על מנת לסייע לך, נשמח אם תוכלו לשלוח צילום מסך של הבעיה.",
  "הקובץ שלכם מוכן להורדה — אנא היכנסו לווידאו שלכם ולחצו על כפתור ההורדה.",
];

function TicketsManager({ token }: { token: string }) {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<AdminTicket | null>(null);
  const [messages, setMessages] = useState<AdminTicketMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/tickets`, {
        headers: { "x-admin-secret": token },
      });
      if (res.ok) setTickets(await res.json());
    } catch {}
    setLoading(false);
  };

  const loadTicket = async (ticket: AdminTicket) => {
    setActiveTicket(ticket);
    setMsgLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/tickets/${ticket.id}`, {
        headers: { "x-admin-secret": token },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTicket(data.ticket);
        setMessages(data.messages || []);
        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, unreadAdmin: 0 } : t));
      }
    } catch {}
    setMsgLoading(false);
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeTicket) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/tickets/${activeTicket.id}/messages`, {
        method: "POST",
        headers: { "x-admin-secret": token, "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setReply("");
        setTickets(prev => prev.map(t => t.id === activeTicket.id ? { ...t, status: "in_progress", updatedAt: new Date().toISOString() } : t));
      }
    } catch {}
    setSending(false);
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "x-admin-secret": token, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(prev => prev.map(t => t.id === id ? updated : t));
        if (activeTicket?.id === id) setActiveTicket(updated);
      }
    } catch {}
  };

  useEffect(() => { loadTickets(); }, []);

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.subject.includes(search) || t.userEmail.includes(search);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalUnread = tickets.reduce((n, t) => n + (t.unreadAdmin || 0), 0);

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-4 h-[620px]">
      <div className="bg-card border border-primary/10 rounded-xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-primary/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">פניות ({filtered.length})</span>
            {totalUnread > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-2 py-0.5">{totalUnread} חדש</span>
            )}
            <button onClick={loadTickets} className="text-muted-foreground hover:text-foreground p-1">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש פניות..."
            className="w-full border border-primary/10 rounded-lg px-2.5 py-1.5 text-xs bg-background focus:outline-none"
          />
          <div className="flex gap-1">
            {["all", "open", "in_progress", "closed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-primary/15 hover:border-primary/30"}`}>
                {s === "all" ? "הכל" : TICKET_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-primary/5">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-12">אין פניות</p>
          ) : (
            filtered.map(ticket => (
              <button key={ticket.id} onClick={() => loadTicket(ticket)}
                className={`w-full text-right px-3 py-2.5 hover:bg-primary/5 transition-colors ${activeTicket?.id === ticket.id ? "bg-primary/10" : ""}`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="font-medium text-xs truncate">{ticket.subject}</span>
                      {ticket.unreadAdmin > 0 && (
                        <span className="bg-primary text-primary-foreground text-[9px] font-bold rounded-full px-1.5 py-0.5">{ticket.unreadAdmin}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="truncate">{ticket.userEmail || ticket.clerkUserId.slice(0, 10)}</span>
                      <span className={`px-1.5 py-px rounded-full border ${
                        ticket.status === "open" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        ticket.status === "in_progress" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-green-50 text-green-700 border-green-200"
                      }`}>{TICKET_STATUS_LABELS[ticket.status] || ticket.status}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                      {new Date(ticket.updatedAt).toLocaleDateString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {activeTicket ? (
        <div className="bg-card border border-primary/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-primary/10 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{activeTicket.subject}</p>
              <p className="text-xs text-muted-foreground">{activeTicket.userEmail} · #{activeTicket.id}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {["open", "in_progress", "closed"].map(s => (
                <button key={s} onClick={() => updateStatus(activeTicket.id, s)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    activeTicket.status === s
                      ? s === "closed" ? "bg-green-500/20 text-green-700 border-green-400/40"
                        : s === "in_progress" ? "bg-amber-500/20 text-amber-700 border-amber-400/40"
                        : "bg-blue-500/20 text-blue-700 border-blue-400/40"
                      : "text-muted-foreground border-primary/15 hover:border-primary/30"
                  }`}>
                  {TICKET_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {msgLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
            ) : messages.map(msg => {
              const isUser = msg.senderType === "user";
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    isUser ? "bg-secondary/60 rounded-tr-sm" : "bg-primary text-primary-foreground rounded-tl-sm"
                  }`}>
                    {!isUser && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{msg.senderLabel}</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-[9px] mt-1 opacity-50">
                      {new Date(msg.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-3 py-1.5 border-t border-primary/5 flex gap-1.5 overflow-x-auto">
            {QUICK_REPLIES.map((qr, i) => (
              <button key={i} onClick={() => setReply(qr)}
                className="text-[10px] whitespace-nowrap px-2 py-0.5 border border-primary/15 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors shrink-0">
                {qr.slice(0, 28)}…
              </button>
            ))}
          </div>
          {activeTicket.status !== "closed" ? (
            <div className="border-t border-primary/10 flex gap-2 p-3">
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={2}
                placeholder="כתבו תגובה..."
                className="flex-1 border border-primary/15 rounded-xl px-3 py-2 text-sm bg-background resize-none focus:outline-none"
              />
              <Button size="sm" onClick={sendReply} disabled={sending || !reply.trim()}
                className="self-end gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                שלח
              </Button>
            </div>
          ) : (
            <div className="border-t border-primary/10 p-3 text-center text-xs text-muted-foreground">פנייה זו סגורה</div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-primary/10 rounded-xl flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">בחרו פנייה מהרשימה לצפייה ומענה</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Video Templates Manager ──────────────────────────────────────────────────

interface VideoFieldDef { id: string; label: string; type: "text" | "textarea"; defaultValue: string; placeholder: string; maxLength: number; required: boolean; }
interface VideoOverlay { fieldId: string; x: number; y: number; fontSize: number; fontColor: string; shadowColor: string; align: "left"|"center"|"right"; startTime: number; endTime: number; }
interface AeLayerMapping { fieldId: string; aeLayerName: string; aeProperty?: string; }
interface AdminVideoTemplate {
  id: number; slug: string; title: string; description: string; category: string; price: number;
  baseVideoUrl: string|null; previewVideoUrl: string|null; previewImageUrl: string|null;
  aeProjectUrl: string|null;
  fields: VideoFieldDef[]; overlays: VideoOverlay[];
  renderType: "ffmpeg" | "aefx";
  aeCompositionName: string|null;
  aeLayerMappings: AeLayerMapping[];
  tier: "standard" | "premium";
  maxRenderSeconds: number|null;
  renderPreset: string;
  renderCrf: number|null;
  videoDuration: number|null; videoWidth: number|null; videoHeight: number|null; isActive: boolean;
}

interface AdminVideoJob {
  id: number; status: string; userEmail: string|null; userName: string|null;
  templateId: number; templateTitle: string|null; templateSlug: string|null;
  stripePaymentIntentId: string|null; priority: string;
  progressPct: number; rendererUsed: string|null;
  outputUrl: string|null; errorMessage: string|null;
  createdAt: string; renderStartedAt: string|null; renderCompletedAt: string|null;
  queuePosition: number|null; isRendering: boolean;
}

function emptyField(): VideoFieldDef { return { id: crypto.randomUUID().slice(0,8), label: "", type: "text", defaultValue: "", placeholder: "", maxLength: 50, required: false }; }
function emptyOverlay(fieldId: string): VideoOverlay { return { fieldId, x: 50, y: 50, fontSize: 60, fontColor: "#FFFFFF", shadowColor: "#000000", align: "center", startTime: 0, endTime: 0 }; }

function VideoTemplatesManager({ token }: { token: string }) {
  const [templates, setTemplates] = useState<AdminVideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [editing, setEditing] = useState<Partial<AdminVideoTemplate>|null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string,boolean>>({});
  const [expandedId, setExpandedId] = useState<number|null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setTemplates(await adminFetch("/hadar/admin/video-templates", token)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const uploadFile = async (field: keyof AdminVideoTemplate, file: File) => {
    setUploading(u => ({ ...u, [field]: true }));
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${API_BASE}/api/hadar/admin/upload-video`, {
        method: "POST", headers: { "x-admin-secret": token }, body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setEditing(e => e ? { ...e, [field]: url } : e);
    } catch (err: any) { alert(`שגיאת העלאה: ${err.message}`); }
    finally { setUploading(u => ({ ...u, [field]: false })); }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const saved = await adminFetch(
        isNew ? "/hadar/admin/video-templates" : `/hadar/admin/video-templates/${editing.id}`,
        token,
        { method: isNew ? "POST" : "PATCH", body: JSON.stringify(editing) }
      );
      setTemplates(prev => isNew ? [saved, ...prev] : prev.map(t => t.id === saved.id ? saved : t));
      setEditing(null);
    } catch (err: any) { alert(`שגיאת שמירה: ${err.message}`); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("למחוק תבנית זו?")) return;
    await adminFetch(`/hadar/admin/video-templates/${id}`, token, { method: "DELETE" }).catch(() => {});
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const toggle = async (t: AdminVideoTemplate) => {
    const updated = await adminFetch(`/hadar/admin/video-templates/${t.id}`, token, { method: "PATCH", body: JSON.stringify({ isActive: !t.isActive }) }).catch(() => null);
    if (updated) setTemplates(prev => prev.map(x => x.id === t.id ? updated : x));
  };

  if (editing !== null) {
    const f = editing as Partial<AdminVideoTemplate>;
    const fields: VideoFieldDef[] = f.fields ?? [];
    const overlays: VideoOverlay[] = f.overlays ?? [];
    const layerMappings: AeLayerMapping[] = f.aeLayerMappings ?? [];

    const setField = (k: keyof AdminVideoTemplate, v: any) => setEditing(e => e ? { ...e, [k]: v } : e);
    const setFieldArr = (arr: VideoFieldDef[]) => setField("fields", arr);
    const setOverlayArr = (arr: VideoOverlay[]) => setField("overlays", arr);
    const setLayerArr = (arr: AeLayerMapping[]) => setField("aeLayerMappings", arr);

    return (
      <div className="space-y-6 bg-card border border-primary/10 rounded-xl p-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{f.id ? "עריכת תבנית וידאו" : "תבנית וידאו חדשה"}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>ביטול</Button>
            <Button onClick={save} disabled={saving} className="gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}שמור</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {([["title","כותרת"],["slug","slug (URL)"],["description","תיאור"],["category","קטגוריה"]] as [keyof AdminVideoTemplate, string][]).map(([k, l]) => (
            <div key={String(k)} className="space-y-1">
              <Label>{l}</Label>
              <Input value={String(f[k] ?? "")} onChange={e => setField(k, e.target.value)} className="bg-background" />
            </div>
          ))}
          <div className="space-y-1">
            <Label>מחיר (אגורות)</Label>
            <Input type="number" value={f.price ?? 4900} onChange={e => setField("price", Number(e.target.value))} className="bg-background" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label>רמה</Label>
            <select value={f.tier ?? "standard"} onChange={e => setField("tier", e.target.value)} className="w-full border border-primary/15 rounded-lg px-3 py-2 text-sm bg-background">
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>שם קומפוזיציה AE</Label>
            <Input value={f.aeCompositionName ?? ""} onChange={e => setField("aeCompositionName", e.target.value)} className="bg-background" dir="ltr" placeholder="MAIN_COMP" />
          </div>
          <div className="space-y-1">
            <Label>זמן רינדור מקסימלי (שניות)</Label>
            <Input type="number" value={f.maxRenderSeconds ?? 600} onChange={e => setField("maxRenderSeconds", Number(e.target.value))} className="bg-background" dir="ltr" />
          </div>
        </div>

        {/* AE Project file upload */}
        <div className="space-y-2">
          <Label>קובץ פרויקט After Effects (.aep / .zip)</Label>
          <div className="flex items-center gap-3">
            {f.aeProjectUrl && <a href={f.aeProjectUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate max-w-xs">קישור קיים</a>}
            <label className="cursor-pointer">
              <input type="file" accept=".aep,.zip" className="hidden" onChange={e => e.target.files?.[0] && uploadFile("aeProjectUrl", e.target.files[0])} />
              <Button variant="outline" size="sm" asChild disabled={uploading.aeProjectUrl}>
                <span>{uploading.aeProjectUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : "העלה קובץ AE"}</span>
              </Button>
            </label>
          </div>
        </div>

        {/* Preview files */}
        <div className="grid md:grid-cols-3 gap-4">
          {([["previewVideoUrl","וידאו תצוגה","video/*"],["previewImageUrl","תמונת תצוגה","image/*"],["baseVideoUrl","וידאו בסיס","video/*"]] as [keyof AdminVideoTemplate, string, string][]).map(([k, l, accept]) => (
            <div key={String(k)} className="space-y-1">
              <Label>{l}</Label>
              <div className="flex items-center gap-2">
                {f[k] && <a href={String(f[k])} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">קישור</a>}
                <label className="cursor-pointer">
                  <input type="file" accept={accept} className="hidden" onChange={e => e.target.files?.[0] && uploadFile(k, e.target.files[0])} />
                  <Button variant="outline" size="sm" asChild disabled={!!uploading[String(k)]}>
                    <span>{uploading[String(k)] ? <Loader2 className="w-3 h-3 animate-spin" /> : "העלה"}</span>
                  </Button>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">שדות טקסט</Label>
            <Button size="sm" variant="outline" onClick={() => setFieldArr([...fields, emptyField()])} className="gap-1"><Plus className="w-3 h-3" />הוסף שדה</Button>
          </div>
          {fields.map((fd, i) => (
            <div key={fd.id} className="border border-primary/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={fd.label} onChange={e => setFieldArr(fields.map((x,j) => j===i ? {...x, label: e.target.value} : x))} placeholder="תווית שדה" className="flex-1 bg-background text-sm" />
                <select value={fd.type} onChange={e => setFieldArr(fields.map((x,j) => j===i ? {...x, type: e.target.value as any} : x))} className="border border-primary/15 rounded-lg px-2 py-1 text-sm bg-background">
                  <option value="text">טקסט</option>
                  <option value="textarea">אזור טקסט</option>
                </select>
                <Button size="sm" variant="ghost" onClick={() => setFieldArr(fields.filter((_,j) => j!==i))} className="text-destructive h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input value={fd.placeholder} onChange={e => setFieldArr(fields.map((x,j) => j===i ? {...x, placeholder: e.target.value} : x))} placeholder="placeholder" className="bg-background text-xs" />
                <Input value={fd.defaultValue} onChange={e => setFieldArr(fields.map((x,j) => j===i ? {...x, defaultValue: e.target.value} : x))} placeholder="ערך ברירת מחדל" className="bg-background text-xs" />
              </div>
            </div>
          ))}
        </div>

        {/* AE Layer Mappings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">מיפוי שכבות AE</Label>
            <Button size="sm" variant="outline" onClick={() => setLayerArr([...layerMappings, { fieldId: fields[0]?.id ?? "", aeLayerName: "" }])} className="gap-1"><Plus className="w-3 h-3" />הוסף מיפוי</Button>
          </div>
          {layerMappings.map((lm, i) => (
            <div key={i} className="border border-primary/10 rounded-lg p-3 grid grid-cols-3 gap-2 items-center">
              <select value={lm.fieldId} onChange={e => setLayerArr(layerMappings.map((x,j) => j===i ? {...x, fieldId: e.target.value} : x))} className="border border-primary/15 rounded-lg px-2 py-1.5 text-sm bg-background">
                {fields.map(fd => <option key={fd.id} value={fd.id}>{fd.label || fd.id}</option>)}
              </select>
              <Input value={lm.aeLayerName} onChange={e => setLayerArr(layerMappings.map((x,j) => j===i ? {...x, aeLayerName: e.target.value} : x))} placeholder="שם שכבה ב-AE" className="bg-background text-sm" dir="ltr" />
              <Button size="sm" variant="ghost" onClick={() => setLayerArr(layerMappings.filter((_,j) => j!==i))} className="text-destructive h-8 w-8 p-0"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-primary/10">
          <Button variant="ghost" onClick={() => setEditing(null)}>ביטול</Button>
          <Button onClick={save} disabled={saving} className="gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}שמור תבנית</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2"><Film className="w-5 h-5 text-primary" />תבניות וידאו ({templates.length})</h2>
        <div className="flex gap-2">
          {error && <Button variant="ghost" size="sm" onClick={load} className="gap-1 text-destructive"><RefreshCw className="w-3.5 h-3.5" />נסה שוב</Button>}
          <Button size="sm" onClick={() => setEditing({ fields: [], overlays: [], aeLayerMappings: [], isActive: true, renderType: "aefx", tier: "standard", price: 4900, maxRenderSeconds: 600 })} className="gap-1">
            <Plus className="w-4 h-4" />תבנית חדשה
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Film className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>אין תבניות וידאו עדיין</p>
          <Button size="sm" className="mt-4 gap-1" onClick={() => setEditing({ fields: [], overlays: [], aeLayerMappings: [], isActive: true, renderType: "aefx", tier: "standard", price: 4900, maxRenderSeconds: 600 })}>
            <Plus className="w-3.5 h-3.5" />צור תבנית ראשונה
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-card border border-primary/10 rounded-xl overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {t.previewImageUrl && (
                    <img src={t.previewImageUrl} alt={t.title} className="w-16 h-10 object-cover rounded-lg shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{t.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${t.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground border-muted/30"}`}>
                        {t.isActive ? "פעיל" : "מושבת"}
                      </span>
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t.tier}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">AE</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.slug} · ₪{(t.price/100).toFixed(0)} · {t.fields.length} שדות</p>
                    {t.aeProjectUrl ? (
                      <p className="text-[10px] text-green-600 mt-0.5">✓ קובץ AE מועלה</p>
                    ) : (
                      <p className="text-[10px] text-amber-600 mt-0.5">⚠ חסר קובץ AE</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => toggle(t)} className={`h-8 w-8 p-0 ${t.isActive ? "text-green-500" : "text-muted-foreground"}`}>
                    {t.isActive ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-40" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(t)} className="h-8 w-8 p-0"><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="h-8 w-8 p-0">
                    {expandedId === t.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => del(t.id)} className="h-8 w-8 p-0 text-destructive/60 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              {expandedId === t.id && (
                <div className="px-4 pb-4 border-t border-primary/5 pt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">קומפוזיציה: </span>{t.aeCompositionName || "—"}</div>
                    <div><span className="text-muted-foreground">זמן מקסימלי: </span>{t.maxRenderSeconds ?? 600}s</div>
                  </div>
                  {t.fields.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.fields.map(fd => (
                        <span key={fd.id} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">{fd.label}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Video Jobs Manager ───────────────────────────────────────────────────────

const JOB_STATUS_COLORS: Record<string, string> = {
  pending:   "text-muted-foreground bg-muted/10 border-muted/20",
  paid:      "text-blue-600 bg-blue-50 border-blue-200",
  queued:    "text-cyan-600 bg-cyan-50 border-cyan-200",
  rendering: "text-amber-600 bg-amber-50 border-amber-200",
  ready:     "text-green-600 bg-green-50 border-green-200",
  failed:    "text-red-600 bg-red-50 border-red-200",
};

const JOB_STATUS_LABELS: Record<string, string> = {
  pending: "ממתין לתשלום", paid: "שולם", queued: "בתור", rendering: "מרנדר", ready: "מוכן", failed: "נכשל",
};

function VideoJobsManager({ token }: { token: string }) {
  const [jobs, setJobs] = useState<AdminVideoJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [retrying, setRetrying] = useState<number|null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setJobs(await adminFetch("/hadar/admin/video-jobs", token)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const retry = async (jobId: number) => {
    setRetrying(jobId);
    try { await adminFetch(`/hadar/admin/video-jobs/${jobId}/retry`, token, { method: "POST" }); await load(); }
    catch (e: any) { alert(`שגיאה: ${e.message}`); }
    finally { setRetrying(null); }
  };

  const filtered = statusFilter === "all" ? jobs : jobs.filter(j => j.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />עבודות וידאו ({filtered.length})</h2>
        <div className="flex items-center gap-2">
          {error && (
            <Button variant="ghost" size="sm" onClick={load} className="gap-1 text-destructive">
              <RefreshCw className="w-3.5 h-3.5" />נסה שוב
            </Button>
          )}
          <div className="flex gap-1 flex-wrap">
            {["all","paid","queued","rendering","ready","failed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-primary/15 hover:border-primary/30"}`}>
                {s === "all" ? "הכל" : JOB_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <Button size="sm" variant="ghost" onClick={load} className="h-8 w-8 p-0"><RefreshCw className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">אין עבודות וידאו בסטטוס זה</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(job => (
            <div key={job.id} className="bg-card border border-primary/10 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{job.templateTitle || `תבנית #${job.templateId}`}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${JOB_STATUS_COLORS[job.status] ?? ""}`}>
                      {JOB_STATUS_LABELS[job.status] ?? job.status}
                    </span>
                    {job.isRendering && <span className="text-[10px] text-amber-600 animate-pulse">● מרנדר...</span>}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>{job.userEmail ?? "—"} · #{job.id}</p>
                    <p>{new Date(job.createdAt).toLocaleDateString("he-IL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                    {job.errorMessage && (
                      <p className="text-destructive text-[11px] mt-1 bg-destructive/5 rounded px-2 py-1 border border-destructive/10">{job.errorMessage}</p>
                    )}
                  </div>
                  {job.status === "rendering" && job.progressPct != null && (
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>התקדמות</span><span>{job.progressPct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${job.progressPct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {job.status === "failed" && (
                    <Button size="sm" variant="outline" onClick={() => retry(job.id)} disabled={retrying === job.id} className="gap-1 h-8 text-xs">
                      {retrying === job.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}נסה שוב
                    </Button>
                  )}
                  {job.outputUrl && (
                    <a href={`${API_BASE}${job.outputUrl}`} download target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="gap-1 h-8 text-xs">
                        <Download className="w-3 h-3" />הורד
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Video Section ────────────────────────────────────────────────────────────

function VideoSection({ token }: { token: string }) {
  const [sub, setSub] = useState<"templates" | "jobs">("templates");
  return (
    <div className="space-y-4">
      <div className="flex border-b border-primary/10 gap-0" dir="rtl">
        {([["templates","תבניות"], ["jobs","עבודות"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)}
            className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors ${sub === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {l}
          </button>
        ))}
      </div>
      {sub === "templates" && <VideoTemplatesManager token={token} />}
      {sub === "jobs"      && <VideoJobsManager      token={token} />}
    </div>
  );
}

// ─── Video Stats ──────────────────────────────────────────────────────────────

interface VideoStats {
  totalJobs: number;
  paidJobs: number;
  queuedJobs: number;
  renderingJobs: number;
  readyJobs: number;
  failedJobs: number;
  nexrenderConfigured: boolean;
}

function StatsSection({ token }: { token: string }) {
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setStats(await adminFetch("/hadar/admin/video-stats", token)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (error) return (
    <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
      <AlertCircle className="w-5 h-5" />{error}
      <Button size="sm" variant="ghost" onClick={load} className="mr-auto gap-1"><RefreshCw className="w-3.5 h-3.5" />נסה שוב</Button>
    </div>
  );
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {!stats.nexrenderConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">NEXRENDER_API_URL לא מוגדר</p>
            <p className="text-sm mt-0.5">כדי לאפשר רינדור וידאו After Effects, יש להגדיר את משתנה הסביבה <code className="bg-amber-100 px-1 rounded">NEXRENDER_API_URL</code> עם כתובת ה-nexrender server שלכם.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "סה\"כ עבודות", value: stats.totalJobs, color: "text-primary", icon: Film },
          { label: "שולמו (ממתינים)", value: stats.paidJobs, color: "text-blue-500", icon: Clock },
          { label: "בתור", value: stats.queuedJobs, color: "text-cyan-500", icon: Clock },
          { label: "מרנדרים", value: stats.renderingJobs, color: "text-amber-500", icon: Loader2 },
          { label: "מוכנים", value: stats.readyJobs, color: "text-green-500", icon: Check },
          { label: "נכשלו", value: stats.failedJobs, color: "text-destructive", icon: AlertCircle },
        ].map(s => (
          <div key={s.label} className="bg-card border border-primary/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground text-xs">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-primary/10 rounded-xl p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />מידע על מנוע הרינדור</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between py-1.5 border-b border-primary/5">
            <span className="text-muted-foreground">סוג רינדור</span>
            <span className="font-medium">After Effects (Nexrender)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-primary/5">
            <span className="text-muted-foreground">NEXRENDER_API_URL</span>
            <span className={`font-medium ${stats.nexrenderConfigured ? "text-green-600" : "text-amber-600"}`}>
              {stats.nexrenderConfigured ? "✓ מוגדר" : "✗ לא מוגדר"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
type Tab = "videos" | "tickets" | "stats";

export default function Admin() {
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem("hadar_admin_token"));
  const [tab, setTab] = useState<Tab>("videos");
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!pw.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/hadar/admin/auth`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (!res.ok) { setPwError("סיסמה שגויה"); return; }
      const { token: t } = await res.json();
      setToken(t); sessionStorage.setItem("hadar_admin_token", t);
    } catch { setPwError("שגיאת חיבור"); }
  }

  function logout() { setToken(null); sessionStorage.removeItem("hadar_admin_token"); }

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-primary/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={hadarLogo} alt="הדר" style={{ height: 64, width: "auto", objectFit: "contain" }} />
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Lock className="w-4 h-4" /><span>כניסה לממשק ניהול</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>סיסמת אדמין</Label>
              <Input type="password" dir="ltr" value={pw}
                onChange={e => { setPw(e.target.value); setPwError(""); }}
                onKeyDown={e => e.key === "Enter" && login()}
                className={`h-11 bg-background border ${pwError ? "border-red-500" : "border-primary/20"}`}
                placeholder="הכניסו סיסמה" />
              {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
            </div>
            <Button onClick={login} className="w-full h-11 bg-primary text-primary-foreground font-bold">כניסה</Button>
            <Link href="/"><p className="text-center text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">חזרה לאתר</p></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir="rtl">
      <header className="border-b border-primary/10 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={hadarLogo} alt="הדר" style={{ height: 32, width: "auto", objectFit: "contain" }} />
            <span className="text-muted-foreground text-sm border-r border-primary/20 pr-3 mr-1">ממשק ניהול</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><Eye className="w-4 h-4" /> צפה באתר</Button></Link>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-destructive"><LogOut className="w-4 h-4" /> יציאה</Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-0 mb-6 border-b border-primary/10 overflow-x-auto">
          {([["videos","וידאו"],["tickets","פניות"],["stats","סטטיסטיקות"]] as [Tab,string][]).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "videos" && (
            <motion.div key="videos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <VideoSection token={token} />
            </motion.div>
          )}
          {tab === "tickets" && (
            <motion.div key="tickets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TicketsManager token={token} />
            </motion.div>
          )}
          {tab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StatsSection token={token} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
