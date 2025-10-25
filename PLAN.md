# Egg Timer Application - Implementation Plan

## Project Overview

An intelligent egg timer web application that helps users boil multiple eggs with different weights and doneness preferences (soft, medium, hard) in the same pot. The app calculates staggered start times to ensure all eggs finish at the desired doneness level simultaneously.

**Deployment Target**: GitHub Pages at `https://daha.github.io/egg-timer/`

## Technology Stack

### Core Technologies
- **React 18**: Component-based UI framework for managing timer state and user interactions
- **TypeScript**: Type safety for calculation logic and state management
- **Vite**: Modern build tool with fast HMR, optimized for GitHub Pages deployment
- **Vitest**: Testing framework integrated with Vite for unit tests

### Development Tools
- **ESLint**: Code linting with TypeScript and React rules
- **Prettier**: Code formatting for consistency
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files only

### Features
- **Browser Notifications API**: Native notifications when eggs need to be added/removed
- **localStorage**: Persist eggs and preferences between sessions
- **Web Audio API**: Sound alerts for notifications

### Rationale
- **Vite + React + TypeScript**: Modern stack with excellent developer experience and performance
- **No backend required**: Static site suitable for GitHub Pages
- **Browser APIs**: Native notifications and storage without external dependencies
- **Vitest**: Fast testing with Vite integration, no separate Jest configuration needed

## Architecture

### Application Structure
```
egg-timer/
├── src/
│   ├── components/        # React components
│   │   ├── EggForm.tsx           # Form to add new eggs
│   │   ├── EggList.tsx           # List of added eggs
│   │   ├── EggItem.tsx           # Individual egg display
│   │   ├── TimerDisplay.tsx      # Main countdown timer
│   │   ├── TimerControls.tsx     # Start/Stop/Reset buttons
│   │   └── NotificationBanner.tsx # Visual notification display
│   ├── core/              # Business logic (framework-agnostic)
│   │   ├── eggCalculations.ts    # Timing formula calculations
│   │   ├── timerEngine.ts        # Timer state machine
│   │   └── notificationScheduler.ts # Schedule notifications
│   ├── hooks/             # React hooks
│   │   ├── useEggTimer.ts        # Main timer logic hook
│   │   ├── useNotifications.ts   # Notification management
│   │   └── useLocalStorage.ts    # Persistence hook
│   ├── types/             # TypeScript definitions
│   │   └── index.ts              # All type definitions
│   ├── utils/             # Utility functions
│   │   └── storage.ts            # localStorage helpers
│   ├── App.tsx            # Root component
│   ├── App.css            # Main styles
│   └── main.tsx           # Entry point
├── tests/                 # Test files
│   ├── core/
│   │   ├── eggCalculations.test.ts
│   │   ├── timerEngine.test.ts
│   │   └── notificationScheduler.test.ts
│   └── components/
│       └── (component tests as needed)
├── public/                # Static assets
│   ├── sounds/
│   │   └── notification.mp3      # Alert sound
│   └── favicon.ico
├── .husky/                # Git hooks
│   └── pre-commit
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions for deployment
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.json
├── .prettierrc
├── vitest.config.ts
└── README.md
```

## Core Calculations

### Egg Boiling Time Formula

Base formula for refrigerated eggs (~6°C):
```
t = 197 + 4.6 * w
```

Where:
- `t` = time in seconds
- `w` = weight of the egg in grams

### Adjustments
- **Soft boiled**: Base time - 30 seconds
- **Medium boiled**: Base time (no adjustment)
- **Harder boiled**: Base time + 45 seconds
- **Hard boiled**: Base time + 90 seconds
- **Room temperature** (~20°C): Additional -30 seconds to any doneness level

### Staggered Start Time Logic

For multiple eggs to finish simultaneously:
1. Calculate total boiling time for each egg
2. Find the egg with the longest boiling time (this is the "first egg")
3. For each other egg, calculate delay = (longest_time - egg_time)
4. Schedule notification at delay seconds after timer starts

