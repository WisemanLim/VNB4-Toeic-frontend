# VNB4-Toeic-frontend

> 🌐 **언어 / Language**: **한국어** · [English](README.en.md)

Next.js 14 admin web + Tauri 2 desktop shell.

## Stack
- Next.js 14 App Router (MIT)
- shadcn/ui pattern (Radix MIT + Tailwind MIT) — source-copy의 light flavor (커스텀 components/)
- TanStack Query (MIT)
- Zustand (MIT)
- Tauri 2 (MIT/Apache-2.0)

## Why source-copy, not full shadcn CLI fork

shadcn/ui는 라이브러리가 아니라 "코드 소유" 패턴. 컴포넌트 코드를 본 리포에 직접 둠.
법적으로는 MIT 코드를 본 리포에 포함하는 것 → LICENSES.md에 명시. 별도 fork 트리거 없음.
컴포넌트 추가는 `pnpm dlx shadcn@latest add <component>` 호출 후 components/ui/ 에 누적.

## Structure

```
frontend/
├── web/         # Next.js admin (pnpm web:dev → :3000)
├── desktop/     # Tauri shell wrapping web/out (pnpm desktop:dev)
└── shared/      # cross-package types (backend shared re-export)
```

## PRD module mapping

| PRD 영역 | 위치 |
|---|---|
| §1.2 Admin 웹앱 | `web/app/*` |
| 로그인/회원가입 + 가드 | `web/app/login`·`web/app/register` + `web/components/shell.tsx`(미인증→`/login`, `/auth/me` 검증) |
| §1.2 Admin 데스크탑앱 | `desktop/src-tauri/*` |
| §5.2.4 Tauri 추천 | 동일 |
| 단어/예문 CRUD | `web/app/words/page.tsx` (M4) |
| 문장쓰기·쉐도잉 | `web/app/sentences/page.tsx` (KPI 198 + 표 + 파트필터) |
| 레슨 관리 | `web/app/lessons/page.tsx` (파트별 레슨·단어수) |
| TTS 배치 | `web/app/tts/page.tsx` (배치 생성 폼 + 큐 카운트 + 최근 배치, 5s 폴링) |
| 사용자 관리 | `web/app/users/page.tsx` (목록·검색·역할필터 + 역할별 KPI) |
| 통계/대시보드 | `web/app/page.tsx` (M6) |

> 관리 페이지 nav: `web/components/sidebar.tsx`. users/tts 는 admin/editor 권한 필요 — 비인증 시 권한 안내 토스트(401/403 graceful). 로그인: ops/env 의 기본 관리자(`SEED_ADMIN_EMAIL`).

## 연계 컴포넌트 (PRD §4)

- `backend/api` — 콘텐츠/통계 API (`/words`·`/sentences`·`/lessons`·`/users` 목록, `/tts/batch`·`/tts/jobs`, 각 `/stats`). Admin token (Bearer).
- `database` — 단어 원천 데이터(`seeds/parts/*.json`), Prisma 스키마.
- `app` — 동일 백엔드 소비. 단어 스키마(§2.2)는 app `src/core/schemas.ts` 와 정합 유지.

> **API base**: `web/lib/api.ts` 는 `NEXT_PUBLIC_API_URL`(오리진) + `/api/v1` 프리픽스로 호출 —
> 백엔드 NestJS `setGlobalPrefix("api/v1")` + 모바일 app client 규약과 일치. `.env.local` 에
> `NEXT_PUBLIC_API_URL=http://localhost:4000` (경로 없이 오리진만) 설정.

## Commands

```bash
pnpm install
pnpm web:dev        # admin :3000
pnpm desktop:dev    # tauri dev (requires Rust toolchain)
pnpm web:build      # SSR build
pnpm desktop:build  # cross-platform binary
```
