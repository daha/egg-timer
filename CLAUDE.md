# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an egg timer web application designed to help users boil multiple eggs with different weights and preferences (soft, medium, hard) in the same pot. The application calculates optimal timing for when to add each egg to ensure they all finish at the desired doneness level.

**Live Application:** https://daha.github.io/egg-timer/

### Key Features

- Add multiple eggs with weight (grams) and doneness preference
- Calculate staggered start times so all eggs finish together
- Browser notifications for when to add each egg to the pot
- Notification when eggs are done boiling
- 2-minute cooling timer reminder after boiling completes
- Progressive Web App (PWA) with service worker support
- Persistent state using localStorage
- Wake Lock API to keep screen active during timing
- iOS-optimized audio and notification support
- Clean, responsive user interface

## Technology Stack

### Core Technologies
- **Framework:** React 18.3+ with TypeScript 5.6+
- **Build Tool:** Vite 6.0+
- **Testing:** Vitest 4.0+ with @testing-library/react
- **Linting:** ESLint 9.38+ with TypeScript and React plugins
- **Formatting:** Prettier 3.6+
- **Git Hooks:** Husky 9.1+ with lint-staged

### Browser APIs Used
- **Notifications API:** For alerting users when to add eggs
- **Wake Lock API:** Prevents screen from sleeping during active timer
- **Web Storage API:** localStorage for persisting timer state and eggs
- **Web Audio API:** For iOS notification sounds
- **Service Worker:** For PWA offline support

## Codebase Structure

```
egg-timer/
├── src/
│   ├── components/        # React components
│   │   ├── EggForm.tsx           # Form to add new eggs
│   │   ├── EggList.tsx           # Display list of eggs
│   │   ├── EggItem.tsx           # Individual egg display
│   │   ├── TimerDisplay.tsx      # Main timer display
│   │   ├── TimerControls.tsx     # Start/pause/reset controls
│   │   └── NotificationBanner.tsx # In-app notification display
│   ├── hooks/             # Custom React hooks
│   │   ├── useEggTimer.ts        # Main timer state management
│   │   ├── useNotifications.ts   # Browser notification handling
│   │   ├── useWakeLock.ts        # Screen wake lock management
│   │   └── useLocalStorage.ts    # State persistence
│   ├── core/              # Business logic (framework-agnostic)
│   │   ├── eggCalculations.ts    # Egg timing formulas
│   │   └── notificationScheduler.ts # Notification timing logic
│   ├── utils/             # Utility functions
│   │   └── storage.ts            # localStorage helpers
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Main application component
│   ├── App.css            # Application styles
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles
├── tests/                 # Test files (mirrors src structure)
│   ├── components/        # Component tests
│   ├── hooks/             # Hook tests
│   ├── core/              # Business logic tests
│   ├── utils/             # Utility tests
│   ├── integration/       # Integration tests
│   └── setup.ts           # Vitest setup
├── public/                # Static assets
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   ├── sounds/            # Audio files for notifications
│   └── *.svg              # Icon files
├── scripts/               # Build and utility scripts
├── .github/workflows/     # CI/CD workflows
├── .husky/                # Git hooks
└── [config files]         # Various config files
```

### Architecture Patterns

1. **Separation of Concerns:**
   - `core/`: Pure TypeScript business logic (no React dependencies)
   - `hooks/`: React-specific state management
   - `components/`: UI presentation layer

2. **State Management:**
   - Centralized timer state in `useEggTimer` hook
   - localStorage persistence via `useLocalStorage` hook
   - No external state management library (uses React hooks)

3. **Testing Strategy:**
   - Unit tests for all business logic in `core/`
   - Hook tests using React Testing Library
   - Component tests for UI interactions
   - Integration tests for complete user flows

## Egg Boiling Time Formula

The core calculation is based on the formula for eggs stored in refrigerator (~6°C):

```
t = 197 + 4.6 * w
```

where:
- `t` = time in seconds
- `w` = weight of the egg in grams

**Doneness Adjustments:**
- Soft boiled: -30 seconds
- Medium boiled: 0 seconds (baseline)
- Harder boiled: +45 seconds
- Hard boiled: +90 seconds

**Temperature Adjustments:**
- Refrigerated eggs (~6°C): 0 seconds (baseline)
- Room temperature eggs (~20°C): -30 seconds

**Implementation:** See `src/core/eggCalculations.ts:15`

## Development Workflows

### Initial Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```
   This automatically runs the `prepare` script which initializes Husky git hooks.