**Example**:
- Egg A: 50g, soft → 367 seconds (197 + 4.6*50 - 30)
- Egg B: 70g, hard → 609 seconds (197 + 4.6*70 + 90)
- Egg C: 60g, medium → 473 seconds (197 + 4.6*60)

Timeline:
- Start timer → Add Egg B immediately (609s remaining)
- After 136s → Add Egg C (473s remaining)
- After 242s → Add Egg A (367s remaining)
- After 609s → All eggs done!

### Cooling Phase
After all eggs are done boiling, start a 2-minute (120 second) cooling timer reminder.

## Implementation Tasks

Each task below is self-contained and can be implemented independently by different agents.

---

### Task 1: Project Initialization

**Description**: Set up the base project with Vite, React, and TypeScript.

**Steps**:
1. Run `npm create vite@latest . -- --template react-ts`
2. Update `package.json` with project details
3. Configure `vite.config.ts` for GitHub Pages deployment (set `base: '/egg-timer/'`)
4. Create basic folder structure (`src/components`, `src/core`, `src/hooks`, `src/types`, `src/utils`, `tests`)
5. Update `index.html` with appropriate title and meta tags

**Acceptance Criteria**:
- Project runs with `npm run dev`
- TypeScript compilation works without errors
- Vite config has correct base path for GitHub Pages
- Folder structure matches architecture

**Files Created/Modified**:
- `package.json`
- `vite.config.ts`
- `index.html`
- Folder structure

---

### Task 2: Development Tooling Setup

**Description**: Configure ESLint, Prettier, and Vitest for code quality and testing.

**Steps**:
1. Install dependencies:
   ```bash
   npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
   npm install -D eslint-plugin-react eslint-plugin-react-hooks
   npm install -D prettier eslint-config-prettier
   npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
   ```

2. Create `.eslintrc.json`:
   ```json
   {
     "extends": [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended",
       "plugin:react/recommended",
       "plugin:react-hooks/recommended",
       "prettier"
     ],
     "parser": "@typescript-eslint/parser",
     "plugins": ["@typescript-eslint", "react"],
     "settings": {
       "react": {
         "version": "detect"
       }
     },
     "rules": {
       "react/react-in-jsx-scope": "off"
     }
   }
   ```

3. Create `.prettierrc`:
   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2
   }
   ```

4. Create `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './tests/setup.ts',
     },
   });
   ```

5. Create `tests/setup.ts` with testing library setup

6. Add scripts to `package.json`:
   ```json
   "scripts": {
     "test": "vitest",
     "test:ui": "vitest --ui",
     "lint": "eslint . --ext .ts,.tsx",
     "lint:fix": "eslint . --ext .ts,.tsx --fix",
     "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
     "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\""
   }
   ```

**Acceptance Criteria**:
- `npm run lint` runs without errors
- `npm run format:check` passes
- `npm run test` runs (even if no tests yet)
- ESLint and Prettier configs are compatible

**Files Created**:
- `.eslintrc.json`
- `.prettierrc`
- `vitest.config.ts`
- `tests/setup.ts`

---

### Task 3: Pre-commit Hooks Setup

**Description**: Configure Husky and lint-staged to run tests and linting before commits.

**Steps**:
1. Install dependencies:
   ```bash
   npm install -D husky lint-staged
   npx husky init
   ```

2. Update `package.json` to add lint-staged configuration:
   ```json
   "lint-staged": {
     "*.{ts,tsx}": [
       "eslint --fix",
       "prettier --write"
     ],
     "*.{css,md}": [
       "prettier --write"
     ]
   }
   ```

3. Create `.husky/pre-commit`:
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"

   # Run lint-staged
   npx lint-staged

   # Run tests
   npm run test -- --run
   ```

4. Make pre-commit hook executable:
   ```bash
   chmod +x .husky/pre-commit
   ```

