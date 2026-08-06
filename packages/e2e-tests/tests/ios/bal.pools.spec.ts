import { expect, test } from '@playwright/test'

const pageSizes = [10, 20, 30, 40, 50]

test('Balancer: pools page handles all page sizes on mobile Safari', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', err => pageErrors.push(err.message))

  await page.goto('http://localhost:3000/pools')
  await expect(page.getByRole('heading', { name: 'Liquidity pools' }).first()).toBeVisible()

  // Chakra Select renders a native <select> whose options are "Show 10".."Show 50"
  const showSelect = page.locator('select').filter({ hasText: 'Show' })

  for (const size of pageSizes) {
    await showSelect.selectOption({ label: `Show ${size}` })
    await expect(showSelect).toHaveValue(String(size))

    // The pool list should still be alive after changing page size — a crash
    // (issue #1457) would blow away the page here and time out the asserts.
    await expect(page.getByRole('heading', { name: 'Liquidity pools' }).first()).toBeVisible()
    await page.waitForTimeout(500)
  }

  expect(pageErrors).toEqual([])
})
