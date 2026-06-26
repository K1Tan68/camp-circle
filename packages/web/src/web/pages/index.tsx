import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Menu, X, Instagram, Twitter, Youtube, ChevronDown, MapPin, Calendar, Camera, BookOpen, Mail, ArrowRight } from "lucide-react";


// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#about", label: "サークル紹介" },
    { href: "#schedule", label: "活動スケジュール" },
    { href: "#join", label: "入部案内" },
  ];

  return (
    <nav style={{ backgroundColor: "var(--color-forest)" }} className="fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-4 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 no-underline" style={{ marginLeft: 0 }}>
          <img src="/momoac-logo.png" alt="桃山学院大学" style={{ height: "36px", width: "auto" }} />
          <span style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-cream)", fontWeight: 600, fontSize: "1.1rem" }}>
            桃山学院大学 キャンプサークル
          </span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.href} href={l.href}
              style={{ color: "var(--color-sky)", fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-sand)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-sky)")}>
              {l.label}
            </a>
          ))}
          <a href="#join" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.8rem" }}>入部する</a>
        </div>
        <button className="md:hidden" style={{ color: "var(--color-cream)", background: "none", border: "none", cursor: "pointer" }} onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div style={{ backgroundColor: "var(--color-dusk)" }} className="md:hidden px-6 pb-6 flex flex-col gap-4">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ color: "var(--color-cream)", textDecoration: "none" }}>{l.label}</a>
          ))}
          <a href="#join" className="btn-primary text-center" style={{ marginTop: "0.5rem" }}>入部する</a>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden flex items-center justify-center" style={{ minHeight: "100vh" }}>
      <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <source media="(max-width: 768px)" srcSet="/hero-bg-mobile.png" />
        <img
          src="/hero-bg.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      </picture>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(26,64,43,0.18) 0%, rgba(26,64,43,0.08) 45%, rgba(26,64,43,0.50) 100%)",
      }} />
      <div className="relative text-center px-6 max-w-3xl mx-auto" style={{ paddingTop: "3rem", zIndex: 10 }}>
        <p className="section-label mb-4" style={{ color: "#f3e8c8", borderColor: "rgba(243,232,200,0.45)" }}>
          Momoyama Gakuin University Camping Circle
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(3rem, 8vw, 6.5rem)",
            color: "#fff9ea",
            lineHeight: 1,
            fontWeight: 700,
            marginBottom: "1.25rem",
            textShadow: "0 8px 30px rgba(0,0,0,0.30)",
          }}
        >
          自然と
          <br />
          遊ぶ、学ぶ。
        </h1>
        <p className="mx-auto" style={{ color: "rgba(255,255,255,0.94)", lineHeight: 1.85, maxWidth: "36rem", fontSize: "1.04rem", textShadow: "0 2px 16px rgba(0,0,0,0.25)" }}>
          初心者も経験者も、道具がなくても大丈夫。
          <br />
          学年・学部を超えて、自然の中で仲間をつくろう。
        </p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" style={{ backgroundColor: "var(--color-cream)", padding: "5rem 1.5rem" }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="section-label mb-3">About</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-forest)", marginBottom: "1.25rem" }}>
            サークル紹介
          </h2>
          <p style={{ color: "var(--color-earth)", lineHeight: 1.9, marginBottom: "1rem" }}>
            桃山学院大学キャンプサークルは、自然の中での活動を通じて学年・学部の壁を越えたつながりが生まれる、アットホームなサークルです。
          </p>
          <p style={{ color: "var(--color-earth)", lineHeight: 1.9, marginBottom: "1rem" }}>
            「キャンプって難しそう…」と思っていませんか？ 大丈夫。テントの設営・火起こし・アウトドア料理まで、すべて先輩がイチから丁寧に教えます。道具も最初は貸し出しOKなので、<strong>完全手ぶらで参加できます。</strong>
          </p>
          <p style={{ color: "var(--color-earth)", lineHeight: 1.9 }}>
            月１回の日帰り活動を軸に、春・夏・秋の泊まりキャンプや BBQ イベントも開催。大学生活に忘れられない思い出をつくりましょう。
          </p>
        </div>
        <div style={{ backgroundColor: "white", border: "1px solid rgba(0,0,0,0.06)", padding: "1.5rem", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <img src="/hero-bg.png" alt="キャンプの様子" style={{ width: "100%", height: 260, objectFit: "cover" }} />
        </div>
      </div>
    </section>
  );
}

