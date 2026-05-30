"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";

interface SentenceRow {
  id: string;
  part: string;
  day: number;
  orderIndex: number;
  prompt: string;
  answer: string;
  fullSentence: string;
  translationKo: string;
}
interface ListResp {
  items: SentenceRow[];
  nextCursor: string | null;
}
interface StatsResp {
  total: number;
  byPart: Record<string, number>;
}

// 문장쓰기/쉐도잉은 LC(Part 1–4) 전용.
const PARTS = [1, 2, 3, 4];

export default function SentencesPage() {
  const [part, setPart] = useState<number | "">("");
  const params = new URLSearchParams();
  if (part) params.set("part", String(part));
  params.set("limit", "200");

  const { data: stats } = useQuery<StatsResp>({
    queryKey: ["sentences", "stats"],
    queryFn: () => api(`/sentences/stats`),
  });

  const { data, isLoading, error } = useQuery<ListResp>({
    queryKey: ["sentences", part],
    queryFn: () => api(`/sentences?${params.toString()}`),
  });

  return (
    <div>
      <h1>문장쓰기 · 쉐도잉</h1>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="muted">총 문항</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.total ?? "—"}</div>
        </div>
        {PARTS.map((p) => (
          <div className="card" key={p}>
            <div className="muted">Part {p}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {stats?.byPart?.[`P${p}`] ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div>
          <label>파트</label>
          <select
            value={part}
            onChange={(e) => setPart(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">전체</option>
            {PARTS.map((p) => (
              <option key={p} value={p}>
                Part {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <div className="toast info">Loading…</div>}
      {error && <div className="toast error">{(error as Error).message}</div>}

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Part</th>
              <th>Day</th>
              <th>문제</th>
              <th>정답</th>
              <th>전체 문장</th>
              <th>번역</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((s) => {
              const partNum = (s.part ?? "").toString().replace(/[^0-9]/g, "");
              return (
                <tr key={s.id}>
                  <td><code>{s.id}</code></td>
                  <td>
                    <span className={`badge part-${partNum || "1"}`}>{s.part}</span>
                  </td>
                  <td>{s.day}</td>
                  <td>{s.prompt}</td>
                  <td style={{ fontWeight: 600 }}>{s.answer}</td>
                  <td>{s.fullSentence}</td>
                  <td className="muted">{s.translationKo}</td>
                </tr>
              );
            })}
            {data && !data.items.length && (
              <tr>
                <td colSpan={7} className="muted">
                  결과 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
