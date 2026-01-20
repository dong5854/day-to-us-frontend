# Day To Us

커플을 위한 생활 공유 서비스

## 💝 프로젝트 소개

**Day To Us**는 커플이 일상을 함께 관리하고 공유할 수 있는 Progressive Web Application입니다.

### 핵심 가치
- 💑 **함께 관리**: 커플이 함께 생활을 계획하고 관리
- 📊 **투명한 공유**: 수입과 지출을 투명하게 공유
- 🎯 **공동 목표**: 함께 목표를 세우고 달성

## ✨ 주요 기능

### 1차 기능 (MVP)
- 💰 **공동 가계부**
  - 수입/지출 기록 및 관리
  - 카테고리별 지출 분석
  - 월별 예산 설정 및 추적
  - 커플 간 실시간 동기화

### 향후 확장 계획
- 📅 일정 공유 및 관리
- 📸 사진/추억 앨범
- 🎂 기념일 알림
- 🎁 위시리스트

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── features/
│   └── budget/         # 가계부 기능
│       ├── api/        # API 클라이언트
│       ├── components/ # 가계부 컴포넌트
│       ├── hooks/      # 커스텀 hooks
│       └── types/      # 타입 정의
├── shared/
│   ├── api/            # 공통 API 설정
│   ├── components/     # 공통 UI 컴포넌트
│   ├── styles/         # 디자인 시스템
│   └── utils/          # 유틸리티 함수
├── App.tsx             # 메인 컴포넌트
└── main.tsx            # 엔트리 포인트
```

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.3.1 | Build tool |
| vite-plugin-pwa | 1.2.0 | PWA support |
| axios | 1.7.9 | HTTP client |
| date-fns | 4.1.0 | Date utility |
| ESLint | 9.39.1 | Code quality |

## 🎨 Design

- **Color Theme**: Blue-Purple Gradient (#667eea → #764ba2)
- **Typography**: Inter (Google Fonts)
- **Style**: Modern, Clean, Card-based Layout

## 📝 Development Guidelines

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `PascalCase.types.ts`

### TypeScript
- All React files use `.tsx` extension
- Type all component props
- Use `import type` for type-only imports
- Avoid `any` - use proper types

## 🔗 Backend API

- **Base URL**: http://localhost:8080
- **Swagger**: http://localhost:8080/swagger-ui/index.html

## 📚 Learn More

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PWA Documentation](https://vite-pwa-org.netlify.app/)

## 📄 License

Private
