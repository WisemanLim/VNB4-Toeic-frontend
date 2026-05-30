# VNB4-Toeic-frontend

> 🌐 **Language / 언어**: **English** · [한국어](README.md)

Next.js 14 admin web + Tauri 2 desktop shell.

## Stack
- Next.js 14 App Router (MIT)
- shadcn/ui pattern (Radix MIT + Tailwind MIT) — a light flavor of source-copy (custom components/)
- TanStack Query (MIT)
- Zustand (MIT)
- Tauri 2 (MIT/Apache-2.0)

## Why source-copy, not full shadcn CLI fork

shadcn/ui is not a library but a "code ownership" pattern. Component code lives directly in this repo.
Legally this means including MIT code in this repo → stated in LICENSES.md. No separate fork trigger.
To add a component, call `pnpm dlx shadcn@latest add <component>` and it accumulates under components/ui/.

## Structure

```
frontend/
├── web/         # Next.js admin (pnpm web:dev → :3000)
├── desktop/     # Tauri shell wrapping web/out (pnpm desktop:dev)
└── shared/      # cross-package types (backend shared re-export)
```

## PRD module mapping

| PRD area | Location |
|---|---|
| §1.2 Admin web app | `web/app/*` |
| Login/signup + guard | `web/app/login`·`web/app/register` + `web/components/shell.tsx` (unauthenticated → `/login`, validated via `/auth/me`) |
| §1.2 Admin desktop app | `desktop/src-tauri/*` |
| §5.2.4 Tauri recommendation | same |
| Word/example CRUD | `web/app/words/page.tsx` (M4) |
| 문장쓰기·쉐도잉 (sentence writing / shadowing) | `web/app/sentences/page.tsx` (KPI 198 + table + part filter) |
| 레슨 (lesson) management | `web/app/lessons/page.tsx` (per-part lessons / word counts) |
| TTS batch | `web/app/tts/page.tsx` (batch creation form + queue count + recent batches, 5s polling) |
| 사용자 (user) management | `web/app/users/page.tsx` (list/search/role filter + per-role KPIs) |
| Stats/dashboard | `web/app/page.tsx` (M6) |

> Admin page nav: `web/components/sidebar.tsx`. users/tts require admin/editor permissions — when unauthorized, a permission notice toast is shown (401/403 graceful). Login: the default admin from ops/env (`SEED_ADMIN_EMAIL`).

## Linked components (PRD §4)

- `backend/api` — content/stats API (`/words`·`/sentences`·`/lessons`·`/users` lists, `/tts/batch`·`/tts/jobs`, each `/stats`). Admin token (Bearer).
- `database` — word source data (`seeds/parts/*.json`), Prisma schema.
- `app` — consumes the same backend. The word schema (§2.2) stays consistent with the app's `src/core/schemas.ts`.

> **API base**: `web/lib/api.ts` calls with `NEXT_PUBLIC_API_URL` (origin) + `/api/v1` prefix —
> matching the backend NestJS `setGlobalPrefix("api/v1")` + the mobile app client convention. In `.env.local`, set
> `NEXT_PUBLIC_API_URL=http://localhost:4000` (origin only, no path).

## Commands

```bash
pnpm install
pnpm web:dev        # admin :3000
pnpm desktop:dev    # tauri dev (requires Rust toolchain)
pnpm web:build      # SSR build
pnpm desktop:build  # cross-platform binary
```
