"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";

interface JobRow {
  id: string;
  kind: string;
  status: string;
  payload: { wordIds?: string[]; locales?: string[]; provider?: string };
  attempts: number;
  createdAt: string;
}
interface JobsResp {
  items: JobRow[];
  counts: Record<string, number>;
}

const LOCALES = ["en-US", "en-GB", "en-AU"];
const PROVIDERS = ["azure", "polly", "google", "piper"];
const COUNT_KEYS = ["waiting", "active", "completed", "failed", "delayed"];

export default function TtsPage() {
  const qc = useQueryClient();
  const [wordIdsText, setWordIdsText] = useState("");
  const [locales, setLocales] = useState<string[]>(["en-US"]);
  const [provider, setProvider] = useState("azure");

  const { data, isLoading, error } = useQuery<JobsResp>({
    queryKey: ["tts", "jobs"],
    queryFn: () => api(`/tts/jobs?limit=30`),
    refetchInterval: 5000,
  });

  const batch = useMutation({
    mutationFn: () =>
      api<{ jobId: string; enqueued: number }>("/tts/batch", {
        method: "POST",
        json: {
          wordIds: wordIdsText.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean),
          locales,
          provider,
        },
      }),
    onSuccess: () => {
      setWordIdsText("");
      qc.invalidateQueries({ queryKey: ["tts", "jobs"] });
    },
  });

  const forbidden =
    (error instanceof ApiError && (error.status === 401 || error.status === 403)) ||
    (batch.error instanceof ApiError && (batch.error.status === 401 || batch.error.status === 403));

  function toggleLocale(l: string) {
    setLocales((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));
  }

  return (
    <div>
      <h1>TTS 배치</h1>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {COUNT_KEYS.map((k) => (
          <div className="card" key={k}>
            <div className="muted">{k}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{data?.counts?.[k] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>새 배치 생성</h2>
        <div style={{ marginBottom: 8 }}>
          <label>Word IDs (공백/쉼표 구분)</label>
          <textarea
            rows={3}
            style={{ width: "100%" }}
            placeholder="toeic-p1-pavement toeic-p1-warehouse …"
            value={wordIdsText}
            onChange={(e) => setWordIdsText(e.target.value)}
          />
        </div>
        <div className="toolbar" style={{ alignItems: "center" }}>
          <div>
            <label>로케일</label>
            <div style={{ display: "flex", gap: 12 }}>
              {LOCALES.map((l) => (
                <label key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" checked={locales.includes(l)} onChange={() => toggleLocale(l)} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label>provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => batch.mutate()}
            disabled={batch.isPending || !wordIdsText.trim() || !locales.length}
          >
            {batch.isPending ? "전송 중…" : "배치 enqueue"}
          </button>
        </div>
        {batch.isSuccess && (
          <div className="toast info">enqueued {batch.data?.enqueued}건 (job {batch.data?.jobId})</div>
        )}
        {forbidden && (
          <div className="toast error">admin/editor 권한이 필요합니다.</div>
        )}
        {batch.error && !forbidden && (
          <div className="toast error">{(batch.error as Error).message}</div>
        )}
      </div>

      <h2>최근 배치</h2>
      {isLoading && <div className="toast info">Loading…</div>}
      {error && !forbidden && <div className="toast error">{(error as Error).message}</div>}
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>상태</th>
              <th>단어 수</th>
              <th>로케일</th>
              <th>provider</th>
              <th>생성</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((j) => (
              <tr key={j.id}>
                <td><code>{j.id}</code></td>
                <td><span className="badge">{j.status}</span></td>
                <td>{j.payload?.wordIds?.length ?? 0}</td>
                <td className="muted">{(j.payload?.locales ?? []).join(", ")}</td>
                <td>{j.payload?.provider ?? "—"}</td>
                <td className="muted">{new Date(j.createdAt).toLocaleString("ko-KR")}</td>
              </tr>
            ))}
            {data && !data.items.length && (
              <tr>
                <td colSpan={6} className="muted">
                  배치 없음
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
