// defineConfig is a Playwright helper that provides type-checking and IDE autocompletion.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Directory where Playwright looks for test files (*.spec.ts by default)
  testDir: './tests',

  // Maximum time (ms) a single test can run before Playwright marks it as timed out
  timeout: 30000,

  retries: 0, // 1-2 once all tests are expected to pass. We have some failures, so 0 for now.

  // Two reporters run simultaneously:
  //   'html' — generates a browsable HTML report in playwright-report/; 'open: never'
  //             prevents it from auto-opening a browser tab after the run
  //   'list' — prints real-time pass/fail lines to the terminal as tests execute
  reporter: [['html', { open: 'never' }], ['list']],

  // Settings applied to every test unless overridden at the project level below
  use: {
    // Root URL prepended when page.goto() is called with a relative path
    baseURL: 'https://app-stg.keys.casa',

    // Run the browser without a visible window — faster and required in most CI environments
    headless: true,

    // Capture a screenshot only when a test fails (saved to test-results/)
    screenshot: 'only-on-failure',

    // Record a Playwright trace file on the first retry — the trace viewer lets you
    // step through every action, network request, and DOM snapshot after the fact
    trace: 'on-first-retry',

    // Browser window dimensions used for all tests
    viewport: { width: 1280, height: 720 },
  },

  // Each entry is an independent browser/configuration combination.
  // All test files run once per project. Additional projects (firefox, webkit)
  // can be added here for cross-browser coverage.
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
