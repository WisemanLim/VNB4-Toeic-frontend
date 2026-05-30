// Base origin of the API (no path). Backend mounts everything under /api/v1
// (NestJS setGlobalPrefix), matching the mobile app's client convention.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(public status: number, public payload: any) {
    super(payload?.message ?? `HTTP ${status}`);
  }
}

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("at", token);
    else localStorage.removeItem("at");
  }
}
export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") accessToken = localStorage.getItem("at");
  return accessToken;
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  const token = getAccessToken();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, payload);
  return payload as T;
}