**Acceptance Criteria**:
- Pre-commit hook runs automatically on `git commit`
- Hook runs linting and formatting on staged files
- Hook runs test suite
- Commit is blocked if tests fail or linting errors exist
- Successfully committed files are properly formatted

**Files Created**:
- `.husky/pre-commit`
- Updated `package.json` with lint-staged config

---

### Task 4: Egg Timing Calculation Module

**Description**: Implement the core calculation logic for egg boiling times with comprehensive tests.

**Steps**:
1. Create `src/types/index.ts` with type definitions:
   ```typescript
   export type DonenessLevel = 'soft' | 'medium' | 'harder' | 'hard';
   export type TemperatureLevel = 'refrigerated' | 'room';

   export interface Egg {
     id: string;
     weight: number; // grams
     doneness: DonenessLevel;
     temperature: TemperatureLevel;
   }

   export interface EggTiming {
     eggId: string;
     boilTime: number; // seconds
     addAtSecond: number; // when to add this egg to pot
   }

   export interface TimerState {
     eggs: Egg[];
     timings: EggTiming[];
     totalTime: number; // longest boil time
     status: 'idle' | 'running' | 'paused' | 'cooling' | 'complete';
     elapsedSeconds: number;
     coolingElapsed: number;
   }
   ```

2. Create `src/core/eggCalculations.ts`:
   ```typescript
   import { Egg, DonenessLevel, TemperatureLevel, EggTiming } from '../types';

   const DONENESS_ADJUSTMENTS: Record<DonenessLevel, number> = {
     soft: -30,
     medium: 0,
     harder: 45,
     hard: 90,
   };

   const TEMPERATURE_ADJUSTMENTS: Record<TemperatureLevel, number> = {
     refrigerated: 0,
     room: -30,
   };

   export function calculateBoilTime(egg: Egg): number {
     const baseTime = 197 + 4.6 * egg.weight;
     const donenessAdjustment = DONENESS_ADJUSTMENTS[egg.doneness];
     const tempAdjustment = TEMPERATURE_ADJUSTMENTS[egg.temperature];

     return Math.round(baseTime + donenessAdjustment + tempAdjustment);
   }

   export function calculateEggTimings(eggs: Egg[]): EggTiming[] {
     if (eggs.length === 0) return [];

     const timings: EggTiming[] = eggs.map((egg) => ({
       eggId: egg.id,
       boilTime: calculateBoilTime(egg),
       addAtSecond: 0, // Will be calculated next
     }));

     const maxBoilTime = Math.max(...timings.map((t) => t.boilTime));

     return timings.map((timing) => ({
       ...timing,
       addAtSecond: maxBoilTime - timing.boilTime,
     }));
   }

   export function getTotalTime(eggs: Egg[]): number {
     if (eggs.length === 0) return 0;
     const timings = calculateEggTimings(eggs);
     return Math.max(...timings.map((t) => t.boilTime));
   }
   ```

3. Create `tests/core/eggCalculations.test.ts`:
   - Test base formula: 50g medium refrigerated egg = 427s
   - Test soft boiled: 50g soft refrigerated = 397s
   - Test hard boiled: 50g hard refrigerated = 517s
   - Test room temperature: 50g medium room temp = 397s
   - Test multiple eggs with staggered timings
   - Test edge cases: very small eggs (30g), large eggs (80g)
   - Test empty egg list

**Acceptance Criteria**:
- All calculation functions are pure (no side effects)
- Formula matches specification exactly
- All tests pass with 100% code coverage
- Type definitions are complete and exported
- Functions handle edge cases (empty arrays, extreme weights)

**Files Created**:
- `src/types/index.ts`
- `src/core/eggCalculations.ts`
- `tests/core/eggCalculations.test.ts`

---

### Task 5: State Management with React Context

**Description**: Create React Context and custom hooks for managing application state.

