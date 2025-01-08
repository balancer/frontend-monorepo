import { test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:3001')
  await page.getByRole('button', { name: 'Let me in' }).click()
  await page.getByRole('link', { name: 'Launch app' }).click()
  await page.getByText('Details').click()
  await page.getByRole('link', { name: 'Sonic wS stS Staked Sonic' }).click()
})
