"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ accessToken: string; user?: { email: string; role: string } }>(
        "/auth/login/email",
        { method: "POST", json: { email, password } },
      );
      setAccessToken(res.accessToken);
      if (res.user && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(res.user));
      } else if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify({ email, role: "admin" }));
      }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>VNB4 TOEIC Admin</h1>
      <form onSubmit={onSubmit}>
        {error && <div className="toast error">{error}</div>}
        <div className="row">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="row">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn" disabled={busy} style={{ width: "100%", padding: "10px 14px" }}>
          {busy ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <div className="alt">
        <a href="/api/v1/auth/google">Google로 로그인</a>
        <span style={{ margin: "0 8px", color: "#94a3b8" }}>·</span>
        <a href="/register">회원가입</a>
      </div>
    </div>
  );
}