**Steps**:
1. Create `src/hooks/useEggTimer.ts`:
   - Manage `TimerState` with useReducer
   - Actions: ADD_EGG, REMOVE_EGG, START_TIMER, PAUSE_TIMER, RESET_TIMER, TICK, START_COOLING, COMPLETE
   - Integrate with `calculateEggTimings` from Task 4
   - Use `useEffect` to handle timer ticks (1-second interval)
   - Handle transition from boiling to cooling phase
   - Return state and action dispatchers

2. Timer tick logic:
   - When running, increment `elapsedSeconds` every second
   - Check if any eggs need "add now" notifications
   - Check if boiling is complete → transition to cooling
   - When cooling, increment `coolingElapsed`
   - Check if cooling complete (120s) → transition to complete

3. Export hook interface:
   ```typescript
   export function useEggTimer() {
     return {
       state: TimerState,
       addEgg: (egg: Egg) => void,
       removeEgg: (eggId: string) => void,
       startTimer: () => void,
       pauseTimer: () => void,
       resetTimer: () => void,
     };
   }
   ```

**Acceptance Criteria**:
- State updates are predictable and type-safe
- Timer accurately counts seconds
- State transitions work correctly (idle → running → cooling → complete)
- Can add/remove eggs before timer starts
- Cannot add/remove eggs while timer is running
- Pausing and resuming works correctly

**Files Created**:
- `src/hooks/useEggTimer.ts`

---

### Task 6: LocalStorage Persistence

**Description**: Implement localStorage persistence for eggs and preferences.

**Steps**:
1. Create `src/utils/storage.ts`:
   ```typescript
   import { Egg } from '../types';

   const STORAGE_KEY = 'egg-timer-data';

   interface StoredData {
     eggs: Egg[];
     version: number; // for future migrations
   }

   export function loadEggs(): Egg[] {
     try {
       const stored = localStorage.getItem(STORAGE_KEY);
       if (!stored) return [];

       const data: StoredData = JSON.parse(stored);
       return data.eggs || [];
     } catch (error) {
       console.error('Failed to load eggs from storage:', error);
       return [];
     }
   }

   export function saveEggs(eggs: Egg[]): void {
     try {
       const data: StoredData = {
         eggs,
         version: 1,
       };
       localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
     } catch (error) {
       console.error('Failed to save eggs to storage:', error);
     }
   }

   export function clearStorage(): void {
     localStorage.removeItem(STORAGE_KEY);
   }
   ```

2. Create `src/hooks/useLocalStorage.ts`:
   ```typescript
   import { useEffect } from 'react';
   import { Egg } from '../types';
   import { loadEggs, saveEggs } from '../utils/storage';

   export function useLocalStorage(
     eggs: Egg[],
     isTimerRunning: boolean
   ) {
     // Load eggs on mount
     useEffect(() => {
       const stored = loadEggs();
       // Only load if timer is not running
       if (!isTimerRunning && stored.length > 0) {
         // Dispatch action to restore eggs
       }
     }, []);

     // Save eggs whenever they change (but not while timer is running)
     useEffect(() => {
       if (!isTimerRunning) {
         saveEggs(eggs);
       }
     }, [eggs, isTimerRunning]);
   }
   ```

3. Integrate with `useEggTimer` hook from Task 5
4. Add a "Clear all saved eggs" button to UI

**Acceptance Criteria**:
- Eggs persist across browser sessions
- Storage doesn't interfere with running timer
- Invalid/corrupted data is handled gracefully
- Storage is cleared when user explicitly requests it
- Storage doesn't save during active timer (only idle state)

**Files Created**:
- `src/utils/storage.ts`
- `src/hooks/useLocalStorage.ts`
- `tests/utils/storage.test.ts` (optional but recommended)

---

### Task 7: Notification System

**Description**: Implement browser notifications and audio alerts.

