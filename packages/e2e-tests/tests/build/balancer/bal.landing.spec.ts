import { test } from '@playwright/test'

test('Balancer landing page', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.getByRole('link', { name: 'Launch app' }).click()
  // Finds a pool in the pool list
  await page.getByRole('link', { name: 'Ethereum wstETH wstETH 20%' }).click()
})
