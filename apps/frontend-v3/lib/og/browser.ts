import { chromium } from 'playwright-core'
import sparticuzChromium from '@sparticuz/chromium'

/**
 * Launches a headless Chromium for OG screenshotting.
 *
 * Local: uses the Chromium installed via `pnpm playwright:install:chromium`
 * (playwright-core resolves it from the browser registry).
 * Production (Vercel): uses @sparticuz/chromium's serverless-compatible binary.
 */
export async function launchOgBrowser() {
  if (process.env.VERCEL) {
    return chromium.launch({
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
    })
  }

  // Local: playwright-core resolves Chromium from the browser registry
  // (install via `pnpm playwright:install:chromium`)
  return chromium.launch({ headless: true })
}