**Steps**:
1. Create `src/hooks/useNotifications.ts`:
   ```typescript
   import { useEffect, useState } from 'react';

   export type NotificationType = 'add_egg' | 'boiling_done' | 'cooling_done';

   export interface Notification {
     type: NotificationType;
     message: string;
     eggId?: string;
   }

   export function useNotifications() {
     const [permission, setPermission] = useState<NotificationPermission>('default');

     useEffect(() => {
       if ('Notification' in window) {
         setPermission(Notification.permission);
       }
     }, []);

     const requestPermission = async () => {
       if ('Notification' in window) {
         const result = await Notification.requestPermission();
         setPermission(result);
         return result;
       }
       return 'denied';
     };

     const sendNotification = (notification: Notification) => {
       // Browser notification
       if (permission === 'granted') {
         new Notification('Egg Timer', {
           body: notification.message,
           icon: '/egg-timer/favicon.ico',
           badge: '/egg-timer/favicon.ico',
         });
       }

       // Play sound
       playSound();
     };

     return {
       permission,
       requestPermission,
       sendNotification,
     };
   }

   function playSound() {
     const audio = new Audio('/egg-timer/sounds/notification.mp3');
     audio.play().catch((error) => {
       console.error('Failed to play sound:', error);
     });
   }
   ```

2. Create `src/core/notificationScheduler.ts`:
   ```typescript
   import { EggTiming, TimerState } from '../types';
   import { Notification } from '../hooks/useNotifications';

   export function getActiveNotifications(
     timings: EggTiming[],
     elapsedSeconds: number,
     totalTime: number,
     coolingElapsed: number,
     status: TimerState['status']
   ): Notification[] {
     const notifications: Notification[] = [];

     // Check for "add egg" notifications
     timings.forEach((timing) => {
       if (elapsedSeconds === timing.addAtSecond) {
         notifications.push({
           type: 'add_egg',
           message: `Add egg ${timing.eggId} to the pot now!`,
           eggId: timing.eggId,
         });
       }
     });

     // Check for "boiling done" notification
     if (status === 'running' && elapsedSeconds === totalTime) {
       notifications.push({
         type: 'boiling_done',
         message: 'All eggs are done boiling! Move them to cold water.',
       });
     }

     // Check for "cooling done" notification
     if (status === 'cooling' && coolingElapsed === 120) {
       notifications.push({
         type: 'cooling_done',
         message: 'Cooling complete! Your eggs are ready.',
       });
     }

     return notifications;
   }
   ```

3. Add notification.mp3 sound file to `public/sounds/`
4. Request notification permission on first app load
5. Show notification permission banner if not granted

**Acceptance Criteria**:
- Browser notifications work when permission granted
- Sound plays for all notifications
- Notifications fire at correct times
- App gracefully handles denied permission
- Notifications work in background tabs
- Clear UI indication of notification permission status

**Files Created**:
- `src/hooks/useNotifications.ts`
- `src/core/notificationScheduler.ts`
- `public/sounds/notification.mp3`
- `tests/core/notificationScheduler.test.ts`

---

### Task 8: UI Components - Egg Management

**Description**: Create components for adding and displaying eggs.

**Steps**:
1. Create `src/components/EggForm.tsx`:
   - Form with inputs: weight (number), doneness (select), temperature (select)
   - Validation: weight must be 20-100g
   - "Add Egg" button
   - Generate unique ID for each egg (use `crypto.randomUUID()`)
   - Disable form when timer is running
   - Clear form after successful add

2. Create `src/components/EggItem.tsx`:
   - Display egg properties: weight, doneness, temperature
   - Show calculated boil time
   - Show "Add at: XXs" (calculated delay)
   - Delete button (disabled when timer running)
   - Visual indicator when it's time to add this egg

3. Create `src/components/EggList.tsx`:
   - List all added eggs
   - Empty state: "No eggs added yet"
   - Display eggs sorted by addAtSecond (first to add at top)
   - Show total timer duration at top

**Acceptance Criteria**:
- Form validation works correctly
- Can add multiple eggs
- Can remove eggs (when timer not running)
- UI clearly shows which egg to add when
- Responsive design for mobile and desktop
- Accessible (proper labels, keyboard navigation)

**Files Created**:
- `src/components/EggForm.tsx`
- `src/components/EggItem.tsx`
- `src/components/EggList.tsx`

