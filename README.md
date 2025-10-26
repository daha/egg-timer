# Egg Timer

A project to create a simple egg timer application.

It shall be an "application" which can run as a web app hosted on GitHub Pages.
All eggs should be boiled in the same pot, but it should be possible to add
multiple eggs with different weights and boiling preferences (soft, medium,
hard). When eggs needs different boiling times, the time when to add the eggs
should be notified.

## Features

- It should be possible to add eggs and specify its weight in grams and if it
  should be soft, medium or hard boiled.
- It should support multiple eggs at the same time.
- Notify when to add eggs to the pot.
- Notify when eggs are done.
- Extra the eggs typicall needs to be cooled for 2 minutes in cold water after
  boiling, this should be notified as well.
- A simple and clean user interface.

## Formulas

Normal eggs (stored in refrigerator, ~6ºC):

```
t = 197 + 4.6 * w
```

where t = time in seconds, w = weight of the egg in grams

- for soft boiled eggs, -30 seconds.
- for harder boiled eggs, +45 seconds.
- for hard boiled eggs, +90 seconds.
- for room temperature eggs (~20ºC), -30 seconds.

## Development Setup

### First-time Setup

When checking out this repository for the first time:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Initialize Git hooks:**
   The `npm install` command automatically runs the `prepare` script which initializes Husky. This configures Git to use pre-commit hooks located in `.husky/`.

3. **Verify hooks are installed:**
   ```bash
   git config core.hooksPath
   # Should output: .husky/_
   ```

### Pre-commit Hooks

This project uses **Husky** to manage Git hooks. On every commit, the following checks run automatically:

- **lint-staged**: Runs ESLint with auto-fix and Prettier on staged TypeScript, CSS, and Markdown files
- **Tests**: Runs the full Vitest test suite

**The commit will be blocked if:**

- Linting errors are found
- Tests fail

### Available Scripts

- `npm run dev` - Start development server
- `npm run dev -- --host` - Start development server and bind to all IPs in the host
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test -- --run` - Run tests once
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Live Demo

The application is deployed at: **[https://daha.github.io/egg-timer/](https://daha.github.io/egg-timer/)**

## Deployment

### Automatic Deployment via GitHub Actions

This project uses GitHub Actions for automatic deployment to GitHub Pages. When you push to the `main` branch:

1. **Tests run**: The full Vitest test suite must pass
2. **Linting runs**: ESLint checks must pass
3. **Build**: The application is built for production
4. **Deploy**: Automatically deployed to GitHub Pages

### Initial GitHub Pages Setup

To enable GitHub Pages for this repository:

1. Go to **Settings** → **Pages** in the GitHub repository
2. Under **Source**, select **GitHub Actions**
3. The workflow defined in `.github/workflows/deploy.yml` will handle deployment

### Manual Deployment

To deploy manually or test the production build locally:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The production build will be in the `dist/` directory.

### Deployment Checklist

Before deploying to production, ensure:

- [ ] All tests passing (`npm run test -- --run`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in production build
- [ ] Notifications work in production
- [ ] localStorage persists correctly
- [ ] Responsive design tested on mobile
- [ ] Browser compatibility verified (Chrome, Firefox, Safari)

## Development Guidelines

- All code should have unit tests where applicable
- All code should be formatted and linted according to standard conventions
- Follow best practices for web development
- Optimize for performance using modern web technologies
