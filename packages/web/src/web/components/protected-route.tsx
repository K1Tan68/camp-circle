import { Redirect } from "wouter";
import { authClient } from "../lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  if (isPending) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-cream)" }}>
      <div style={{ color: "var(--color-forest)", fontSize: "1.1rem", fontFamily: "'Lato', sans-serif" }}>読み込み中...</div>
    </div>
  );
  if (!session) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}
