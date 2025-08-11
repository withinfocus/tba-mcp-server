import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 30000,
  reporter: [
    process.env.CI
      ? ['github', { printSteps: true }]
      : ['list', { printSteps: true }],
    ['html', { open: 'never', outputFolder: 'test-summary' }],
    ['json', { outputFile: 'test-summary/test-results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'integration-tests',
      testDir: './tests/integration',
      use: {
        headless: true,
      },
    },
  ],
  outputDir: 'test-results/',
});
