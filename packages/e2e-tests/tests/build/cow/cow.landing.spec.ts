import { test } from '@playwright/test'

test('Cow landing page', async ({ page }) => {
  await page.goto('http://localhost:3002/')
  await page.getByRole('group').filter({ hasText: 'WETHWETH50%GNOGNO50%' }).click()
})
