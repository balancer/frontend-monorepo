import { expect, test } from '@playwright/test'

test('Beets: pools page renders', async ({ page }) => {
  await page.goto('http://localhost:3001/pools')
  await expect(page.getByRole('heading', { name: 'Liquidity pools' })).toBeVisible()
})
