import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Get git commit SHA at build time
function getGitCommitSha(): string {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to get git commit SHA:', error);
    return 'unknown';
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/egg-timer/',
  define: {
    'import.meta.env.VITE_GIT_COMMIT_SHA': JSON.stringify(getGitCommitSha()),
  },
});
