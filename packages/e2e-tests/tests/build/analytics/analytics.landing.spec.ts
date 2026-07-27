import { expect, test } from '@playwright/test'

test('Balancer Analytics: landing page renders', async ({ page }) => {
  await page.goto('http://localhost:3002/')
  await expect(
    page.locator('#overview').getByRole('heading', { name: 'Balancer Analytics' }),
  ).toBeVisible()
  await expect(
    page.getByText('Live protocol metrics across Balancer v2, v3 and CoW AMM.'),
  ).toBeVisible()
})
