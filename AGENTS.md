# Day To Us - AI Agent Guidelines & Context

This file defines the rules, guidelines, and project context that Antigravity agents (and other AI assistants) MUST strictly follow when working on this project.

## PART 1: STRICT RULES

### 1. PWA and Mobile Environment First
* This project prioritizes Mobile Web and PWA (Progressive Web App) environments above all else.
* For bottom navigation, modals, and any UI elements positioned at the bottom of the screen, you MUST apply `safe-area-inset-bottom` (e.g., `env(safe-area-inset-bottom)`) for padding to prevent overlapping with the iOS Home Indicator.
* When creating any overlay components (e.g., Modals, Bottom Sheets, Fullscreen Menus), you MUST apply `document.body.style.overflow = 'hidden'` to prevent scroll chaining (where the background page scrolls along with the overlay).

### 2. Prevent Duplicate Submission on IME (Korean Input)
* In mobile virtual keyboards, pressing 'Enter' after typing Korean can trigger duplicate form submissions due to the IME composition process.
* When handling keyboard events, you MUST place `if (e.nativeEvent.isComposing) return;` at the very top of the handler to prevent bugs related to composing keystrokes.

### 3. Strict Icon System (Use lucide-react)
* **NEVER use text-based emojis (e.g., ⚠️, ✅, ✕, ←, →) in the UI under any circumstances.** Emoji rendering differs drastically between devices (iOS/Android) and can break the layout.
* You MUST exclusively use icons provided by the `lucide-react` package.

### 4. Custom Component Recommendation
* When a dropdown (Select) feature is required, DO NOT write native `<select>` tags directly. You MUST use the pre-implemented custom component `@/shared/components/Select`. (This component is highly optimized for PWA mobile touch interactions.)

### 5. Prohibition of Heavy External Libraries
* UI styling must be done EXCLUSIVELY using TailwindCSS. DO NOT install or use heavy external component libraries like MUI, Chakra UI, or Ant Design.
* Global state management is sufficiently designed using pure React Context and Hooks. DO NOT arbitrarily introduce Redux, Zustand, or similar state management libraries.

### 6. Separation of API Logic (Custom Hook Pattern)
* DO NOT write API fetch logic (like axios calls) directly inside UI component files.
* You MUST isolate API communication, error handling, and loading state management into **Custom Hooks** (e.g., `useBudget`, `useSchedule`) following the domain separation principle.

---

## PART 2: PROJECT OVERVIEW & DOMAIN KNOWLEDGE

**Day To Us** - A life-sharing PWA service for couples.

### Core Domain
**Core Concept**: A platform for couples to manage and share their daily lives together.

**Core Features**:
- **Joint Budget (Budget)**: Income/expense records, real-time synchronization, category-based analysis, monthly budgeting.
- **Schedule Management (Schedule)**: Shared couple schedules, calendar view, category-based events.
- **Fixed Expenses (Fixed Expense)**: Management of recurring expenses and automatic reflection in the budget.
- **Space Management (Space)**: Creation and participation in a private, couple-exclusive workspace.

### Tech Stack
- **React** ^19.2.0 + **TypeScript** ~5.9.3
- **Vite** ^7.2.4 (build tool)
- **Tailwind CSS** ^4.1.18 (Styling)
- **React Router** ^7.12.0 (Routing)
- **vite-plugin-pwa** ^1.2.0 (PWA support)
- **axios** ^1.13.2 (HTTP client)
- **date-fns** ^4.1.0 (Date utility)

---

## PART 3: ARCHITECTURE & DESIGN SYSTEM

### Project Structure (Feature-Based)
* **Architecture Principles**:
  - Feature-based structure (modularization by feature)
  - Common code management through the `shared` folder
  - Each feature must be able to operate independently
  - Separation of the API layer (`client.ts` + `featureApi.ts`)

```text
src/
├── features/               # Feature modules
│   ├── auth/              # Authentication (Login/Signup)
│   ├── budget/            # Joint Budget features
│   ├── fixedExpense/      # Fixed Expense management
│   ├── schedule/          # Schedule management features
│   └── space/             # Space/Member management
├── pages/                 # Page components
│   ├── BudgetPage.tsx
│   ├── CalendarPage.tsx   # Integrated view for Calendar + Budget/Schedule
│   └── ...
├── shared/                # Shared modules
│   ├── api/
│   ├── components/        # Layout, Modal, Toast, etc.
│   └── utils/
```

### Design System (Tailwind CSS)
**Colors (Indigo Primary)**:
```css
/* Custom theme variables */
--color-primary-start: #4F46E5;
--color-primary-end: #4F46E5;

/* Utility classes */
.gradient-bg { background: linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%); }
```

**Animations**:
- `fade-in` - 0.2s ease-in-out opacity transition
- `slide-up` - 0.2s ease-in-out upward slide with fade

### Responsive Design Patterns
- **Mobile-First Approach**:
  - **Drawer Component**: Bottom sheet for mobile interactions (date selection, forms)
  - **Modal Component**: Desktop dialogs
  - **Breakpoint**: `md:` (768px) used to switch between mobile/desktop layouts

### Coding & Naming Conventions
- **Components**: PascalCase (`BudgetCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useBudget.ts`)
- **Utils**: camelCase (`formatCurrency.ts`)
- **Types**: PascalCase (`budget.types.ts`)
- Always type component props (e.g., `interface Props { ... }`)
- Use path aliases: `@/` → `./src/`