---

### Task 9: UI Components - Timer Display and Controls

**Description**: Create timer display and control components.

**Steps**:
1. Create `src/components/TimerDisplay.tsx`:
   - Large display of current time remaining in MM:SS format
   - Different displays based on status:
     - `idle`: "Ready to start"
     - `running`: Countdown of remaining time
     - `paused`: "Paused at MM:SS"
     - `cooling`: "Cooling: MM:SS / 02:00"
     - `complete`: "All done!"
   - Progress bar showing overall progress
   - Current phase indicator ("Boiling" or "Cooling")

2. Create `src/components/TimerControls.tsx`:
   - Start button (enabled only when eggs added and timer idle)
   - Pause/Resume button (enabled when timer running)
   - Reset button (enabled always, with confirmation dialog)
   - Button states clearly indicate what will happen

3. Create `src/components/NotificationBanner.tsx`:
   - Show recent notifications as dismissible banners
   - Different colors for different notification types
   - Auto-dismiss after 5 seconds
   - Manual dismiss button
   - Stack multiple notifications

**Acceptance Criteria**:
- Timer displays accurately update every second
- Controls are disabled/enabled appropriately
- Time formatting is clear and readable
- Progress bar animates smoothly
- Notifications are visible and dismissible
- Mobile-friendly layout

**Files Created**:
- `src/components/TimerDisplay.tsx`
- `src/components/TimerControls.tsx`
- `src/components/NotificationBanner.tsx`

---

### Task 10: Main App Integration

**Description**: Integrate all components and hooks into the main App.

**Steps**:
1. Update `src/App.tsx`:
   - Use `useEggTimer` hook
   - Use `useNotifications` hook
   - Use `useLocalStorage` hook
   - Integrate notification scheduler
   - Layout all components:
     - Header with app title and notification permission banner
     - EggForm
     - EggList
     - TimerDisplay
     - TimerControls
     - NotificationBanner
   - Handle notification permission request on mount
   - Wire up all event handlers

2. App layout structure:
   ```
   +----------------------------------+
   |  Egg Timer                       |
   |  [Enable Notifications]          |
   +----------------------------------+
   |  Add New Egg                     |
   |  [Weight] [Doneness] [Temp] [Add]|
   +----------------------------------+
   |  Your Eggs (Total: XXX seconds)  |
   |  - Egg 1: XXg, soft, +XXs        |
   |  - Egg 2: XXg, hard, +XXs        |
   +----------------------------------+
   |  Timer: MM:SS                    |
   |  [Progress Bar]                  |
   |  Phase: Boiling/Cooling          |
   +----------------------------------+
   |  [Start] [Pause] [Reset]         |
   +----------------------------------+
   |  [!] Add egg 2 now!         [X]  |
   +----------------------------------+
   ```

3. Handle all state transitions and side effects properly

**Acceptance Criteria**:
- All components render without errors
- State flows correctly through the app
- Notifications trigger at correct times
- Timer operates smoothly without lag
- localStorage persists and restores eggs
- No memory leaks (cleanup in useEffects)

**Files Modified**:
- `src/App.tsx`

---

### Task 11: Styling and Responsive Design

**Description**: Create an attractive, responsive UI with CSS.

**Steps**:
1. Choose styling approach (options):
   - **Option A**: CSS Modules for scoped styles
   - **Option B**: Tailwind CSS for utility-first styling
   - **Option C**: Vanilla CSS with BEM methodology

2. Design system:
   - Color scheme: Primary, secondary, success, warning, error
   - Typography: Clear hierarchy, readable font sizes
   - Spacing: Consistent padding/margins (8px grid)
   - Responsive breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

3. Component styling priorities:
   - Timer display: Large, prominent, easy to read from distance
   - Buttons: Clear visual states (enabled, disabled, hover, active)
   - Forms: Good UX with proper validation feedback
   - Notifications: Attention-grabbing but not annoying
   - Overall: Clean, minimal, egg-themed color palette

