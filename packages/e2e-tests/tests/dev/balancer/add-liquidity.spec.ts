import { impersonate, setForkBalances } from '@/helpers/e2e.helpers'
import { button, clickButton } from '@/helpers/user.helpers'
import { test, expect } from '@playwright/test'
import { aaveWstETH8020 } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'
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

  await clickButton(page, 'Add liquidity')
  await expect(button(page, 'Next')).toBeVisible()

    await page.getByPlaceholder('0.00').nth(1).fill('1')
    await page.getByText('I accept the risks of').click()
    await clickButton(page, 'Next')

    await clickButton(page, 'Approve AAVE to add')

    await clickButton(page, 'Add liquidity')
    await expect(page.getByText('Transaction confirmed')).toBeVisible()
  })

  test('proportional', async ({ page }) => {
    await clickButton(page, 'Add liquidity')
    await expect(button(page, 'Next')).toBeVisible()

    await page.locator('#button-group-1').click()

    await page.getByPlaceholder('0.00').nth(1).fill('1')
    await page.getByText('I accept the risks of').click()
    await clickButton(page, 'Next')

    await clickButton(page, 'Approve AAVE to add')
    await clickButton(page, 'Approve wstETH to add')

    await clickButton(page, 'Add liquidity')
    await expect(page.getByText('Transaction confirmed')).toBeVisible()
  })
})

test.describe('Boosted stable pool v3', () => {
  test.beforeEach(async ({ page }) => {
    await resetFork()
    // Must go before loading the page
    await setForkBalances(page, {
      chainId: 1,
      forkBalances: {
        1: [
          {
            tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
            value: '5000',
          },
          {
            tokenAddress: '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f', // GHO
            value: '5000',
          },
          {
            tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
            value: '5000',
            decimals: 6,
          },
        ],
      },
    })

    await page.goto(
      `http://localhost:3000/pools/ethereum/v3/0x85b2b559bc2d21104c4defdd6efca8a20343361d`,
    )
    await impersonate(page, defaultAnvilAccount)
    await expect(button(page, 'Connect')).not.toBeVisible()
  })

  test('flexible', async ({ page }) => {
    await clickButton(page, 'Add liquidity')
    await page.getByPlaceholder('0.00').nth(1).fill('100')

    await page.getByText('I accept the risks of').click({ timeout: 20000 })
    await page.getByText('I accept that by adding tokens').click({ timeout: 20000 })

    await clickButton(page, 'Next')

    await clickButton(page, 'GHO: Approve Permit')
    await clickButton(page, 'Sign permit: GHO')

    await clickButton(page, 'Add liquidity')
    await expect(page.getByText('Transaction confirmed')).toBeVisible()

    await page.getByRole('button', { name: 'Return to pool' }).click()
    await page.getByRole('button', { name: 'Remove' }).click()
  })

  test('proportional', async ({ page }) => {
    await page.getByRole('button', { name: 'Add liquidity' }).click()

    await page.locator('#button-group-1').click()

    await page.getByPlaceholder('0.00').nth(1).fill('100')

    await page.getByText('I accept the risks of').click({ timeout: 20000 })
    await page.getByText('I accept that by adding tokens').click({ timeout: 20000 })

    await clickButton(page, 'Next')

    await clickButton(page, 'GHO: Approve Permit')
    await clickButton(page, 'USDT: Approve Permit')
    await clickButton(page, 'USDC: Approve Permit')

    await clickButton(page, 'Sign approvals: USDC, GHO, USDC')

    await clickButton(page, 'Add liquidity')
    await expect(page.getByText('Transaction confirmed')).toBeVisible()

    await page.getByRole('button', { name: 'Return to pool' }).click()
    await page.getByRole('button', { name: 'Remove' }).click()
  })
})
