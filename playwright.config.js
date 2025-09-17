/**
 * Playwright Configuration for English Note Maker
 *
 * Provides automated testing and debugging capabilities
 * for UI interactions, print layout validation, and cross-browser testing
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1, // 本番は3回、開発は1回リトライ
  workers: process.env.CI ? 1 : undefined,

  // Global timeout settings
  timeout: 60000, // 1分でタイムアウト
  expect: {
    timeout: 15000, // assertion は15秒でタイムアウト
  },

  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL for testing
    baseURL: 'http://localhost:3000',

    // Debugging options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Action options
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    // Print testing project
    {
      name: 'print',
      use: {
        ...devices['Desktop Chrome'],
        // Emulate print media
        colorScheme: 'light',
        viewport: { width: 794, height: 1123 }, // A4 at 96dpi
      },
    },
  ],

  // Run development server before tests
  webServer: {
    command: process.env.CI
      ? 'npx http-server . -p 3000 -c-1'
      : 'live-server --port=3000 --no-browser --watch=false',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Output folder for test artifacts
  outputDir: 'test-results/',
});