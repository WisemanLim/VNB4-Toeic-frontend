"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Health {
  status: string;
  db: string;
  version: string;
}
interface WordStats {
  total: number;
  byPart: Record<string, number>;
}

export default function Dashboard() {
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* noop */
      }
    }
  }, []);

  const { data: health } = useQuery<Health>({
    queryKey: ["health"],
    queryFn: () => api<Health>("/health"),
  });
  const { data: stats } = useQuery<WordStats>({
    queryKey: ["words", "stats"],
    queryFn: () =>
      api<WordStats>("/words/stats").catch(() => ({ total: 0, byPart: {} })),
  });

  const total = stats?.total ?? 0;
  const byPart = stats?.byPart ?? {};

  return (
    <div>
      <h1>대시보드</h1>

      <section className="kpi-grid">
        <Kpi label="현재 로그인" value={user?.email ?? "—"} sub={`role: ${user?.role ?? "—"}`} />
        <Kpi label="총 단어 (DB 저장)" value={String(total)} />
        <Kpi label="API 상태" value={health?.status ?? "..."} sub={`v${health?.version ?? "—"}`} />
        <Kpi label="DB 상태" value={health?.db ?? "..."} />
      </section>

      <h2>파트별 단어 수</h2>
      <section className="kpi-grid">
        {[1, 2, 3, 4, 5, 6, 7].map((p) => (
          <Kpi
            key={p}
            label={`Part ${p}`}
            value={String(byPart[`P${p}`] ?? byPart[String(p)] ?? 0)}
          />
        ))}
      </section>

      <h2>최근 로그인</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>일시</th>
              <th>이메일</th>
              <th>IP</th>
              <th>성공</th>
              <th>사유</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{new Date().toLocaleString("ko-KR")}</td>
              <td>{user?.email ?? "—"}</td>
              <td className="muted">—</td>
              <td>✓</td>
              <td className="muted">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>최근 행위 감사</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>일시</th>
              <th>actor</th>
              <th>action</th>
              <th>target</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="muted">
                없음
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="num">{value}</div>
      {sub && <div className="muted" style={{ marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
