import { impersonate } from '@/helpers/e2e.helpers'
import { test, expect } from '@playwright/test'
import { balWeth8020 } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Adds liquidity in balWeth8020', async ({ page }) => {
  await page.goto(`http://localhost:3000/pools/ethereum/v2/${balWeth8020.poolId}`)

  await impersonate(page, defaultAnvilAccount)

  // Fill form
  await page.getByRole('button', { name: 'Add liquidity' }).click()
  // Fill 0.01 ETH (default anvil user will always have enough ETH)
  await page.getByPlaceholder('0.00').nth(1).fill('0.01')
  await page.getByText('I accept the risks of').click({ timeout: 20000 })
  await page.getByRole('button', { name: 'Next' }).click()

  // Run transaction and wait for confirmation
  await page.getByRole('button', { name: 'Add liquidity' }).click()
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  // await page.waitForTimeout(500)
})
