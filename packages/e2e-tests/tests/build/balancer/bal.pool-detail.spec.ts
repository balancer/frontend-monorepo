import { expect, test } from '@playwright/test'
import { balWeth8020 } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'

test('Balancer: pool detail page renders', async ({ page }) => {
  await page.goto(`http://localhost:3000/pools/ethereum/v2/${balWeth8020.poolId}`)

  await expect(page.getByRole('button', { name: 'Add liquidity' })).toBeVisible()
})
