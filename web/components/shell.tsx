"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { api, ApiError, getAccessToken, setAccessToken } from "@/lib/api";

const AUTH_ROUTES = ["/login", "/register"];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const [ready, setReady] = useState(isAuth);

  useEffect(() => {
    if (isAuth) {
      setReady(true);
      return;
    }
    // Client-side route guard: no token → login. Then validate the token
    // against the API (expired/invalid → clear + login).
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    let alive = true;
    api("/auth/me")
      .then(() => alive && setReady(true))
      .catch((e) => {
        if (!alive) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setAccessToken(null);
          if (typeof window !== "undefined") localStorage.removeItem("user");
          router.replace("/login");
        } else {
          // Network/server hiccup — don't lock the operator out.
          setReady(true);
        }
      });
    return () => {
      alive = false;
    };
  }, [pathname, isAuth, router]);

  if (isAuth) {
    return <div className="auth-shell">{children}</div>;
  }

  if (!ready) {
    return <div className="toast info" style={{ margin: 24 }}>로딩 중…</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
