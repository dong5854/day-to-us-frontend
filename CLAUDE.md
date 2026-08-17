# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Type-check (tsc -b) then build for production
npm run lint         # ESLint
npm run test         # Vitest in watch mode
npm run test:run     # Vitest single run
npx vitest run src/shared/utils/format.test.ts  # Run a single test file
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:8080   # Backend API base URL (defaults to /api)
```

Access via `import.meta.env.VITE_API_BASE_URL`. All env vars must be prefixed with `VITE_`.

## Architecture

**Couples life-sharing PWA** — React 19 + TypeScript + Vite + Tailwind CSS v4. Korean-language UI with Korean Won (₩) currency formatting.

### Feature-based structure

```
src/
├── features/{name}/     # Self-contained feature modules
│   ├── api/             # API functions using shared axios client
│   ├── components/      # Feature-specific React components
│   ├── hooks/           # Custom hooks (data fetching + state)
│   └── types/           # TypeScript interfaces
├── pages/               # Route-level page components
├── shared/              # Cross-feature code
│   ├── api/client.ts    # Axios instance with auth interceptor
│   ├── components/      # Layout, Modal, Drawer, Toast, ErrorBoundary
│   ├── hooks/           # useToast, useMediaQuery, useSwipe, useOutsideClick
│   └── utils/           # format.ts (currency/date), dateUtils.ts
└── App.tsx              # Routes: / (CalendarPage), /settings, /oauth2/redirect
```

Features: `auth`, `budget`, `fixedExpense`, `schedule`, `space`, `syncSetting`

### Data flow pattern

```
feature/api/*.ts  →  feature/hooks/use*.ts  →  Page/Component
   (axios calls)      (useState + useEffect)     (renders UI)
```

Hooks own the fetch-on-mount lifecycle and expose CRUD functions that optimistically update local state. No global state library — each hook manages its own state.

### Auth

OAuth 2.0 via Google. Token stored in `localStorage` as `accessToken`. The axios request interceptor attaches `Authorization: Bearer {token}`. 401 responses redirect to login.

### Responsive design

Mobile-first with `md:` (768px) breakpoint. Use `Drawer` for mobile bottom sheets and `Modal` for desktop dialogs. `useMediaQuery` hook for runtime breakpoint detection.

### Path alias

`@/` maps to `./src/` (configured in both vite.config.ts and tsconfig).

## Conventions

- Components: `PascalCase.tsx`, Hooks: `useCamelCase.ts`, Types: `name.types.ts`
- Always type component props with an `interface Props`
- Use `type` imports for type-only imports: `import type { FC } from 'react'`
- date-fns for date manipulation, Tailwind for all styling, lucide-react for icons
- Tests use Vitest + happy-dom + @testing-library/react

## Git Commit Rules

- CLAUDE.md는 커밋하지 않는다
- Co-Authored-By 등 coworker 관련 내용은 커밋 메시지에 포함하지 않는다
- 기존 히스토리 스타일을 따른다: `feat(scope):`, `fix(scope):`, `refactor(scope):` 형식
- 기능별로 나누어 커밋한다
