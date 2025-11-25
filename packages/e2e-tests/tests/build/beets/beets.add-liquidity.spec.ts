import { test } from '@playwright/test'

test('Beets: can add proportionally in Staked Sonic Symphony', async ({ page }) => {
  // Staked Sonic Symphony
  await page.goto('http://localhost:3001/pools/sonic/v3/0x944d4ae892de4bfd38742cc8295d6d5164c5593c')

  await page.getByRole('button', { name: 'Add liquidity' }).click({ timeout: 20000 })

  await page.getByText('Flexible', { exact: true }).click()
  await page.getByPlaceholder('0.00').first().click()
})