4. Create `src/App.css` or component-specific CSS files

5. Add animations:
   - Timer countdown pulse
   - Progress bar smooth transition
   - Notification slide-in
   - Button hover effects

6. Ensure accessibility:
   - Sufficient color contrast (WCAG AA)
   - Focus indicators for keyboard navigation
   - Screen reader friendly labels

**Acceptance Criteria**:
- App looks professional and polished
- Responsive on mobile, tablet, and desktop
- All interactive elements have clear visual feedback
- Consistent spacing and typography throughout
- Animations enhance UX without being distracting
- Passes WCAG AA accessibility standards

**Files Created/Modified**:
- `src/App.css`
- Component CSS files (if using CSS Modules)
- Or Tailwind config (if using Tailwind)

---

### Task 12: Testing

**Description**: Write comprehensive tests for components and integration.

**Steps**:
1. Test `src/components/EggForm.tsx`:
   - Renders all input fields
   - Validates weight input (min/max)
   - Adds egg on form submit
   - Clears form after add
   - Disables when timer running

2. Test `src/components/TimerDisplay.tsx`:
   - Displays correct time format
   - Shows correct status messages
   - Updates progress bar

3. Test `src/hooks/useEggTimer.ts`:
   - Add/remove eggs correctly
   - Calculate timings correctly
   - Timer counts down
   - Transitions between states
   - Cannot modify eggs during running timer

4. Test `src/hooks/useNotifications.ts`:
   - Requests permission
   - Sends notifications
   - Plays sound

5. Integration test for complete flow:
   - Add eggs → Start timer → Receive notifications → Complete

6. Aim for >80% code coverage on critical paths

**Acceptance Criteria**:
- All tests pass
- Code coverage >80% on core logic
- Tests are readable and maintainable
- Edge cases are covered
- Tests run quickly (<5s total)

**Files Created**:
- `tests/components/*.test.tsx`
- `tests/hooks/*.test.ts`
- Additional test files as needed

---

### Task 13: GitHub Pages Deployment Configuration

**Description**: Configure GitHub Actions for automatic deployment to GitHub Pages.

**Steps**:
1. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches:
         - main

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Run tests
           run: npm run test -- --run

         - name: Run linter
           run: npm run lint

         - name: Build
           run: npm run build

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: ./dist

     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

2. Verify `vite.config.ts` has correct base path:
   ```typescript
   export default defineConfig({
     base: '/egg-timer/',
     // ...
   });
   ```

3. Ensure all asset paths use relative paths or base URL

4. Update README.md with:
   - Live demo link: https://daha.github.io/egg-timer/
   - Deployment instructions
   - Development setup instructions

5. Test deployment:
   - Commit and push to main
   - Verify GitHub Actions runs successfully
   - Check deployed app works at GitHub Pages URL

**Acceptance Criteria**:
- GitHub Actions workflow runs on push to main
- Tests and linting must pass before deployment
- Build succeeds and deploys to GitHub Pages
- Deployed app is accessible at correct URL
- All assets load correctly (no 404s)
- App functions correctly in production

**Files Created/Modified**:
- `.github/workflows/deploy.yml`
- `vite.config.ts` (verify base path)
- `README.md` (add deployment info)

---

## Testing Strategy

### Unit Tests
- **Core calculations** (`eggCalculations.ts`): Test all formulas and edge cases
- **Timer engine** (`useEggTimer.ts`): Test state transitions and timing
- **Notification scheduler** (`notificationScheduler.ts`): Test trigger conditions
- **Storage utilities** (`storage.ts`): Test save/load/error handling

### Component Tests
- **EggForm**: User interactions, validation, form submission
- **EggList**: Rendering, sorting, empty states
- **TimerDisplay**: Time formatting, status messages
- **TimerControls**: Button states and click handlers

### Integration Tests
- Full user flow: Add eggs → Start → Notifications → Complete
- localStorage persistence across sessions
- Browser notification integration

