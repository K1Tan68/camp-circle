import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { authClient, clearToken } from "../../lib/auth";
import { useLocation } from "wouter";
import { LogOut, Calendar, Camera, BookOpen, Users, Link, Trash2, Plus, Edit2, Check, X, Upload, Type } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Tab = "texts" | "events" | "photos" | "posts" | "members" | "invites";

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
    { id: "texts", label: "テキスト編集", icon: <Type size={16} /> },
    { id: "events", label: "スケジュール", icon: <Calendar size={16} /> },
    { id: "photos", label: "ギャラリー", icon: <Camera size={16} /> },
    { id: "posts", label: "ブログ", icon: <BookOpen size={16} /> },
    ...(isAdmin ? [
      { id: "members" as Tab, label: "メンバー", icon: <Users size={16} /> },
      { id: "invites" as Tab, label: "招待管理", icon: <Link size={16} /> },
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

function EventsPanel() {
  const qc = useQueryClient();
  const [year, setYear] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const blank = { month: "4月", monthNum: 4, title: "", location: "", description: "", year };

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); setEditing(null); setAdding(false); },
  });

  const del = useMutation({
    mutationFn: async (id: number) => api.events[":id"].$delete({ param: { id: String(id) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

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

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", margin: 0 }}>年間スケジュール</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ ...inputStyle, width: "auto" }}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
          </select>
          <button style={btnStyle("var(--color-orange)")} onClick={() => setAdding(true)}><Plus size={14} /> 追加</button>
        </div>
      </div>

      {adding && <EventForm initial={{ ...blank, year }} onCancel={() => setAdding(false)} />}
      {isLoading ? <p>読み込み中...</p> : (data as any)?.events?.map((ev: any) => (
        editing?.id === ev.id
          ? <EventForm key={ev.id} initial={editing} onCancel={() => setEditing(null)} />
          : (
            <div key={ev.id} style={{ ...cardStyle, display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-orange)", fontSize: "1.1rem", fontWeight: 700, minWidth: "2.5rem" }}>{ev.month}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: "var(--color-forest)", margin: "0 0 0.2rem" }}>{ev.title}</p>
                {ev.location && <p style={{ color: "var(--color-earth)", fontSize: "0.8rem", margin: "0 0 0.2rem" }}>📍 {ev.location}</p>}
                {ev.description && <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>{ev.description}</p>}
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => setEditing(ev)} style={{ background: "none", border: "1px solid #ddd", padding: "0.3rem 0.6rem", cursor: "pointer", color: "var(--color-forest)" }}><Edit2 size={13} /></button>
                <button onClick={() => { if (confirm(`「${ev.title}」を削除しますか？`)) del.mutate(ev.id); }} style={{ background: "none", border: "1px solid #fca5a5", padding: "0.3rem 0.6rem", cursor: "pointer", color: "#dc2626" }}><Trash2 size={13} /></button>
              </div>
            </div>
          )
      ))}
      {!isLoading && ((data as any)?.events?.length ?? 0) === 0 && (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-earth)", padding: "3rem" }}>
          <Calendar size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <p>この年のイベントはまだありません。「追加」から登録しましょう。</p>
        </div>
      )}
    </div>
  );
}

// ── Photos ────────────────────────────────────────────────────────────────────
function PhotosPanel() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ caption: "", takenAt: "", location: "", description: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => (await api.photos.$get()).json(),
  });

  const del = useMutation({
    mutationFn: async (id: number) => api.photos[":id"].$delete({ param: { id: String(id) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["photos"] }),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const presignRes = await api.photos.presign.$post({ json: { filename: selectedFile.name, contentType: selectedFile.type } });
      const { url, key } = await presignRes.json() as any;
      await fetch(url, { method: "PUT", body: selectedFile, headers: { "Content-Type": selectedFile.type } });
      await api.photos.$post({ json: { s3Key: key, ...form } });
      qc.invalidateQueries({ queryKey: ["photos"] });
      setForm({ caption: "", takenAt: "", location: "", description: "" });
      setPreview(null);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", color: "var(--color-forest)", fontSize: "1.4rem", marginBottom: "1.25rem" }}>ギャラリー写真</h2>

      {/* Upload area */}
      <div style={{ ...cardStyle, border: "2px dashed var(--color-sand)", marginBottom: "1.5rem" }}>
        <h3 style={{ color: "var(--color-forest)", fontSize: "0.95rem", marginBottom: "1rem" }}>📸 写真をアップロード</h3>

        {/* File drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed #ccc",
            borderRadius: "4px",
            padding: "1.5rem",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "1rem",
            backgroundColor: preview ? "#f9f9f9" : "white",
            position: "relative",
            minHeight: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ maxHeight: "160px", maxWidth: "100%", objectFit: "contain" }} />
          ) : (
            <div>
              <Upload size={24} style={{ margin: "0 auto 0.5rem", color: "var(--color-earth)", display: "block" }} />
              <p style={{ color: "var(--color-earth)", margin: 0, fontSize: "0.875rem" }}>クリックして写真を選択</p>
              <p style={{ color: "#aaa", margin: "0.25rem 0 0", fontSize: "0.75rem" }}>JPG, PNG, WEBP</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />

        {/* Metadata fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>日付</label>
            <input
              type="date"
              value={form.takenAt}
              onChange={e => setForm(f => ({ ...f, takenAt: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>場所</label>
            <input
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="道志の森、北海道…"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>タイトル・キャプション</label>
            <input
              value={form.caption}
              onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
              placeholder="夕暮れのテントサイト"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>説明（任意）</label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="夏合宿での一コマ…"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          style={btnStyle(selectedFile ? "var(--color-orange)" : "#aaa")}
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          <Upload size={14} /> {uploading ? "アップロード中..." : "アップロード"}
        </button>
        {selectedFile && !uploading && (
          <button style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", marginLeft: "0.75rem", fontSize: "0.8rem" }}
            onClick={() => { setSelectedFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}>
            キャンセル
          </button>
        )}
      </div>

      {/* Gallery grid */}
      {isLoading ? <p>読み込み中...</p> : (
        <>
          <p style={{ color: "var(--color-earth)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            全 {(data as any)?.photos?.length ?? 0} 枚
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {(data as any)?.photos?.map((p: any) => (
              <div key={p.id} style={{ position: "relative", backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <img src={p.url} alt={p.caption} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                <div style={{ padding: "0.6rem 0.75rem" }}>
                  {p.caption && <p style={{ fontSize: "0.8rem", color: "var(--color-forest)", margin: "0 0 0.2rem", fontWeight: 700 }}>{p.caption}</p>}
                  <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.7rem", color: "var(--color-earth)", flexWrap: "wrap" }}>
                    {p.takenAt && <span>📅 {p.takenAt}</span>}
                    {p.location && <span>📍 {p.location}</span>}
                  </div>
                  {p.description && <p style={{ fontSize: "0.7rem", color: "#888", margin: "0.2rem 0 0" }}>{p.description}</p>}
                </div>
                <button
                  onClick={() => { if (confirm("この写真を削除しますか？")) del.mutate(p.id); }}
                  style={{ position: "absolute", top: "0.4rem", right: "0.4rem", background: "rgba(220,38,38,0.85)", border: "none", color: "white", padding: "0.3rem", cursor: "pointer", borderRadius: "2px" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          {((data as any)?.photos?.length ?? 0) === 0 && (
            <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-earth)", padding: "3rem" }}>
              <Camera size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
              <p>写真がまだありません。上のフォームからアップロードしましょう。</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Posts ─────────────────────────────────────────────────────────────────────
const TAGS = ["活動報告", "ノウハウ", "お知らせ", "イベント"];

function PostsPanel() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const blank = { title: "", content: "", excerpt: "", tag: "活動報告", published: false };

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
    const [form, setForm] = useState({ ...initial });
    return (
      <div style={{ ...cardStyle, border: "2px solid var(--color-orange)", marginBottom: "1rem" }}>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>タイトル <span style={{ color: "#e44" }}>*</span></label>
              <input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>タグ</label>
              <select value={form.tag} onChange={e => setForm((f: any) => ({ ...f, tag: e.target.value }))} style={{ ...inputStyle, width: "auto" }}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>本文 <span style={{ color: "#e44" }}>*</span></label>
            <textarea rows={8} value={form.content} onChange={e => setForm((f: any) => ({ ...f, content: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--color-earth)", display: "block", marginBottom: "0.25rem" }}>抜粋（省略で自動生成）</label>
            <input value={form.excerpt} onChange={e => setForm((f: any) => ({ ...f, excerpt: e.target.value }))} style={inputStyle} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "var(--color-forest)" }}>
            <input type="checkbox" checked={form.published} onChange={e => setForm((f: any) => ({ ...f, published: e.target.checked }))} />
            公開する（チェックなしは下書き保存）
          </label>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button style={btnStyle("var(--color-forest)")} onClick={() => save.mutate(form)} disabled={save.isPending || !form.title}>
            <Check size={13} /> {save.isPending ? "保存中..." : "保存"}
          </button>
          <button style={btnStyle("#888")} onClick={onCancel}><X size={13} /> キャンセル</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <SectionHeader title="ブログ・活動報告" onAdd={() => setAdding(true)} />
      {adding && <PostForm initial={blank} onCancel={() => setAdding(false)} />}
      {isLoading ? <p>読み込み中...</p> : (data as any)?.posts?.map((p: any) => (
        editing?.id === p.id
          ? <PostForm key={p.id} initial={editing} onCancel={() => setEditing(null)} />
          : (
            <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ backgroundColor: "var(--color-forest)", color: "var(--color-sand)", fontSize: "0.7rem", padding: "0.1rem 0.5rem" }}>{p.tag}</span>
                  <span style={{ fontSize: "0.75rem", color: p.published ? "#16a34a" : "#999" }}>{p.published ? "● 公開中" : "○ 下書き"}</span>
                </div>
                <p style={{ fontWeight: 700, color: "var(--color-forest)", margin: "0 0 0.2rem" }}>{p.title}</p>
                <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>{p.excerpt || p.content?.slice(0, 80) + "…"}</p>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => setEditing(p)} style={{ background: "none", border: "1px solid #ddd", padding: "0.3rem 0.6rem", cursor: "pointer", color: "var(--color-forest)" }}><Edit2 size={13} /></button>
                <button onClick={() => { if (confirm(`「${p.title}」を削除しますか？`)) del.mutate(p.id); }} style={{ background: "none", border: "1px solid #fca5a5", padding: "0.3rem 0.6rem", cursor: "pointer", color: "#dc2626" }}><Trash2 size={13} /></button>
              </div>
            </div>
          )
      ))}
      {!isLoading && ((data as any)?.posts?.length ?? 0) === 0 && (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--color-earth)", padding: "3rem" }}>
          <BookOpen size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
          <p>まだ投稿がありません。「追加」から書き始めましょう。</p>
        </div>
      )}
    </div>
  );
}

// ── Members (admin only) ──────────────────────────────────────────────────────
const ROLES = ["部長", "副部長", "SNS担当", "会計", "一般"];

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
