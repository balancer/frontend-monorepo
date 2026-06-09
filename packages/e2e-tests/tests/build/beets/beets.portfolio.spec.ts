import { expect, test } from '@playwright/test'

test('Beets: portfolio page renders', async ({ page }) => {
  await page.goto('http://localhost:3001/portfolio')
  await expect(page.getByText('My Beets liquidity')).toBeVisible()
})