function Schedule() {
  const year = new Date().getFullYear();
  const { data } = useQuery({
    queryKey: ["events", year],
    queryFn: async () => (await api.events.$get({ query: { year: String(year) } })).json(),
  });
  const events: any[] = (data as any)?.events ?? [];
  const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const byMonth: Record<string, any[]> = {};
  for (const ev of events) (byMonth[ev.month] ??= []).push(ev);

  return (
    <section id="schedule" style={{ backgroundColor: "#fff", padding: "5rem 1.5rem" }}>
      <div className="max-w-5xl mx-auto">
        <p className="section-label mb-3">Schedule</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-forest)", marginBottom: "2rem" }}>
          活動スケジュール
        </h2>
        <div className="flex flex-col gap-3">
          {MONTHS.map((m) => {
            const items = byMonth[m] ?? [];
            return (
              <div key={m} style={{ backgroundColor: "var(--color-cream)", padding: "1rem 1.25rem", border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <p style={{ color: "var(--color-forest)", fontWeight: 700, margin: 0, minWidth: "3.5rem" }}>{m}</p>
                <div style={{ flex: 1 }}>
                  {items.length === 0 ? (
                    <div style={{ borderBottom: "1px dotted rgba(0,0,0,0.18)", height: 0, marginTop: "0.7rem" }} />
                  ) : (
                    items.map((ev: any) => (
                      <div key={ev.id} style={{ marginBottom: "0.5rem" }}>
                        <p style={{ color: "var(--color-forest)", fontWeight: 700, margin: 0 }}>
                          {ev.date && <span style={{ color: "var(--color-orange)", marginRight: "0.5rem", fontSize: "0.85rem" }}>{ev.date}</span>}
                          {ev.title}
                        </p>
                        {ev.location && <p style={{ color: "var(--color-earth)", fontSize: "0.8rem", margin: "0.1rem 0 0" }}>📍 {ev.location}</p>}
                        {ev.description && <p style={{ color: "#666", fontSize: "0.8rem", margin: "0.1rem 0 0" }}>{ev.description}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ color: "var(--color-earth)", fontSize: "0.85rem", marginTop: "1.5rem", lineHeight: 1.8 }}>
          ※ 詳細な日程は活動が決まり次第 Instagram で告知します。
        </p>
      </div>
    </section>
  );
}

// ─── Gallery（サークル企画の写真）────────────────────────────────────────────
function Gallery() {
  const { data } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => (await api.photos.$get()).json(),
  });
  const photos: any[] = (data as any)?.photos ?? [];

  return (
    <section id="gallery" style={{ backgroundColor: "var(--color-sand)", padding: "5rem 1.5rem" }}>
      <div className="max-w-5xl mx-auto">
        <p className="section-label mb-3">Gallery</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-forest)", marginBottom: "2rem" }}>
          ギャラリー
        </h2>
        {photos.length === 0 ? (
          <div style={{ border: "2px dashed rgba(0,0,0,0.15)", padding: "4rem 2rem", textAlign: "center", backgroundColor: "rgba(255,255,255,0.5)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📸</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "var(--color-forest)", marginBottom: "0.5rem" }}>Coming Soon</p>
            <p style={{ color: "var(--color-earth)", fontSize: "0.9rem", lineHeight: 1.8 }}>活動写真を準備中です。もうしばらくお待ちください。</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {photos.map((p: any) => (
              <div key={p.id} style={{ position: "relative", backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                <img src={p.url} alt={p.eventTitle ?? ""} loading="lazy" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                <div style={{ padding: "0.6rem 0.75rem" }}>
                  {p.eventTitle && <p style={{ fontSize: "0.82rem", color: "var(--color-forest)", margin: "0 0 0.2rem", fontWeight: 700 }}>{p.eventTitle}</p>}
                  <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.7rem", color: "var(--color-earth)", flexWrap: "wrap" }}>
                    {p.month && <span>{p.month}</span>}
                    {p.location && <span>📍 {p.location}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Blog / 活動報告（メンバー記事）──────────────────────────────────────────
function Blog() {
  const [openPost, setOpenPost] = useState<any>(null);
  const { data } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => (await api.posts.$get({ query: {} })).json(),
  });
  const posts: any[] = (data as any)?.posts ?? [];
  const parsePhotos = (ph: any) => { try { return ph ? JSON.parse(ph) : []; } catch { return []; } };

  return (
    <section id="blog" style={{ backgroundColor: "#fff", padding: "5rem 1.5rem" }}>
      <div className="max-w-5xl mx-auto">
        <p className="section-label mb-3">Blog</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-forest)", marginBottom: "2rem" }}>
          活動報告
        </h2>
        {posts.length === 0 ? (
          <div style={{ border: "2px dashed rgba(0,0,0,0.12)", padding: "4rem 2rem", textAlign: "center", backgroundColor: "var(--color-cream)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "var(--color-forest)", marginBottom: "0.5rem" }}>Coming Soon</p>
            <p style={{ color: "var(--color-earth)", fontSize: "0.9rem", lineHeight: 1.8 }}>活動レポートを順次掲載予定です。お楽しみに。</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {posts.map((p: any) => {
              const photos = parsePhotos(p.photos);
              return (
                <div key={p.id} onClick={() => setOpenPost({ ...p, _photos: photos })}
                  style={{ backgroundColor: "var(--color-cream)", border: "1px solid rgba(0,0,0,0.06)", cursor: "pointer", overflow: "hidden", transition: "transform 0.15s" }}>
                  {photos[0] && <img src={photos[0].url} loading="lazy" style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", display: "block" }} />}
                  <div style={{ padding: "1rem 1.1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      {p.month && <span style={{ color: "var(--color-orange)", fontSize: "0.72rem", fontWeight: 700 }}>{p.month}</span>}
                      <span style={{ backgroundColor: "var(--color-forest)", color: "var(--color-sand)", fontSize: "0.65rem", padding: "0.1rem 0.45rem" }}>{p.tag}</span>
                    </div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "var(--color-forest)", margin: "0 0 0.3rem", fontWeight: 700 }}>{p.title}</p>
                    {p.authorName && <p style={{ fontSize: "0.72rem", color: "var(--color-earth)", margin: "0 0 0.3rem" }}>✍ {p.authorName}</p>}
                    <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>{p.excerpt || p.content?.slice(0, 70) + "…"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 記事モーダル */}
        {openPost && (
          <div onClick={() => setOpenPost(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 1rem", overflowY: "auto" }}>
            <div onClick={e => e.stopPropagation()}
              style={{ backgroundColor: "white", maxWidth: "680px", width: "100%", padding: "2rem", position: "relative", borderRadius: "4px", marginTop: "2rem" }}>
              <button onClick={() => setOpenPost(null)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-earth)", lineHeight: 1 }}>×</button>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {openPost.month && <span style={{ color: "var(--color-orange)", fontSize: "0.78rem", fontWeight: 700 }}>{openPost.month}</span>}
                <span style={{ backgroundColor: "var(--color-forest)", color: "var(--color-sand)", fontSize: "0.7rem", padding: "0.1rem 0.5rem" }}>{openPost.tag}</span>
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "var(--color-forest)", margin: "0 0 0.4rem" }}>{openPost.title}</h3>
              {openPost.authorName && <p style={{ fontSize: "0.8rem", color: "var(--color-earth)", margin: "0 0 1.25rem" }}>✍ {openPost.authorName}</p>}
              <p style={{ color: "#444", fontSize: "0.92rem", lineHeight: 1.9, whiteSpace: "pre-wrap", margin: "0 0 1.5rem" }}>{openPost.content}</p>
              {openPost._photos?.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.6rem" }}>
                  {openPost._photos.map((ph: any, i: number) => (
                    <img key={i} src={ph.url} loading="lazy" style={{ width: "100%", borderRadius: "3px", display: "block" }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Join() {
  const [contactType, setContactType] = useState<"inquiry" | "visit">("inquiry");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = { width: "100%", padding: "0.75rem 1rem", border: "2px solid var(--color-sand)", backgroundColor: "white", fontFamily: "'Lato', sans-serif", fontSize: "0.9rem", outline: "none" } as React.CSSProperties;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: contactType, name, email, year, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "送信失敗");
      setSent(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "送信に失敗しました。時間をおいてお試しください。");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="join" style={{ backgroundColor: "var(--color-cream)", padding: "6rem 1.5rem" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="section-label mb-3">Join Us</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-forest)", marginBottom: "1.5rem" }}>
              一緒にキャンプ<br />しませんか？
            </h2>
            <p style={{ color: "var(--color-earth)", lineHeight: 1.9, marginBottom: "0.75rem" }}>
              キャンプ経験ゼロでも大歓迎。テント・寝袋などの道具は最初は貸し出しOKです。「とりあえず話だけ聞いてみたい」という方も大丈夫！
            </p>
            <p style={{ color: "var(--color-earth)", lineHeight: 1.9, marginBottom: "2rem" }}>
              まずは見学・体験参加から気軽にどうぞ。雰囲気を見てから本入部を決めてもOKです。右のフォームからお気軽にご連絡ください。
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: <Calendar size={20} />, title: "活動頻度", desc: "月１回（季節によって泊まりキャンプあり）" },
                { icon: <MapPin size={20} />, title: "活動場所", desc: "キャンパス集合 → 各地キャンプ場" },
                { icon: <BookOpen size={20} />, title: "年会費", desc: "無料" },
                { icon: <Mail size={20} />, title: "連絡先", desc: "campmomoyama@gmail.com" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div style={{ color: "var(--color-orange)", marginTop: "0.15rem" }}>{item.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--color-forest)", marginBottom: "0.15rem" }}>{item.title}</p>
                    <p style={{ color: "var(--color-earth)", fontSize: "0.9rem" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {sent ? (
              <div style={{ backgroundColor: "var(--color-forest)", padding: "3rem 2rem", textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⛺</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-cream)", marginBottom: "0.75rem", fontSize: "1.6rem" }}>送信を受け付けました</h3>
                <p style={{ color: "rgba(255, 245, 220, 0.92)", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                  お問い合わせありがとうございます。<br />
                  内容を確認のうえ、３日以内にご返信いたします。
                </p>
                <p style={{ color: "var(--color-sky)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                  ※ 自動返信メールが届いていない場合は迷惑メールフォルダをご確認ください。<br />
                  返信は <span style={{ color: "var(--color-cream)" }}>campmomoyama@gmail.com</span> からお送りします。
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-forest)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>お問い合わせ・見学申込</h3>
                <div style={{ backgroundColor: "var(--color-sand)", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-forest)", marginBottom: "0.25rem", letterSpacing: "0.05em" }}>お問い合わせの種類</p>
                  {([
                    { value: "inquiry", label: "お問い合わせ", desc: "サークルについて質問したい" },
                    { value: "visit", label: "見学申込", desc: "実際に活動を見学・体験したい" },
                  ] as const).map(opt => (
                    <label key={opt.value} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
                      <input type="radio" name="contactType" value={opt.value} checked={contactType === opt.value} onChange={() => setContactType(opt.value)} style={{ marginTop: "0.2rem", accentColor: "var(--color-forest)", width: "16px", height: "16px", flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 700, color: "var(--color-forest)", fontSize: "0.9rem" }}>{opt.label}</span>
                        <p style={{ color: "var(--color-earth)", fontSize: "0.8rem", marginTop: "0.1rem" }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--color-forest)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "0.05em" }}>お名前</label>
                  <input type="text" placeholder="山田 太郎" required value={name} onChange={e => setName(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = "var(--color-forest)")} onBlur={e => (e.target.style.borderColor = "var(--color-sand)")} />
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--color-forest)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "0.05em" }}>メールアドレス</label>
                  <input type="email" placeholder="taro@example.com" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = "var(--color-forest)")} onBlur={e => (e.target.style.borderColor = "var(--color-sand)")} />
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--color-forest)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "0.05em" }}>学年</label>
                  <select value={year} onChange={e => setYear(e.target.value)} style={inputStyle}>
                    <option value="">選択してください</option>
                    {["１","２","３","４"].map(y => <option key={y} value={y}>{y}年生</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--color-forest)", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "0.05em" }}>
                    {contactType === "visit" ? "希望日・その他（任意）" : "メッセージ（任意）"}
                  </label>
                  <textarea rows={4} placeholder={contactType === "visit" ? "希望の見学日や質問があればご記入ください" : "質問やご要望などお気軽にどうぞ"} value={message} onChange={e => setMessage(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => (e.target.style.borderColor = "var(--color-forest)")} onBlur={e => (e.target.style.borderColor = "var(--color-sand)")} />
                </div>
                {error && <p style={{ color: "#c0392b", fontSize: "0.9rem", lineHeight: 1.7, backgroundColor: "rgba(192,57,43,0.08)", padding: "0.75rem 1rem", borderRadius: "6px" }}>{error}</p>}
                <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start", opacity: sending ? 0.7 : 1 }} disabled={sending}>{sending ? "送信中..." : contactType === "visit" ? "見学を申し込む" : "送信する"}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const sns = [
    { href: "https://www.instagram.com/momo_camp.circle/", icon: <Instagram size={20} />, label: "Instagram" },
    { href: "https://x.com/andrew_camjp", icon: <Twitter size={20} />, label: "Twitter / X" },
    { href: "https://www.youtube.com/channel/UC4nbTGtuUK34YadYbrB2fHA", icon: <Youtube size={20} />, label: "YouTube" },
    { href: "https://momoyama-camp.jp", icon: <ArrowRight size={20} />, label: "Official Site" },
  ];

  return (
    <footer style={{ backgroundColor: "var(--color-forest)", color: "var(--color-cream)", padding: "3rem 1.5rem" }}>
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-4">
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem" }}>桃山学院大学 キャンプサークル</p>
        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.75)" }}>自然と遊ぶ、学ぶ。</p>
        <div className="flex items-center gap-5 mt-2">
          {sns.map(s => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
              aria-label={s.label}
              style={{ color: "rgba(255,255,255,0.7)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-sand)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}>
              {s.icon}
            </a>
          ))}
        </div>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", marginTop: "0.5rem", lineHeight: 1.8 }}>
          campmomoyama@gmail.com
          <br />
          © {new Date().getFullYear()} 桃山学院大学キャンプサークル
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  useQuery({ queryKey: ["site-texts"], queryFn: async () => api.siteText.get().then(r => r.json()) });
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Schedule />
      <Gallery />
      <Blog />
      <Join />
      <Footer />
    </div>
  );
}
