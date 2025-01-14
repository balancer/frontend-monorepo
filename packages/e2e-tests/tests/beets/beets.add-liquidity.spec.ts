import { test } from '@playwright/test'

test('Beets: can add proportionally in Staked Sonic Symphony', async ({ page }) => {
  // Staked Sonic Symphony
  await page.goto(
    'http://localhost:3001/pools/sonic/v2/0x374641076b68371e69d03c417dac3e5f236c32fa000000000000000000000006',
  )

  await page.getByRole('button', { name: 'Add liquidity' }).click()

  await page.getByText('Flexible').click()
  await page.getByPlaceholder('0.00').first().click()
})
