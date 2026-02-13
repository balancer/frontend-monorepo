import { impersonate } from '@/helpers/e2e.helpers'
import { doLiquidityTxSteps, button, clickButton } from '@/helpers/user.helpers'
import { test, expect } from '@playwright/test'
import { aaveWstETH8020Mock } from '@repo/lib/modules/pool/__mocks__/api-mocks/aaveWstETH8020Mock'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test.describe('Weighted pool v2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:3000/pools/ethereum/v2/${aaveWstETH8020Mock.id}`)
    await impersonate(page, defaultAnvilAccount)
  })

  test('flexible', async ({ page }) => {
    await clickButton(page, 'Add liquidity')
    await expect(button(page, 'Next')).toBeVisible()

    await page.getByPlaceholder('0.00').nth(0).fill('1')
    await page.getByText('I accept the risks of').click()
    await clickButton(page, 'Next')

    await doLiquidityTxSteps(page, 'Add')
    await expect(page.getByText('Transaction confirmed')).toBeVisible()
  })

  test('proportional', async ({ page }) => {
    await clickButton(page, 'Add liquidity')
    await expect(button(page, 'Next')).toBeVisible()

    await page.locator('#button-group-1').click()

    await page.getByPlaceholder('0.00').nth(0).fill('1')
    await page.getByText('I accept the risks of').click()
    await clickButton(page, 'Next')

    await doLiquidityTxSteps(page, 'Add')
    await expect(page.getByText('Transaction confirmed')).toBeVisible()
  })
})

test.describe('Boosted stable pool v3', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `http://localhost:3000/pools/ethereum/v3/0x85b2b559bc2d21104c4defdd6efca8a20343361d`,
    )
    await impersonate(page, defaultAnvilAccount)
    await expect(button(page, 'Connect')).not.toBeVisible()
  })

  test('flexible', async ({ page }) => {
    await clickButton(page, 'Add liquidity')
    await page.getByPlaceholder('0.00').nth(1).fill('100')

    await page.getByText('I accept the risks of').click()
    await page.getByText('I accept that by adding tokens').click()

    await clickButton(page, 'Next')

    await doLiquidityTxSteps(page, 'Add')
    await expect(page.getByText('Transaction confirmed')).toBeVisible()
  })

  test('proportional', async ({ page }) => {
    await page.getByRole('button', { name: 'Add liquidity' }).click()

    await page.locator('#button-group-1').click()

    await page.getByPlaceholder('0.00').nth(1).fill('100')

    await page.getByText('I accept the risks of').click()
    await page.getByText('I accept that by adding tokens').click()

    await clickButton(page, 'Next')

    await doLiquidityTxSteps(page, 'Add')
    await expect(page.getByText('Transaction confirmed')).toBeVisible()
  })
})
