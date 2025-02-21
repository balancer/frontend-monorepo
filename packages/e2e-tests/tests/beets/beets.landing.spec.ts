import { test } from '@playwright/test'

test('beets landing', async ({ page }) => {
  await page.goto('http://localhost:3001')
  await page.getByRole('link', { name: 'Launch app' }).click()
  await page.getByText('Details').click()
})
