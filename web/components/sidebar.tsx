"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setAccessToken } from "@/lib/api";

const NAV: { href: string; label: string }[] = [
  { href: "/", label: "Dashboard" },
  { href: "/words", label: "단어" },
  { href: "/sentences", label: "문장쓰기" },
  { href: "/lessons", label: "레슨" },
  { href: "/tts", label: "TTS 배치" },
  { href: "/users", label: "사용자" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  function logout() {
    setAccessToken(null);
    if (typeof window !== "undefined") localStorage.removeItem("user");
    router.replace("/login");
  }

  return (
    <aside className="sidebar">
      <h2>VNB4 TOEIC Admin</h2>
      <nav>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={isActive(pathname, n.href) ? "active" : ""}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="user-card">
        <div>{user?.email ?? "—"}</div>
        <div>role: {user?.role ?? "—"}</div>
        <button className="logout" onClick={logout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
