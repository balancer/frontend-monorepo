import { launchOgBrowser } from './browser'

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

type CreateOgScreenshotOptions = {
  /** Internal route to screenshot, e.g. `/_og/pool/ethereum/0x…` */
  path: string
  origin: string
  /** Selector that indicates the page has finished rendering */
  selector?: string
}

/**
 * Renders an internal page in headless Chromium and returns a PNG screenshot.
 * The target page must expose an element matching `selector` once it is fully
 * rendered (no animations, fonts and images loaded).
 */
export async function createOgScreenshot({
  path,
  origin,
  selector = '#og-image[data-ready="true"]',
}: CreateOgScreenshotOptions): Promise<Buffer> {
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
}
