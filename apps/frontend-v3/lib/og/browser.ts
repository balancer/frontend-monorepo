/**
 * Launches a headless Chromium for OG screenshotting.
 *
 * Local: uses the Chromium installed via `pnpm playwright:install:chromium`
 * (playwright-core resolves it from the browser registry).
 * Production (Vercel): uses @sparticuz/chromium's serverless-compatible binary.
 *
 * Both playwright-core and @sparticuz/chromium are imported lazily so a
 * missing/broken binary or a tracing issue can never crash the API route at
 * module load — they only surface as a launch error, which callers catch and
 * turn into the static-image fallback.
 */
export async function launchOgBrowser() {
  const { chromium } = await import('playwright-core')

  if (process.env.VERCEL) {
    const { default: sparticuzChromium } = await import('@sparticuz/chromium')
    return chromium.launch({
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
    })
  }

  // Local: playwright-core's default headless launch prefers the separate
  // headless-shell build; pass the full Chromium executablePath explicitly
  // (installed via `pnpm playwright:install:chromium`)
  return chromium.launch({
    executablePath: chromium.executablePath(),
    headless: true,
  })
}