2. **Verify hooks are installed:**
   ```bash
   git config core.hooksPath  # Should output: .husky/_
   ```

### Development Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:5173
npm run dev -- --host    # Start dev server and bind to all IPs

# Building
npm run build            # TypeScript compile + production build
npm run preview          # Preview production build locally

# Testing
npm run test             # Run tests in watch mode
npm run test -- --run    # Run tests once (CI mode)
npm run test:ui          # Run tests with UI dashboard

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Pre-commit Hooks

**Husky** runs the following checks automatically on every commit:

1. **lint-staged:** Runs ESLint and Prettier on staged files only
   - `*.{ts,tsx}`: ESLint fix + Prettier format
   - `*.{css,md}`: Prettier format

**Note:** Tests are NOT run in pre-commit hooks to allow WIP commits. Tests must pass in CI before merging.

## CI/CD Workflows

### GitHub Actions Workflows

1. **`ci.yml`** - Continuous Integration (all branches except main)
   - Runs on: All branches, pull requests
   - Node versions: 20, 22 (matrix)
   - Steps:
     1. Format check (`npm run format:check`)
     2. TypeScript type check (`npx tsc --noEmit`)
     3. Lint (`npm run lint`)
     4. Tests with coverage (`npm run test -- --run --coverage`)
     5. Build verification
     6. Verify critical build artifacts (index.html, manifest.json, sw.js)

2. **`deploy.yml`** - Deploy to GitHub Pages (main branch only)
   - Runs on: Push to `main` branch
   - Node version: 20
   - Steps:
     1. Format check
     2. TypeScript type check
     3. Lint
     4. Tests
     5. Build
     6. Deploy to GitHub Pages

### Deployment

**Target:** GitHub Pages
**URL:** https://daha.github.io/egg-timer/
**Base Path:** `/egg-timer/` (configured in `vite.config.ts`)

**Deployment Process:**
1. Push to `main` branch
2. GitHub Actions runs all quality checks
3. If all checks pass, builds and deploys to GitHub Pages
4. Live site updates automatically

**GitHub Pages Setup:**
- Settings → Pages → Source: **GitHub Actions**
- Workflow: `.github/workflows/deploy.yml`

## Testing Guidelines

### Test Organization

Tests mirror the `src/` directory structure:
- `tests/components/` - React component tests
- `tests/hooks/` - Custom hook tests
- `tests/core/` - Business logic tests
- `tests/utils/` - Utility function tests
- `tests/integration/` - End-to-end integration tests

### Test Requirements

All code should have unit tests where applicable:
- **Core business logic:** 100% coverage expected
- **Hooks:** Test state management and side effects
- **Components:** Test user interactions and rendering
- **Edge cases:** Different egg weights, multiple eggs, timer states

### Running Tests

```bash
# Watch mode (development)
npm run test

# Single run (CI)
npm run test -- --run

# With coverage
npm run test -- --run --coverage

# UI dashboard
npm run test:ui
```

**Test Configuration:** `vitest.config.ts`
- Environment: jsdom
- Setup file: `tests/setup.ts`
- Timeout: 15 seconds (for timer-based tests)

## Code Style and Conventions

### TypeScript

- **Strict mode enabled:** All TypeScript strict checks active
- **Type definitions:** Centralized in `src/types/index.ts`
- **No `any` types:** Use proper typing or `unknown` with type guards
- **Explicit return types:** For exported functions

### ESLint Configuration

See `eslint.config.js` for full configuration:
- TypeScript recommended rules
- React recommended rules
- React Hooks rules
- Prettier integration (no formatting rules)
- Custom globals for browser APIs

### Prettier Configuration

See `.prettierrc`:
- **Semi-colons:** Required (`;`)
- **Quotes:** Single quotes (`'`)
- **Trailing commas:** ES5-compatible
- **Print width:** 80 characters
- **Tab width:** 2 spaces

### File Naming

- **Components:** PascalCase (e.g., `EggForm.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useEggTimer.ts`)
- **Utilities:** camelCase (e.g., `storage.ts`)
- **Types:** camelCase (e.g., `index.ts`)
- **Tests:** Match source file with `.test.tsx` or `.test.ts` suffix

### Component Structure

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { Egg } from '../types';

// 2. Types/interfaces
interface Props {
  onAddEgg: (egg: Egg) => void;
}

