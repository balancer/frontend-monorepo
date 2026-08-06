import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '.env.local') })

/**
 * Manual iOS smoke test — run via `pnpm --filter e2e-tests test:e2e:ios`.
 *
 * Uses Playwright's WebKit engine (the same engine family as Safari) with an
 * iPhone 13 device profile. This is the closest free proxy to the iOS Safari
 * crash reported in https://github.com/balancer/frontend-monorepo/issues/1457
 * that runs on macOS CI without the Xcode simulator.
 *
 * Not part of the default CI suite — only triggered via workflow_dispatch.
 */
export default defineConfig({
  testDir: './tests/ios',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* WebKit builds are heavy; keep it single-threaded */
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test */
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
  },
  globalTimeout: 15 * 60 * 1000,
  timeout: 1.5 * 60 * 1000,
  expect: { timeout: 60 * 1000 },
  projects: [
    {
      name: 'Mobile Safari (iPhone 13)',
      use: { ...devices['iPhone 13'] },
    },
  ],
})
