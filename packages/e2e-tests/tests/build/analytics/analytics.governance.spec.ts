import { expect, test } from '@playwright/test'

test('Balancer Analytics: governance page renders', async ({ page }) => {
  await page.goto('http://localhost:3002/governance')
  await expect(page.getByRole('heading', { name: 'Governance' })).toBeVisible()
})
