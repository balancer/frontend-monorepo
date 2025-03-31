import { impersonate, setForkBalances } from '@/helpers/e2e.helpers'
import { test, expect } from '@playwright/test'
import { balWeth8020 } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'
import { defaultAnvilAccount, resetFork } from '@repo/lib/test/utils/wagmi/fork.helpers'

test.afterAll(async () => {
  /*
    A fork reset is needed because we need to reset the token allowances so that
    tests always require the same steps (approvals + transactions)
  */
  console.log('Setting fork after add liquidity tests')
  await resetFork()
})

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

test('Adds liquidity in tri-boosted aave pool (Aave GHO/USDT/USDC)', async ({ page }) => {
  // Must go before loading the page
  await setForkBalances(page, {
    chainId: 1,
    forkBalances: {
      1: [
        {
          tokenAddress: '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f', // GHO
          value: '5000',
        },
      ],
    },
  })

  await page.goto(
    `http://localhost:3000/pools/ethereum/v3/0x85b2b559bc2d21104c4defdd6efca8a20343361d`,
  )

  await impersonate(page, defaultAnvilAccount)

  // Fill form
  await page.getByRole('button', { name: 'Add liquidity' }).click()
  // Fill 100 GHO
  await page.getByPlaceholder('0.00').nth(1).fill('100')
  await page.getByText('I accept the risks of').click({ timeout: 20000 })
  await page.getByRole('button', { name: 'Next' }).click()

  await page.getByRole('button', { name: 'GHO: Approve Permit' }).click()
  await page.getByRole('button', { name: 'Sign permit: GHO' }).click()

  // Run transaction and wait for confirmation
  await page.getByRole('button', { name: 'Add liquidity' }).click()
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Return to pool' }).click()
  await page.getByRole('button', { name: 'Remove' }).click()
})
