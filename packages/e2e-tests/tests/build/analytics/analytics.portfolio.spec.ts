import { expect, test } from '@playwright/test'

test('Balancer Analytics: portfolio page renders', async ({ page }) => {
  await page.goto('http://localhost:3002/portfolio')
  await expect(page.getByRole('heading', { name: 'Portfolio inspector' })).toBeVisible()
})
