// Playwright config for every stack: headless Chromium against BASE_URL or APP_URL, in the
// project's timezone. Reports, traces and failure screenshots go to .team/ (gitignored).
// Settings come from e2e/settings.ts (environment, then the env file, then ops/project.conf).
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { settings } from './settings';

const teamDir = path.join(settings.repoRoot, '.team', 'e2e');

export default defineConfig({
  testDir: './tests',
  outputDir: path.join(teamDir, 'test-results'),
  fullyParallel: true,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(teamDir, 'report'), open: 'never' }],
  ],
  use: {
    baseURL: settings.baseURL || undefined,
    httpCredentials: settings.httpCredentials,
    timezoneId: settings.timezone,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
});