// 3. Component definition
export function EggForm({ onAddEgg }: Props) {
  // 4. Hooks
  const [weight, setWeight] = useState(60);

  // 5. Event handlers
  const handleSubmit = () => { /* ... */ };

  // 6. Render
  return <form>...</form>;
}
```

## Important Implementation Details

### State Persistence

- **localStorage key:** `'egg-timer-state'`
- **Persisted data:** eggs, timer status, elapsed time, timestamps
- **Restoration:** On app mount, restores previous session if exists
- **Implementation:** `src/hooks/useLocalStorage.ts:1`

### Notification System

1. **Permission Request:** User must grant browser notification permission
2. **Notification Types:**
   - "Add egg" notifications (when to add each egg to pot)
   - "Boiling complete" notification
   - "Cooling complete" notification
3. **iOS Support:** Uses Web Audio API for sounds (auto-initialized on user interaction)
4. **In-app Banner:** Shows notifications even without permission
5. **Implementation:** `src/hooks/useNotifications.ts:1`

### Timer Calculations

- **Staggered Start Times:** Eggs with longer boil times are added first
- **Example:** If egg A needs 300s and egg B needs 240s, add egg A at 0s and egg B at 60s
- **Cooling Period:** Fixed 120 seconds (2 minutes) after boiling
- **Implementation:** `src/core/eggCalculations.ts:23`

### PWA Features

- **Service Worker:** `public/sw.js` (cache-first strategy)
- **Manifest:** `public/manifest.json` (name, icons, theme)
- **Icons:** SVG icons with PNG fallbacks for different sizes
- **Installable:** Can be added to home screen on mobile devices

## Common Tasks for Claude Code

### Adding a New Feature

1. **Plan the implementation:**
   - Identify which layer(s) to modify (core/hooks/components)
   - Write tests first (TDD approach recommended)
   - Update types if needed

2. **Implement the feature:**
   - Core logic in `src/core/`
   - State management in `src/hooks/`
   - UI in `src/components/`

3. **Test thoroughly:**
   - Unit tests for business logic
   - Integration tests for user flows
   - Manual testing in browser

4. **Verify quality checks:**
   ```bash
   npm run lint
   npm run format:check
   npm run test -- --run
   npm run build
   ```

### Debugging Issues

1. **Check browser console:** Most issues show errors there
2. **Verify localStorage:** May need to clear for testing
3. **Check notification permissions:** Common source of issues
4. **Test in different browsers:** Especially Safari for iOS-specific features
5. **Review CI logs:** GitHub Actions logs show detailed error messages

### Modifying the Timer Formula

1. **Update:** `src/core/eggCalculations.ts`
2. **Update tests:** `tests/core/eggCalculations.test.ts`
3. **Update documentation:** This file and `README.md`
4. **Verify:** Run full test suite

### Adding New Egg Preferences

1. **Update type:** `src/types/index.ts` (`DonenessLevel` type)
2. **Update adjustments:** `src/core/eggCalculations.ts` (`DONENESS_ADJUSTMENTS`)
3. **Update UI:** `src/components/EggForm.tsx` (dropdown options)
4. **Add tests:** `tests/core/eggCalculations.test.ts`

## Troubleshooting

### Common Issues

**Build Failures:**
- Check TypeScript errors: `npx tsc --noEmit`
- Check ESLint: `npm run lint`
- Check Prettier: `npm run format:check`

**Test Failures in CI:**
- Run locally first: `npm run test -- --run`
- Check for timing-dependent tests (use fake timers)
- Verify jsdom environment compatibility

**Notification Issues:**
- HTTPS required for production (HTTP may not work)
- iOS requires PWA installation for best results
- Check browser compatibility (modern browsers only)

**localStorage Issues:**
- Check browser privacy settings
- Clear storage for fresh start: `localStorage.clear()`
- Handle quota exceeded errors

## Additional Resources

- **Vite Documentation:** https://vite.dev/
- **Vitest Documentation:** https://vitest.dev/
- **React Testing Library:** https://testing-library.com/react
- **Notifications API:** https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- **Wake Lock API:** https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API

## Notes for AI Assistants

- **Always run tests** after making changes to core logic
- **Maintain test coverage** when adding new features
- **Follow existing patterns** in the codebase
- **Update this file** if making significant architectural changes
- **Respect the separation** between core logic (pure TS) and React code
- **Consider iOS compatibility** when working with notifications or audio
- **Test in production build** (`npm run build && npm run preview`) for PWA features
- **Commit messages** should be clear and descriptive (project uses standard commit practices)
