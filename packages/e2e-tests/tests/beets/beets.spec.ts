import { test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:3001')
  await page.getByRole('button', { name: 'Let me in' }).click()
  await page.getByRole('link', { name: 'Explore Pools', exact: true }).click()
  // await page.getByRole('link', { name: 'Sonic wS stS Staked Sonic' }).click();
  // await page.getByRole('button', { name: 'Add liquidity' }).click();
  // await page.getByText('ProportionalWhen you enter an').click();
  // await page.getByPlaceholder('0.00').first().fill('1');
})
