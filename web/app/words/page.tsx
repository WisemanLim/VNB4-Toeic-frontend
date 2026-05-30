"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";

interface WordRow {
  id: string;
  part: string;
  word: string;
  meaningKo: string;
  ipa?: string;
  pronKo?: string;
  exampleEn?: string;
}
interface ListResp {
  items: WordRow[];
  nextCursor: string | null;
}

export default function WordsPage() {
  const [part, setPart] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const params = new URLSearchParams();
  if (part) params.set("part", String(part));
  if (search) params.set("search", search);

  const { data, isLoading, error } = useQuery<ListResp>({
    queryKey: ["words", part, search],
    queryFn: () => api(`/words?${params.toString()}`),
  });

  return (
    <div>
      <h1>단어 관리</h1>

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
        <div style={{ flex: 1 }}>
          <label>검색</label>
          <input
            placeholder="단어, 의미, IPA로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              <th>Word</th>
              <th>의미</th>
              <th>IPA</th>
              <th>한글발음</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((w) => {
              const partNum = (w.part ?? "").toString().replace(/[^0-9]/g, "");
              return (
                <tr key={w.id}>
                  <td><code>{w.id}</code></td>
                  <td>
                    <span className={`badge part-${partNum || "1"}`}>{w.part}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{w.word}</td>
                  <td>{w.meaningKo}</td>
                  <td><code>{w.ipa}</code></td>
                  <td>{w.pronKo}</td>
                </tr>
              );
            })}
            {data && !data.items.length && (
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
