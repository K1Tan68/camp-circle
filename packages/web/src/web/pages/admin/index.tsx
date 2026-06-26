import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { authClient, clearToken } from "../../lib/auth";
import { useLocation } from "wouter";
import { LogOut, Calendar, Camera, BookOpen, Users, Link, Trash2, Plus, Edit2, Check, X, Upload, Type, Mail } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = "texts" | "events" | "photos" | "posts" | "members" | "invites" | "emails";

// ── Admin Shell ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const [tab, setTab] = useState<Tab>("events");
  const [userRole, setUserRole] = useState<string>("viewer");

  useEffect(() => {
    fetch("/api/admin/me/role", {
      headers: { Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}` },
    })
      .then(r => r.json())
      .then((d: any) => setUserRole(d.role ?? "viewer"))
      .catch(() => {});
  }, [session]);

  const handleSignOut = async () => {
    await authClient.signOut();
    clearToken();
    navigate("/");
  };

  const isAdmin = userRole === "admin";
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "events", label: "スケジュール", icon: <Calendar size={16} /> },
    { id: "photos", label: "ギャラリー", icon: <Camera size={16} /> },
    { id: "posts", label: "活動報告", icon: <BookOpen size={16} /> },
    { id: "texts", label: "テキスト編集", icon: <Type size={16} /> },
    ...(isAdmin ? [
      { id: "emails" as Tab, label: "メール管理", icon: <Mail size={16} /> },
      { id: "members" as Tab, label: "メンバー", icon: <Users size={16} /> },
    ] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0ebe0", fontFamily: "'Lato', sans-serif" }}>
      {/* Top bar */}
      <div style={{ backgroundColor: "var(--color-forest)", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.25rem" }}>⛺</span>
          <span style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-cream)", fontWeight: 600 }}>管理画面</span>
          <span style={{ backgroundColor: isAdmin ? "var(--color-orange)" : "var(--color-moss)", color: "white", fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "2px", letterSpacing: "0.1em" }}>
            {isAdmin ? "ADMIN" : "EDITOR"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "var(--color-sky)", fontSize: "0.85rem" }}>{session?.user?.name}</span>
          <button onClick={handleSignOut} style={{ background: "none", border: "none", color: "var(--color-sand)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
            <LogOut size={14} /> ログアウト
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)", flexDirection: window.innerWidth < 768 ? "column" : "row" }}>
        {/* Sidebar */}
        <div style={{ width: window.innerWidth < 768 ? "100%" : "200px", backgroundColor: "var(--color-dusk)", flexShrink: 0, padding: window.innerWidth < 768 ? "1rem" : "1.5rem 0", position: "relative", display: "grid", gridAutoFlow: window.innerWidth < 768 ? "column" : "row", gridAutoColumns: window.innerWidth < 768 ? "1fr" : undefined, overflowX: window.innerWidth < 768 ? "auto" : undefined }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1.5rem", background: tab === t.id ? "rgba(255,255,255,0.1)" : "none", border: "none", cursor: "pointer", color: tab === t.id ? "var(--color-cream)" : "var(--color-sky)", fontSize: "0.875rem", textAlign: "left", borderLeft: tab === t.id ? "3px solid var(--color-orange)" : "3px solid transparent", transition: "all 0.15s" }}>
              {t.icon} {t.label}
            </button>
          ))}
          {window.innerWidth >= 768 && (
            <div style={{ padding: "1.5rem", position: "absolute", bottom: 0 }}>
              <a href="/" target="_blank" style={{ color: "var(--color-earth)", fontSize: "0.75rem", textDecoration: "none" }}>サイトを見る →</a>
            </div>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: window.innerWidth < 768 ? "1rem" : "2rem", overflow: "auto" }}>
          {tab === "texts" && <SiteTextsPanel />}
          {tab === "events" && <EventsPanel />}
          {tab === "photos" && <PhotosPanel />}
          {tab === "posts" && <PostsPanel />}
          {tab === "emails" && isAdmin && <EmailsPanel />}
          {tab === "members" && isAdmin && <MembersPanel />}
          {tab === "invites" && isAdmin && <InvitesPanel />}
        </div>
      </div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = { backgroundColor: "white", padding: "1.5rem", marginBottom: "1px" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.6rem 0.8rem", border: "1.5px solid #ddd", fontFamily: "'Lato',sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" };
const btnStyle = (color = "var(--color-forest)"): React.CSSProperties => ({ background: color, color: "white", border: "none", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Lato',sans-serif", fontWeight: 700, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.4rem" });

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", margin: 0 }}>{title}</h2>
      <button style={btnStyle("var(--color-orange)")} onClick={onAdd}><Plus size={14} /> 追加</button>
    </div>
  );
}

// ── Site Texts ────────────────────────────────────────────────────────────────
function SiteTextsPanel() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["site-texts"],
    queryFn: async () => {
      const res = await fetch("/api/site-texts");
      return res.json();
    },
  });

  const texts: any[] = (data as any)?.texts ?? [];

  const handleChange = (key: string, value: string) => {
    setLocalValues(v => ({ ...v, [key]: value }));
  };

  const handleSave = async (key: string) => {
    const value = localValues[key] ?? texts.find((t: any) => t.key === key)?.value ?? "";
    setSaving(key);
    try {
      await fetch(`/api/site-texts/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}`,
        },
        body: JSON.stringify({ value }),
      });
      qc.invalidateQueries({ queryKey: ["site-texts"] });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) return <p>読み込み中...</p>;

  // Group by section
  const groups: { label: string; keys: string[] }[] = [
    { label: "ヒーローセクション", keys: ["hero_title", "hero_subtitle"] },
    { label: "Aboutセクション", keys: ["about_title", "about_body"] },
    { label: "加入・SNS", keys: ["join_title", "join_body", "join_instagram", "join_twitter", "join_line"] },
    { label: "フッター", keys: ["footer_message"] },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", marginBottom: "0.5rem" }}>テキスト編集</h2>
      <p style={{ color: "var(--color-earth)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>サイト上のテキストをここから直接編集できます。保存するとサイトに即反映されます。</p>

      {groups.map(g => {
        const groupTexts = g.keys.map(k => texts.find((t: any) => t.key === k)).filter(Boolean);
        if (groupTexts.length === 0) return null;
        return (
          <div key={g.label} style={{ marginBottom: "2rem" }}>
            <h3 style={{ color: "var(--color-forest)", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", borderBottom: "2px solid var(--color-sand)", paddingBottom: "0.4rem" }}>{g.label}</h3>
            {groupTexts.map((t: any) => {
              const isMultiline = t.key.includes("body") || t.key.includes("subtitle");
              const currentValue = localValues[t.key] !== undefined ? localValues[t.key] : t.value;
              const isDirty = localValues[t.key] !== undefined && localValues[t.key] !== t.value;
              return (
                <div key={t.key} style={{ ...cardStyle, marginBottom: "0.75rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-earth)", display: "block", marginBottom: "0.4rem" }}>
                    {t.label}
                    <span style={{ fontWeight: 400, marginLeft: "0.5rem", color: "#aaa", fontFamily: "monospace", fontSize: "0.7rem" }}>{t.key}</span>
                  </label>
                  {isMultiline ? (
                    <textarea
                      rows={3}
                      value={currentValue}
                      onChange={e => handleChange(t.key, e.target.value)}
                      style={{ ...inputStyle, resize: "vertical", borderColor: isDirty ? "var(--color-orange)" : "#ddd" }}
                    />
                  ) : (
                    <input
                      value={currentValue}
                      onChange={e => handleChange(t.key, e.target.value)}
                      style={{ ...inputStyle, borderColor: isDirty ? "var(--color-orange)" : "#ddd" }}
                    />
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button
                      style={btnStyle(isDirty ? "var(--color-orange)" : "#aaa")}
                      onClick={() => handleSave(t.key)}
                      disabled={saving === t.key || !isDirty}
                    >
                      {saving === t.key ? "保存中..." : saved === t.key ? <><Check size={13} /> 保存完了</> : <><Check size={13} /> 保存</>}
                    </button>
                    {isDirty && (
                      <button
                        style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "0.8rem" }}
                        onClick={() => setLocalValues(v => { const n = { ...v }; delete n[t.key]; return n; })}
                      >
                        元に戻す
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Events ────────────────────────────────────────────────────────────────────
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

// ─ EventsPanel with inline edit mode (contenteditable) ─
function EventsPanel() {
  const qc = useQueryClient();
  const [year, setYear] = useState(new Date().getFullYear());
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Record<number, any>>({});
  const blank = { month: "4月", monthNum: 4, date: "", title: "", location: "", description: "", year };

  const { data, isLoading } = useQuery({
    queryKey: ["events", year],
    queryFn: async () => (await api.events.$get({ query: { year: String(year) } })).json(),
  });

  const save = useMutation({
    mutationFn: async (ev: any) => {
      if (ev.id) {
        await api.events[":id"].$put({ param: { id: String(ev.id) }, json: ev });
      } else {
        await api.events.$post({ json: ev });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); setEditing(null); setAdding(false); setDraft({}); setEditMode(false); },
  });

  const del = useMutation({
    mutationFn: async (id: number) => api.events[":id"].$delete({ param: { id: String(id) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  const saveLightMode = async () => {
    for (const [idStr, updatedEv] of Object.entries(draft)) {
      await save.mutateAsync(updatedEv);
    }
  };

  const EventForm = ({ initial, onCancel }: { initial: any; onCancel: () => void }) => {
    const [form, setForm] = useState({ ...initial });
    return (
      <div style={{ ...cardStyle, border: "2px solid var(--color-orange)", marginBottom: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>月</label>
            <select value={form.month} onChange={e => { const idx = MONTHS.indexOf(e.target.value); setForm((f: any) => ({ ...f, month: e.target.value, monthNum: idx + 1 })); }}
              style={inputStyle}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>年</label>
            <input type="number" value={form.year} onChange={e => setForm((f: any) => ({ ...f, year: parseInt(e.target.value) }))} style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>日付（任意）</label>
            <input type="text" value={form.date ?? ""} onChange={e => setForm((f: any) => ({ ...f, date: e.target.value }))} placeholder="20〜21" style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>タイトル <span style={{ color: "#e44" }}>*</span></label>
            <input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="夏合宿 in 道志の森" style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>場所</label>
            <input value={form.location} onChange={e => setForm((f: any) => ({ ...f, location: e.target.value }))} placeholder="山梨県・道志の森" style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>説明</label>
            <textarea rows={2} value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={btnStyle("var(--color-forest)")} onClick={() => save.mutate(form)} disabled={save.isPending || !form.title}>
            <Check size={13} /> {save.isPending ? "保存中..." : "保存"}
          </button>
          <button style={btnStyle("#888")} onClick={onCancel}><X size={13} /> キャンセル</button>
        </div>
      </div>
    );
  };

  const events = (data as any)?.events ?? [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", margin: 0 }}>年間スケジュール</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ ...inputStyle, width: "auto" }}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
          </select>
          
          {editMode && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button style={btnStyle("var(--color-forest)")} onClick={saveLightMode} disabled={save.isPending || Object.keys(draft).length === 0}>
                <Check size={14} /> 保存 ({Object.keys(draft).length})
              </button>
              <button style={btnStyle("#dc2626")} onClick={() => { setEditMode(false); setDraft({}); }}>
                <X size={14} /> 終了
              </button>
            </div>
          )}
          
          {!editMode && (
            <>
              <button style={btnStyle("var(--color-moss)")} onClick={() => setEditMode(true)}>
                ✏️ クイック編集
              </button>
              <button style={btnStyle("var(--color-orange)")} onClick={() => setAdding(true)}>
                <Plus size={14} /> 追加
              </button>
            </>
          )}
        </div>
      </div>

      {editMode && (
        <div style={{ backgroundColor: "#fffaed", border: "1px solid var(--color-sand)", padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "4px" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-forest)", margin: "0 0 0.5rem", fontWeight: 700 }}>💡 各行をクリック → テキスト編集 → 「保存」で確定</p>
        </div>
      )}

      {adding && <EventForm initial={{ ...blank, year }} onCancel={() => setAdding(false)} />}
      {isLoading ? <p>読み込み中...</p> : events.map((ev: any) => {
        if (editMode) {
          const d = draft[ev.id] ?? ev;
          return (
            <div key={ev.id} style={{ ...cardStyle, display: "grid", gridTemplateColumns: "80px 1.5fr 120px 150px 40px", gap: "0.75rem", alignItems: "center" }}>
              <div contentEditable suppressContentEditableWarning onBlur={e => setDraft(dr => ({ ...dr, [ev.id]: { ...d, month: e.currentTarget.textContent || d.month } }))} 
                style={{ padding: "0.5rem", border: "1px solid #ddd", cursor: "text", fontWeight: 700, color: "var(--color-orange)", borderRadius: "2px", minHeight: "1em" }}>
                {d.month}
              </div>
              <div contentEditable suppressContentEditableWarning onBlur={e => setDraft(dr => ({ ...dr, [ev.id]: { ...d, title: e.currentTarget.textContent || d.title } }))}
                style={{ padding: "0.5rem", border: "1px solid #ddd", cursor: "text", fontWeight: 700, color: "var(--color-forest)", borderRadius: "2px", minHeight: "1em" }}>
                {d.title}
              </div>
              <div contentEditable suppressContentEditableWarning onBlur={e => setDraft(dr => ({ ...dr, [ev.id]: { ...d, date: e.currentTarget.textContent || d.date } }))}
                style={{ padding: "0.5rem", border: "1px solid #ddd", cursor: "text", fontSize: "0.85rem", color: "var(--color-orange)", borderRadius: "2px", minHeight: "1em" }}>
                {d.date || "―"}
              </div>
              <div contentEditable suppressContentEditableWarning onBlur={e => setDraft(dr => ({ ...dr, [ev.id]: { ...d, location: e.currentTarget.textContent || d.location } }))}
                style={{ padding: "0.5rem", border: "1px solid #ddd", cursor: "text", fontSize: "0.85rem", color: "var(--color-earth)", borderRadius: "2px", minHeight: "1em" }}>
                {d.location || "―"}
              </div>
              <button onClick={() => { if (confirm(`「${d.title}」を削除しますか？`)) del.mutate(ev.id); }} style={{ background: "none", border: "1px solid #fca5a5", padding: "0.3rem 0.6rem", cursor: "pointer", color: "#dc2626", borderRadius: "2px" }}>
                <Trash2 size={13} />
              </button>
            </div>
          );
        }
        
        return editing?.id === ev.id
          ? <EventForm key={ev.id} initial={editing} onCancel={() => setEditing(null)} />
          : (
            <div key={ev.id} style={{ ...cardStyle, display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-orange)", fontSize: "1.1rem", fontWeight: 700, minWidth: "2.5rem" }}>{ev.month}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: "var(--color-forest)", margin: "0 0 0.2rem" }}>{ev.title}</p>
                {ev.date && <p style={{ color: "var(--color-orange)", fontSize: "0.8rem", margin: "0 0 0.2rem", fontWeight: 600 }}>🗓 {ev.date}</p>}
                {ev.location && <p style={{ color: "var(--color-earth)", fontSize: "0.8rem", margin: "0 0 0.2rem" }}>📍 {ev.location}</p>}
                {ev.description && <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>{ev.description}</p>}
              </div>
              {!editMode && (
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button onClick={() => setEditing(ev)} style={{ background: "none", border: "1px solid #ddd", padding: "0.3rem 0.6rem", cursor: "pointer", color: "var(--color-forest)" }}><Edit2 size={13} /></button>
                  <button onClick={() => { if (confirm(`「${ev.title}」を削除しますか？`)) del.mutate(ev.id); }} style={{ background: "none", border: "1px solid #fca5a5", padding: "0.3rem 0.6rem", cursor: "pointer", color: "#dc2626" }}><Trash2 size={13} /></button>
                </div>
              )}
            </div>
          );
      })}
      {!isLoading && events.length === 0 && !editMode && (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-earth)", padding: "3rem" }}>
          <Calendar size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <p>この年のイベントはまだありません。「追加」から登録しましょう。</p>
        </div>
      )}
    </div>
  );
}
function PhotosPanel() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [meta, setMeta] = useState({ eventTitle: "", month: "8月", monthNum: 8, year: new Date().getFullYear(), location: "", takenAt: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [filterMonth, setFilterMonth] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => (await api.photos.$get()).json(),
  });

  const del = useMutation({
    mutationFn: async (id: number) => api.photos[":id"].$delete({ param: { id: String(id) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["photos"] }),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    if (!list.length) return;
    setFiles(list);
    const readers = list.map(file => new Promise<string>(res => {
      const r = new FileReader();
      r.onload = ev => res(ev.target?.result as string);
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(setPreviews);
  };

  const resetUpload = () => {
    setFiles([]); setPreviews([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    try {
      let order = 0;
      for (const file of files) {
        const presignRes = await api.photos.presign.$post({ json: { filename: file.name, contentType: file.type } });
        const { url, key } = await presignRes.json() as any;
        await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        await api.photos.$post({ json: { s3Key: key, eventTitle: meta.eventTitle, month: meta.month, monthNum: meta.monthNum, year: meta.year, location: meta.location, takenAt: meta.takenAt, caption: meta.eventTitle, order: order++ } });
        setProgress(p => ({ ...p, done: p.done + 1 }));
      }
      qc.invalidateQueries({ queryKey: ["photos"] });
      resetUpload();
    } finally {
      setUploading(false);
    }
  };

  const photos = (data as any)?.photos ?? [];
  const filtered = filterMonth === "all" ? photos : photos.filter((p: any) => p.month === filterMonth);
  // 月ごとにグループ化
  const grouped: Record<string, any[]> = {};
  for (const p of filtered) {
    const k = p.month || "その他";
    (grouped[k] ??= []).push(p);
  }
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    const ai = MONTHS.indexOf(a), bi = MONTHS.indexOf(b);
    return bi - ai;
  });

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", marginBottom: "1.25rem" }}>ギャラリー（サークル企画の写真）</h2>

      {/* アップロードエリア */}
      <div style={{ ...cardStyle, border: "2px dashed var(--color-sand)", marginBottom: "1.5rem" }}>
        <h3 style={{ color: "var(--color-forest)", fontSize: "0.95rem", marginBottom: "1rem" }}>📸 写真をまとめてアップロード（複数選択OK）</h3>

        {/* 企画情報 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={labelStyle}>企画名 <span style={{ color: "#e44" }}>*</span></label>
            <input value={meta.eventTitle} onChange={e => setMeta(m => ({ ...m, eventTitle: e.target.value }))} placeholder="夏合宿 in 道志の森" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>月</label>
            <select value={meta.month} onChange={e => { const idx = MONTHS.indexOf(e.target.value); setMeta(m => ({ ...m, month: e.target.value, monthNum: idx + 1 })); }} style={inputStyle}>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>年</label>
            <input type="number" value={meta.year} onChange={e => setMeta(m => ({ ...m, year: parseInt(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>日付（任意）</label>
            <input type="date" value={meta.takenAt} onChange={e => setMeta(m => ({ ...m, takenAt: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>場所（任意）</label>
            <input value={meta.location} onChange={e => setMeta(m => ({ ...m, location: e.target.value }))} placeholder="山梨県" style={inputStyle} />
          </div>
        </div>

        {/* ファイル選択 */}
        <div onClick={() => fileRef.current?.click()}
          style={{ border: "2px dashed #ccc", borderRadius: "4px", padding: "1.5rem", textAlign: "center", cursor: "pointer", marginBottom: "1rem", minHeight: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {previews.length > 0 ? (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
              {previews.slice(0, 12).map((src, i) => <img key={i} src={src} style={{ height: "70px", width: "70px", objectFit: "cover", borderRadius: "3px" }} />)}
              {previews.length > 12 && <div style={{ height: "70px", width: "70px", display: "flex", alignItems: "center", justifyContent: "center", background: "#eee", borderRadius: "3px", fontSize: "0.8rem", color: "#666" }}>+{previews.length - 12}</div>}
            </div>
          ) : (
            <div>
              <Upload size={24} style={{ margin: "0 auto 0.5rem", color: "var(--color-earth)", display: "block" }} />
              <p style={{ color: "var(--color-earth)", margin: 0, fontSize: "0.875rem" }}>クリックして写真を選択（複数可）</p>
              <p style={{ color: "#aaa", margin: "0.25rem 0 0", fontSize: "0.75rem" }}>JPG, PNG, WEBP</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileSelect} />

        {files.length > 0 && <p style={{ fontSize: "0.8rem", color: "var(--color-earth)", marginBottom: "0.75rem" }}>{files.length} 枚選択中</p>}

        <button style={btnStyle(files.length && meta.eventTitle ? "var(--color-orange)" : "#aaa")} onClick={handleUpload} disabled={!files.length || !meta.eventTitle || uploading}>
          <Upload size={14} /> {uploading ? `アップロード中... (${progress.done}/${progress.total})` : `${files.length || ""}枚アップロード`}
        </button>
        {files.length > 0 && !uploading && (
          <button style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", marginLeft: "0.75rem", fontSize: "0.8rem" }} onClick={resetUpload}>クリア</button>
        )}
      </div>

      {/* 月フィルタ */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--color-earth)" }}>全 {photos.length} 枚</span>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
          <option value="all">すべての月</option>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* 月ごとグループ表示 */}
      {isLoading ? <p>読み込み中...</p> : (
        <>
          {groupKeys.map(mk => (
            <div key={mk} style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-orange)", fontSize: "1.1rem", margin: "0 0 0.75rem", borderBottom: "1px solid var(--color-sand)", paddingBottom: "0.3rem" }}>{mk}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.6rem" }}>
                {grouped[mk].map((p: any) => (
                  <div key={p.id} style={{ position: "relative", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <img src={p.url} alt={p.caption} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "0.5rem 0.6rem" }}>
                      {p.eventTitle && <p style={{ fontSize: "0.78rem", color: "var(--color-forest)", margin: "0 0 0.2rem", fontWeight: 700 }}>{p.eventTitle}</p>}
                      <div style={{ display: "flex", gap: "0.4rem", fontSize: "0.68rem", color: "var(--color-earth)", flexWrap: "wrap" }}>
                        {p.takenAt && <span>📅 {p.takenAt}</span>}
                        {p.location && <span>📍 {p.location}</span>}
                      </div>
                    </div>
                    <button onClick={() => { if (confirm("この写真を削除しますか？")) del.mutate(p.id); }}
                      style={{ position: "absolute", top: "0.4rem", right: "0.4rem", background: "rgba(220,38,38,0.85)", border: "none", color: "white", padding: "0.3rem", cursor: "pointer", borderRadius: "2px" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {photos.length === 0 && (
            <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-earth)", padding: "3rem" }}>
              <Camera size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
              <p>写真がまだありません。上のフォームから企画名を入れてアップロードしましょう。</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Posts / 活動報告（メンバー個人記事 + 複数写真 + 月分類）───────────────────────
const TAGS = ["活動報告", "ノウハウ", "お知らせ", "イベント"];

function PostsPanel() {
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const nowMonth = new Date().getMonth();
  const blank = { title: "", content: "", excerpt: "", tag: "活動報告", authorName: session?.user?.name ?? "", month: MONTHS[nowMonth], monthNum: nowMonth + 1, year: new Date().getFullYear(), photos: [], published: true };

  const { data, isLoading } = useQuery({
    queryKey: ["posts-admin"],
    queryFn: async () => (await api.posts.$get({ query: { all: "true" } })).json(),
  });

  const save = useMutation({
    mutationFn: async (p: any) => {
      if (p.id) await api.posts[":id"].$put({ param: { id: String(p.id) }, json: p });
      else await api.posts.$post({ json: p });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts-admin"] }); setEditing(null); setAdding(false); },
  });

  const del = useMutation({
    mutationFn: async (id: number) => api.posts[":id"].$delete({ param: { id: String(id) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts-admin"] }),
  });

  const PostForm = ({ initial, onCancel }: { initial: any; onCancel: () => void }) => {
    const parsePhotos = (ph: any) => {
      if (Array.isArray(ph)) return ph;
      if (typeof ph === "string" && ph) { try { return JSON.parse(ph); } catch { return []; } }
      return [];
    };
    const [form, setForm] = useState({ ...initial, photos: parsePhotos(initial.photos) });
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = Array.from(e.target.files ?? []);
      if (!list.length) return;
      setUploading(true);
      try {
        const uploaded: any[] = [];
        for (const file of list) {
          const presignRes = await api.photos.presign.$post({ json: { filename: file.name, contentType: file.type } });
          const { url, key, publicUrl } = await presignRes.json() as any;
          await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
          uploaded.push({ url: publicUrl, s3Key: key });
        }
        setForm((f: any) => ({ ...f, photos: [...f.photos, ...uploaded] }));
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    };

    const removePhoto = (idx: number) => setForm((f: any) => ({ ...f, photos: f.photos.filter((_: any, i: number) => i !== idx) }));

    return (
      <div style={{ ...cardStyle, border: "2px solid var(--color-orange)", marginBottom: "1rem" }}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>タイトル <span style={{ color: "#e44" }}>*</span></label>
            <input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="北アルプス縦走レポート" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>著者名 <span style={{ color: "#e44" }}>*</span></label>
              <input value={form.authorName} onChange={e => setForm((f: any) => ({ ...f, authorName: e.target.value }))} placeholder="山田太郎" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>月</label>
              <select value={form.month} onChange={e => { const idx = MONTHS.indexOf(e.target.value); setForm((f: any) => ({ ...f, month: e.target.value, monthNum: idx + 1 })); }} style={inputStyle}>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>年</label>
              <input type="number" value={form.year} onChange={e => setForm((f: any) => ({ ...f, year: parseInt(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>タグ</label>
              <select value={form.tag} onChange={e => setForm((f: any) => ({ ...f, tag: e.target.value }))} style={inputStyle}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>本文 <span style={{ color: "#e44" }}>*</span></label>
            <textarea rows={8} value={form.content} onChange={e => setForm((f: any) => ({ ...f, content: e.target.value }))} placeholder="活動の内容を書いてください…" style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {/* 写真（複数）*/}
          <div>
            <label style={labelStyle}>写真（複数選択可）</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {form.photos.map((ph: any, i: number) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={ph.url} style={{ height: "80px", width: "80px", objectFit: "cover", borderRadius: "3px" }} />
                  <button onClick={() => removePhoto(i)} style={{ position: "absolute", top: "-6px", right: "-6px", background: "#dc2626", border: "none", color: "white", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "0.7rem", lineHeight: 1 }}>×</button>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ height: "80px", width: "80px", border: "2px dashed #ccc", borderRadius: "3px", background: "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-earth)", fontSize: "0.65rem", gap: "0.2rem" }}>
                {uploading ? "..." : <><Upload size={16} /> 追加</>}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotos} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-forest)" }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm((f: any) => ({ ...f, published: e.target.checked }))} />
            公開する（チェックなしは下書き保存）
          </label>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button style={btnStyle("var(--color-forest)")} onClick={() => save.mutate(form)} disabled={save.isPending || !form.title || !form.authorName || uploading}>
            <Check size={13} /> {save.isPending ? "保存中..." : "保存"}
          </button>
          <button style={btnStyle("#888")} onClick={onCancel}><X size={13} /> キャンセル</button>
        </div>
      </div>
    );
  };

  const posts = (data as any)?.posts ?? [];
  const filtered = filterMonth === "all" ? posts : posts.filter((p: any) => p.month === filterMonth);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", margin: 0 }}>活動報告</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
            <option value="all">すべての月</option>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <button style={btnStyle("var(--color-orange)")} onClick={() => setAdding(true)}><Plus size={14} /> 追加</button>
        </div>
      </div>

      {adding && <PostForm initial={blank} onCancel={() => setAdding(false)} />}
      {isLoading ? <p>読み込み中...</p> : filtered.map((p: any) => {
        const photos = (() => { try { return p.photos ? JSON.parse(p.photos) : []; } catch { return []; } })();
        return editing?.id === p.id
          ? <PostForm key={p.id} initial={editing} onCancel={() => setEditing(null)} />
          : (
            <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1px" }}>
              {photos[0] && <img src={photos[0].url} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "3px", flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                  {p.month && <span style={{ color: "var(--color-orange)", fontSize: "0.75rem", fontWeight: 700 }}>{p.month}</span>}
                  <span style={{ backgroundColor: "var(--color-forest)", color: "var(--color-sand)", fontSize: "0.7rem", padding: "0.1rem 0.5rem" }}>{p.tag}</span>
                  <span style={{ fontSize: "0.75rem", color: p.published ? "#16a34a" : "#999" }}>{p.published ? "● 公開中" : "○ 下書き"}</span>
                  {photos.length > 0 && <span style={{ fontSize: "0.7rem", color: "var(--color-earth)" }}>📷 {photos.length}</span>}
                </div>
                <p style={{ fontWeight: 700, color: "var(--color-forest)", margin: "0 0 0.2rem" }}>{p.title}</p>
                {p.authorName && <p style={{ fontSize: "0.75rem", color: "var(--color-earth)", margin: "0 0 0.2rem" }}>✍ {p.authorName}</p>}
                <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>{p.excerpt || p.content?.slice(0, 80) + "…"}</p>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => setEditing(p)} style={{ background: "none", border: "1px solid #ddd", padding: "0.3rem 0.6rem", cursor: "pointer", color: "var(--color-forest)" }}><Edit2 size={13} /></button>
                <button onClick={() => { if (confirm(`「${p.title}」を削除しますか？`)) del.mutate(p.id); }} style={{ background: "none", border: "1px solid #fca5a5", padding: "0.3rem 0.6rem", cursor: "pointer", color: "#dc2626" }}><Trash2 size={13} /></button>
              </div>
            </div>
          );
      })}
      {!isLoading && filtered.length === 0 && (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-earth)", padding: "3rem" }}>
          <BookOpen size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <p>活動報告がまだありません。「追加」から書き始めましょう。</p>
        </div>
      )}
    </div>
  );
}

function MembersPanel() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const blank = { name: "", year: 1, role: "一般", bio: "", imageUrl: "", order: 0 };

  const { data, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => (await api.members.$get()).json(),
  });

  const save = useMutation({
    mutationFn: async (m: any) => {
      if (m.id) await api.members[":id"].$put({ param: { id: String(m.id) }, json: m });
      else await api.members.$post({ json: m });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["members"] }); setEditing(null); setAdding(false); },
  });

  const del = useMutation({
    mutationFn: async (id: number) => api.members[":id"].$delete({ param: { id: String(id) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });

  const MemberForm = ({ initial, onCancel }: { initial: any; onCancel: () => void }) => {
    const [form, setForm] = useState({ ...initial });
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const res = await fetch("/api/members/presign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}`,
          },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        const { url, publicUrl } = await res.json() as any;
        await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        setForm((f: any) => ({ ...f, imageUrl: publicUrl }));
      } finally {
        setUploading(false);
      }
    };

    return (
      <div style={{ ...cardStyle, border: "2px solid var(--color-orange)", marginBottom: "1px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>名前 <span style={{ color: "#e44" }}>*</span></label>
            <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>学年</label>
            <select value={form.year} onChange={e => setForm((f: any) => ({ ...f, year: parseInt(e.target.value) }))} style={inputStyle}>
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}年生</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>役職</label>
            <select value={form.role} onChange={e => setForm((f: any) => ({ ...f, role: e.target.value }))} style={inputStyle}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>表示順</label>
            <input type="number" value={form.order} onChange={e => setForm((f: any) => ({ ...f, order: parseInt(e.target.value) }))} style={inputStyle} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>自己紹介</label>
            <textarea rows={2} value={form.bio} onChange={e => setForm((f: any) => ({ ...f, bio: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          {/* Avatar upload */}
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.5rem" }}>プロフィール画像</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "64px", height: "64px", backgroundColor: "var(--color-sky)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0, overflow: "hidden" }}>
                {form.imageUrl ? <img src={form.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
              </div>
              <div style={{ flex: 1 }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                <button style={btnStyle("var(--color-moss)")} onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload size={13} /> {uploading ? "アップロード中..." : "画像をアップロード"}
                </button>
                {form.imageUrl && (
                  <button style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", display: "block", fontSize: "0.75rem", marginTop: "0.4rem" }}
                    onClick={() => setForm((f: any) => ({ ...f, imageUrl: "" }))}>
                    画像を削除
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button style={btnStyle("var(--color-forest)")} onClick={() => save.mutate(form)} disabled={save.isPending || !form.name}>
            <Check size={13} /> {save.isPending ? "保存中..." : "保存"}
          </button>
          <button style={btnStyle("#888")} onClick={onCancel}><X size={13} /> キャンセル</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <SectionHeader title="メンバー管理" onAdd={() => setAdding(true)} />
      {adding && <MemberForm initial={blank} onCancel={() => setAdding(false)} />}
      {isLoading ? <p>読み込み中...</p> : (data as any)?.members?.map((m: any) => (
        editing?.id === m.id
          ? <MemberForm key={m.id} initial={editing} onCancel={() => setEditing(null)} />
          : (
            <div key={m.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1px" }}>
              <div style={{ width: "44px", height: "44px", backgroundColor: "var(--color-sky)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, overflow: "hidden" }}>
                {m.imageUrl ? <img src={m.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={m.name} /> : "👤"}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: "var(--color-forest)", margin: "0 0 0.1rem" }}>
                  {m.name}
                  <span style={{ fontSize: "0.75rem", color: "var(--color-earth)", fontWeight: 400, marginLeft: "0.5rem" }}>{m.year}年生 / {m.role}</span>
                </p>
                {m.bio && <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>{m.bio}</p>}
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => setEditing(m)} style={{ background: "none", border: "1px solid #ddd", padding: "0.3rem 0.6rem", cursor: "pointer" }}><Edit2 size={13} /></button>
                <button onClick={() => { if (confirm(`${m.name}を削除しますか？`)) del.mutate(m.id); }} style={{ background: "none", border: "1px solid #fca5a5", padding: "0.3rem 0.6rem", cursor: "pointer", color: "#dc2626" }}><Trash2 size={13} /></button>
              </div>
            </div>
          )
      ))}
      {!isLoading && ((data as any)?.members?.length ?? 0) === 0 && (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-earth)", padding: "3rem" }}>
          <Users size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <p>メンバーがまだいません。「追加」から登録しましょう。</p>
        </div>
      )}
    </div>
  );
}

// ── Invites (admin only) ──────────────────────────────────────────────────────
function InvitesPanel() {
  const qc = useQueryClient();
  const [role, setRole] = useState("editor");
  const [email, setEmail] = useState("");
  const [lastToken, setLastToken] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/invitations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}` },
      });
      return res.json();
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}` },
        body: JSON.stringify({ role, email: email || undefined }),
      });
      return res.json();
    },
    onSuccess: (d: any) => {
      setLastToken(d.token);
      setEmail("");
      qc.invalidateQueries({ queryKey: ["invitations"] });
    },
  });

  const inviteUrl = lastToken ? `${window.location.origin}/sign-in?invite=${lastToken}` : "";

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", marginBottom: "1.25rem" }}>招待管理</h2>

      {/* Create invite */}
      <div style={{ ...cardStyle, marginBottom: "1.5rem" }}>
        <h3 style={{ color: "var(--color-forest)", marginBottom: "1rem", fontSize: "1rem" }}>新しい招待を作成</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>メアド（任意）</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="sns@example.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>権限</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
              <option value="editor">Editor（SNS担当）</option>
              <option value="admin">Admin（管理者）</option>
            </select>
          </div>
          <button style={btnStyle("var(--color-orange)")} onClick={() => create.mutate()} disabled={create.isPending}>
            <Link size={13} /> 生成
          </button>
        </div>

        {lastToken && (
          <div style={{ marginTop: "1rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.8rem", color: "#166534", marginBottom: "0.4rem", fontWeight: 700 }}>招待リンクが生成されました：</p>
            <code style={{ fontSize: "0.75rem", wordBreak: "break-all", color: "#166534" }}>{inviteUrl}</code>
            <button onClick={() => navigator.clipboard.writeText(inviteUrl)} style={{ ...btnStyle("#166534"), marginTop: "0.5rem", fontSize: "0.75rem" }}>コピー</button>
          </div>
        )}
      </div>

      {/* List */}
      <h3 style={{ color: "var(--color-forest)", fontSize: "1rem", marginBottom: "0.75rem" }}>招待一覧</h3>
      {isLoading ? <p>読み込み中...</p> : (data as any)?.invitations?.map((inv: any) => (
        <div key={inv.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 0.15rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--color-forest)" }}>
              {inv.email || "（メアド未指定）"}
              <span style={{ fontSize: "0.7rem", marginLeft: "0.5rem", backgroundColor: "var(--color-forest)", color: "white", padding: "0.1rem 0.4rem" }}>{inv.role}</span>
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: inv.usedAt ? "green" : "var(--color-earth)" }}>
              {inv.usedAt ? "✓ 使用済み" : "未使用"} · {inv.token.slice(0, 16)}…
            </p>
          </div>
          {!inv.usedAt && (
            <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/sign-in?invite=${inv.token}`)}
              style={{ ...btnStyle("var(--color-moss)"), fontSize: "0.75rem" }}>
              リンクをコピー
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Emails / 管理者メールアドレス管理（admin only）──────────────────────────────
function EmailsPanel() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["allowed-emails"],
    queryFn: async () => {
      const res = await fetch("/api/admin/allowed-emails", {
        headers: { Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}` },
      });
      return res.json();
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/allowed-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}` },
        body: JSON.stringify({ email, label, role: newRole }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? "エラー"); }
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["allowed-emails"] }); setEmail(""); setLabel(""); setNewRole("editor"); setError(""); },
    onError: (e: any) => setError(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      await fetch(`/api/admin/allowed-emails/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}` },
        body: JSON.stringify({ active }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allowed-emails"] }),
  });

  const del = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/admin/allowed-emails/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("bearer_token") ?? ""}` },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allowed-emails"] }),
  });

  const emails = (data as any)?.emails ?? [];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", marginBottom: "0.5rem" }}>ログイン許可メールアドレス</h2>
      <p style={{ color: "var(--color-earth)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
        ここに登録されたメールアドレスだけが管理画面にログイン（新規登録）できます。SNS担当者などを後から追加できます。
      </p>

      {/* 追加フォーム */}
      <div style={{ ...cardStyle, border: "2px dashed var(--color-sand)", marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
          <div>
            <label style={labelStyle}>メールアドレス <span style={{ color: "#e44" }}>*</span></label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" style={inputStyle} type="email" />
          </div>
          <div>
            <label style={labelStyle}>役割・名前（任意）</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="SNS担当" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>権限</label>
            <select value={newRole} onChange={e => setNewRole(e.target.value)} style={inputStyle}>
              <option value="editor">編集者</option>
              <option value="admin">管理者（メール管理可）</option>
            </select>
          </div>
          <button style={btnStyle("var(--color-orange)")} onClick={() => add.mutate()} disabled={!email || add.isPending}>
            <Plus size={14} /> {add.isPending ? "追加中..." : "追加"}
          </button>
        </div>
        {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0.5rem 0 0" }}>{error}</p>}
      </div>

      {/* 一覧 */}
      {isLoading ? <p>読み込み中...</p> : emails.map((em: any) => (
        <div key={em.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "var(--color-forest)", margin: "0 0 0.2rem" }}>
              {em.email}
              <span style={{ fontSize: "0.68rem", marginLeft: "0.5rem", backgroundColor: em.role === "admin" ? "var(--color-orange)" : "var(--color-forest)", color: "white", padding: "0.1rem 0.45rem", borderRadius: "3px", verticalAlign: "middle" }}>
                {em.role === "admin" ? "管理者" : "編集者"}
              </span>
            </p>
            {em.label && <p style={{ fontSize: "0.78rem", color: "var(--color-earth)", margin: 0 }}>{em.label}</p>}
          </div>
          <span style={{ fontSize: "0.75rem", color: em.active ? "#16a34a" : "#999" }}>{em.active ? "● 有効" : "○ 無効"}</span>
          <button onClick={() => toggle.mutate({ id: em.id, active: !em.active })}
            style={{ background: "none", border: "1px solid #ddd", padding: "0.3rem 0.7rem", cursor: "pointer", color: "var(--color-forest)", fontSize: "0.75rem" }}>
            {em.active ? "無効化" : "有効化"}
          </button>
          <button onClick={() => { if (confirm(`「${em.email}」を削除しますか？`)) del.mutate(em.id); }}
            style={{ background: "none", border: "1px solid #fca5a5", padding: "0.3rem 0.6rem", cursor: "pointer", color: "#dc2626" }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      {!isLoading && emails.length === 0 && (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-earth)", padding: "3rem" }}>
          <p>許可メールがまだありません。上から追加しましょう。</p>
        </div>
      )}
    </div>
  );
}
