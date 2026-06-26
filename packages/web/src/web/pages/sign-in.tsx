import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { authClient, captureToken } from "../lib/auth";
import { api } from "../lib/api";

export default function SignInPage() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [inviteToken, setInviteToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    if (invite) {
      setInviteToken(invite);
      setTab("signup");
    }
  }, []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const googleEnabled = false; // Set to true when Google OAuth is configured

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await authClient.signIn.email(
      { email: form.email, password: form.password },
      { onSuccess: captureToken }
    );
    setLoading(false);
    if (err) { setError(err.message ?? "ログインに失敗しました"); return; }
    navigate("/admin");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    let userId = "";
    const { data, error: err } = await authClient.signUp.email(
      { name: form.name, email: form.email, password: form.password },
      { onSuccess: (ctx) => { captureToken(ctx); } }
    );
    setLoading(false);
    if (err) { setError(err.message ?? "登録に失敗しました"); return; }
    userId = (data as any)?.user?.id ?? "";

    // Try setup (first admin) or use invite token
    if (userId) {
      if (inviteToken) {
        await fetch("/api/admin/invitations/use", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: inviteToken, userId }),
        });
      } else {
        await fetch("/api/admin/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      }
    }
    navigate("/admin");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-forest)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ backgroundColor: "var(--color-cream)", maxWidth: "420px", width: "100%", padding: "2.5rem" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⛺</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-forest)", fontSize: "1.5rem", fontWeight: 700 }}>
            キャンプサークル
          </h1>
          <p style={{ color: "var(--color-earth)", fontSize: "0.85rem", marginTop: "0.25rem" }}>管理画面</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid var(--color-sand)", marginBottom: "1.75rem" }}>
          {(["signin", "signup"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              style={{ flex: 1, padding: "0.6rem", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em", color: tab === t ? "var(--color-forest)" : "var(--color-earth)", borderBottom: tab === t ? "2px solid var(--color-forest)" : "2px solid transparent", marginBottom: "-2px", transition: "all 0.2s" }}>
              {t === "signin" ? "ログイン" : "新規登録"}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "0.75rem 1rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp}>
          {tab === "signup" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "var(--color-forest)", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", letterSpacing: "0.05em" }}>お名前</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="山田 太郎"
                style={{ width: "100%", padding: "0.7rem 0.9rem", border: "2px solid var(--color-sand)", backgroundColor: "white", fontFamily: "'Lato',sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
            </div>
          )}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", color: "var(--color-forest)", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", letterSpacing: "0.05em" }}>メールアドレス</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.ac.jp"
              style={{ width: "100%", padding: "0.7rem 0.9rem", border: "2px solid var(--color-sand)", backgroundColor: "white", fontFamily: "'Lato',sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: tab === "signup" ? "1rem" : "1.5rem" }}>
            <label style={{ display: "block", color: "var(--color-forest)", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", letterSpacing: "0.05em" }}>パスワード</label>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="8文字以上"
              style={{ width: "100%", padding: "0.7rem 0.9rem", border: "2px solid var(--color-sand)", backgroundColor: "white", fontFamily: "'Lato',sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          {tab === "signup" && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "var(--color-forest)", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem", letterSpacing: "0.05em" }}>招待トークン（任意）</label>
              <input type="text" value={inviteToken} onChange={e => setInviteToken(e.target.value)}
                placeholder="招待リンクのトークンを貼り付け"
                style={{ width: "100%", padding: "0.7rem 0.9rem", border: "2px solid var(--color-sand)", backgroundColor: "white", fontFamily: "'Lato',sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              <p style={{ color: "var(--color-earth)", fontSize: "0.75rem", marginTop: "0.35rem" }}>初めて登録する場合は不要（自動的に管理者になります）</p>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", opacity: loading ? 0.6 : 1 }}>
            {loading ? "処理中..." : tab === "signin" ? "ログイン" : "登録する"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{ color: "var(--color-earth)", fontSize: "0.8rem", textDecoration: "none" }}>← サイトに戻る</a>
        </div>
      </div>
    </div>
  );
}
