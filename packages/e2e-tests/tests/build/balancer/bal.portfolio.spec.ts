import { expect, test } from '@playwright/test'

test('Balancer: portfolio page renders', async ({ page }) => {
  await page.goto('http://localhost:3000/portfolio')
  await expect(page.getByText('My Balancer liquidity')).toBeVisible()
})
