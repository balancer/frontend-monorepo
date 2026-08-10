import { launchOgBrowser } from './browser'

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

// Whole-render budget: must stay below the platform function timeout (maxDuration
// 30s below). A cold @sparticuz/chromium start (Brotli extraction to /tmp +
// launch + render) can exceed 10s, so 20s gives it room while still falling back
// to a static image before the platform kills the request (→ 504 → generic
// social preview).
const RENDER_TIMEOUT_MS = 20_000

type CreateOgScreenshotOptions = {
  /** Internal route to screenshot, e.g. `/_og/pool/ethereum/0x…` */
  path: string
  origin: string
  /** Selector that indicates the page has finished rendering */
  selector?: string
}

export async function createOgScreenshot({
  path,
  origin,
  selector = '#og-image[data-ready="true"]',
}: CreateOgScreenshotOptions): Promise<Buffer> {
  // Bound the entire render (browser launch + navigation + screenshot) so the
  // route always answers within the platform's function timeout. On Vercel
  // Hobby that cap is 10s and a cold @sparticuz/chromium start alone can
  // exceed it; timing out here lets the caller fall back to a static image
  // instead of the platform killing the request (→ 504 → generic preview).
  return withTimeout(RENDER_TIMEOUT_MS, async () => {
    const browser = await launchOgBrowser()

    try {
      const page = await browser.newPage({
        viewport: { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT },
        deviceScaleFactor: 1,
      })

      const response = await page.goto(`${origin}${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })

      if (!response || response.status() >= 400) {
        throw new Error(`OG page returned ${response?.status() ?? 'no response'}`)
      }

      await page.waitForSelector(selector, { timeout: 30_000 })
      await page.evaluate(() => document.fonts.ready)
      await page
        .waitForFunction(
          () =>
            Array.from(document.querySelectorAll('#og-image img')).every(
              img => img instanceof HTMLImageElement && img.complete
            ),
          { timeout: 10_000 }
        )
        .catch(() => {
          // Slow/broken logos are swapped for dicebear identicons by TokenIcon's onError
        })

      return await page.locator('#og-image').screenshot({ type: 'png' })
    } finally {
      await browser.close()
    }
  })
}

function withTimeout<T>(ms: number, fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`OG render timed out after ${ms}ms`)), ms)
    fn().then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}
