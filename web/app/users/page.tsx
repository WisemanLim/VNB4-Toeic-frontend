"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";

interface UserRow {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  locale: string;
  emailVerified?: string | null;
  createdAt: string;
}
interface ListResp {
  items: UserRow[];
  nextCursor: string | null;
}
interface StatsResp {
  total: number;
  byRole: Record<string, number>;
}

const ROLES = ["user", "editor", "admin"];

export default function UsersPage() {
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (search) params.set("search", search);
  params.set("limit", "50");

  const { data: stats } = useQuery<StatsResp>({
    queryKey: ["users", "stats"],
    queryFn: () => api<StatsResp>("/users/stats").catch(() => ({ total: 0, byRole: {} })),
  });

  const { data, isLoading, error } = useQuery<ListResp>({
    queryKey: ["users", role, search],
    queryFn: () => api(`/users?${params.toString()}`),
  });

  const forbidden = error instanceof ApiError && (error.status === 401 || error.status === 403);

  return (
    <div>
      <h1>사용자 관리</h1>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="muted">총 사용자</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.total ?? "—"}</div>
        </div>
        {ROLES.map((r) => (
          <div className="card" key={r}>
            <div className="muted">{r}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.byRole?.[r] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div>
          <label>역할</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">전체</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>검색</label>
          <input
            placeholder="이메일, 이름으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <div className="toast info">Loading…</div>}
      {forbidden && (
        <div className="toast error">관리자 권한이 필요합니다. (admin 계정으로 로그인하세요)</div>
      )}
      {error && !forbidden && <div className="toast error">{(error as Error).message}</div>}

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>이메일</th>
              <th>이름</th>
              <th>역할</th>
              <th>언어</th>
              <th>이메일 인증</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.email}</td>
                <td>{u.name ?? "—"}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>{u.locale}</td>
                <td className="muted">{u.emailVerified ? "✓" : "—"}</td>
                <td className="muted">{new Date(u.createdAt).toLocaleDateString("ko-KR")}</td>
              </tr>
            ))}
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
