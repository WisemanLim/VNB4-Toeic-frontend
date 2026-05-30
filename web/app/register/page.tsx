"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
        "/auth/signup/email",
        { method: "POST", json: { email, password, name } },
      );
      setAccessToken(res.accessToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(res.user ?? { email, role: "user" }));
      }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "회원가입 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>VNB4 TOEIC Admin · 회원가입</h1>
      <form onSubmit={onSubmit}>
        {error && <div className="toast error">{error}</div>}
        <div className="row">
          <label htmlFor="name">이름</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
        </div>
        <div className="row">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
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
          {busy ? "가입 중..." : "회원가입"}
        </button>
      </form>
      <div className="alt">
        <a href="/login">이미 계정이 있으신가요? 로그인</a>
      </div>
    </div>
  );
}
