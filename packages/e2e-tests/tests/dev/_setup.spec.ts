import { test } from '@playwright/test'
import { balWeth8020 } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'

// This test must be run before all the others
test('Wait for dev server to load page', async ({ page }) => {
  // Wait for 1 minute for the dev server to load tested pages before running the real tests
  test.setTimeout(60000)

  // Loading any pool page is enough to ensure the dev server is ready
  await page.goto(`http://localhost:3000/pools/ethereum/v2/${balWeth8020.poolId}`, {
    waitUntil: 'load',
  })

  await page.getByRole('button', { name: 'Add liquidity' }).click()
  await page.getByRole('button', { name: 'BAL' }).click()
})
