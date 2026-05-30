"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";

interface LessonWord {
  wordId: string;
  word?: { word: string };
}
interface LessonRow {
  id: string;
  part: string;
  title: string;
  description?: string;
  orderIndex: number;
  publishedAt?: string | null;
  words: LessonWord[];
}

export default function LessonsPage() {
  const [part, setPart] = useState<number | "">("");
  const params = new URLSearchParams();
  if (part) params.set("part", String(part));

  const { data, isLoading, error } = useQuery<LessonRow[]>({
    queryKey: ["lessons", part],
    queryFn: () => api(`/lessons?${params.toString()}`),
  });

  return (
    <div>
      <h1>레슨 관리</h1>

      <div className="toolbar">
        <div>
          <label>파트</label>
          <select
            value={part}
            onChange={(e) => setPart(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">전체</option>
            {[1, 2, 3, 4, 5, 6, 7].map((p) => (
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
              <th>제목</th>
              <th>단어 수</th>
              <th>순서</th>
              <th>게시</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((l) => {
              const partNum = (l.part ?? "").toString().replace(/[^0-9]/g, "");
              return (
                <tr key={l.id}>
                  <td><code>{l.id}</code></td>
                  <td>
                    <span className={`badge part-${partNum || "1"}`}>{l.part}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{l.title}</td>
                  <td>{l.words?.length ?? 0}</td>
                  <td>{l.orderIndex}</td>
                  <td className="muted">{l.publishedAt ? "✓" : "—"}</td>
                </tr>
              );
            })}
            {data && !data.length && (
              <tr>
                <td colSpan={6} className="muted">
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