### Coverage Goals
- **Core logic**: >90% coverage
- **Components**: >80% coverage
- **Overall project**: >80% coverage

### Running Tests
```bash
npm run test          # Run tests in watch mode
npm run test -- --run # Run tests once (for CI)
npm run test:ui       # Run with Vitest UI
```

## Deployment Process

### Local Development
```bash
npm install           # Install dependencies
npm run dev           # Start dev server at http://localhost:5173
```

### Production Build
```bash
npm run build         # Build for production
npm run preview       # Preview production build locally
```

### Deployment to GitHub Pages
1. Ensure GitHub Pages is enabled in repository settings
   - Go to Settings → Pages
   - Source: "GitHub Actions"

2. Push to `main` branch:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

3. GitHub Actions will automatically:
   - Install dependencies
   - Run tests
   - Run linting
   - Build the application
   - Deploy to GitHub Pages

4. Access deployed app at: `https://daha.github.io/egg-timer/`

### Deployment Checklist
- [ ] All tests passing
- [ ] Linting passes
- [ ] Build succeeds locally
- [ ] Assets load correctly (check browser console)
- [ ] Notifications work in production
- [ ] localStorage works in production
- [ ] Responsive design works on mobile
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)

## Pre-commit Hook Configuration

### Setup
The pre-commit hook is configured via Husky and lint-staged.

### What Runs on Commit
1. **Lint-staged**: Runs on staged files only
   - ESLint with auto-fix
   - Prettier formatting

2. **Test suite**: Runs all tests
   - Must pass for commit to succeed
   - Fast feedback loop

### Bypass (Use Sparingly)
```bash
git commit --no-verify  # Skip pre-commit hooks (not recommended)
```

### Updating Hooks
To modify what runs before commit, edit:
- `.husky/pre-commit` - Main hook script
- `package.json` → `lint-staged` - File-specific tasks

## Development Workflow

### Starting a New Task
1. Create a new branch: `git checkout -b task/task-name`
2. Review task acceptance criteria
3. Implement the task
4. Write tests
5. Run `npm run lint` and `npm run test`
6. Commit (pre-commit hooks will run)
7. Create pull request to main

### Adding New Features
1. Update this PLAN.md with new task
2. Follow development workflow above
3. Ensure tests cover new functionality
4. Update README.md if needed

## Success Criteria

The egg timer application is considered complete when:

1. ✅ All 13 tasks are implemented
2. ✅ All tests pass with >80% coverage
3. ✅ Linting passes with no errors
4. ✅ Application deploys successfully to GitHub Pages
5. ✅ Core functionality works:
   - Can add multiple eggs
   - Timer calculates correct staggered times
   - Notifications trigger at right moments
   - Cooling phase works
   - localStorage persists data
6. ✅ Pre-commit hooks run successfully
7. ✅ UI is responsive and accessible
8. ✅ Browser notifications work (with permission)
9. ✅ No console errors in production
10. ✅ Works in major browsers (Chrome, Firefox, Safari)

## Future Enhancements (Out of Scope)

Ideas for future iterations:
- Dark mode support
- Custom notification sounds
- Multiple pots (parallel timers)
- Recipe sharing (export/import egg configurations)
- Progressive Web App (PWA) with offline support
- Internationalization (i18n)
- Analytics to track usage patterns
- Visual timer with animated eggs
- Voice notifications (Web Speech API)

---

## Questions or Issues?

If you encounter any issues while implementing these tasks:
1. Check the acceptance criteria for the task
2. Review related tasks for context
3. Consult the core calculation documentation
4. Check the architecture section for design decisions
5. Review the project files: README.md and CLAUDE.md

**Note to Agents**: Each task is designed to be independent. However, some tasks have dependencies:
- Tasks 8-11 depend on Tasks 4-7 (need core logic and hooks first)
- Task 12 depends on all other tasks (testing everything)
- Task 13 can be done in parallel with most tasks

Suggested implementation order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13
