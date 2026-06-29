import { expect, test } from '@playwright/test'

test('Beets: pool detail page renders', async ({ page }) => {
  await page.goto(
    'http://localhost:3001/pools/sonic/v2/0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8000200000000000000000005',
  )

  await expect(page.getByRole('button', { name: 'Add liquidity' })).toBeVisible()
})
