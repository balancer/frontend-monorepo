import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, setSliderPercent, forceClickButton } from '@/helpers/user.helpers'
import { test, expect, Page } from '@playwright/test'
import { aaveWstETH8020Mock } from '@repo/lib/modules/pool/__mocks__/api-mocks/aaveWstETH8020Mock'
import { aave_USDC_USDTMock } from '@repo/lib/modules/pool/__mocks__/api-mocks/aave_USDC_USDTMock'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test.describe('Weighted pool v2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:3000/pools/ethereum/v2/${aaveWstETH8020Mock.id}`)
    await impersonate(page, defaultAnvilAccount)
    await expect(button(page, 'Connect')).not.toBeVisible()
  })

  test.describe('Add liquidity', () => {
    test('flexible', async ({ page }) => {
      await clickButton(page, 'Add liquidity')
      await expect(button(page, 'Next')).toBeVisible()

      await page.getByPlaceholder('0.00').nth(0).fill('1')
      await page.getByText('I accept the risks of').click()
      await clickButton(page, 'Next')

      await doAddLiquidityTxSteps(page)
      await expect(page.getByText('Transaction confirmed')).toBeVisible()
    })

    test('proportional', async ({ page }) => {
      await clickButton(page, 'Add liquidity')
      await expect(button(page, 'Next')).toBeVisible()

      await page.locator('#button-group-1').click() // proportional tab
      await page.getByPlaceholder('0.00').nth(0).fill('1')
      await page.getByText('I accept the risks of').click()
      await clickButton(page, 'Next')

      await doAddLiquidityTxSteps(page)
      await expect(page.getByText('Transaction confirmed')).toBeVisible()
    })
  })

  test.describe('Remove Liquidity', () => {
    test('proportional', async ({ page }) => {
      await clickButton(page, 'Remove')
      await setSliderPercent(page, 50)
      await clickButton(page, 'Next')

      await clickButton(page, 'Remove liquidity')
      await expect(page.getByText('Transaction confirmed')).toBeVisible()

      await forceClickButton(page, 'Return to pool')
      await expect(page.getByText(aaveWstETH8020Mock.symbol).first()).toBeVisible()
    })

    test('single token', async ({ page }) => {
      await clickButton(page, 'Remove')
      await page.locator('#button-group-single').click()
      await clickButton(page, 'Next')

      await clickButton(page, 'Remove liquidity')
      await expect(page.getByText('Transaction confirmed')).toBeVisible()

      await forceClickButton(page, 'Return to pool')
      await expect(page.getByText(aaveWstETH8020Mock.symbol).first()).toBeVisible()
    })
  })
})

test.describe('Boosted stable pool v3', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:3000/pools/ethereum/v3/${aave_USDC_USDTMock.id}`)
    await impersonate(page, defaultAnvilAccount)
    await expect(button(page, 'Connect')).not.toBeVisible()
  })

  test.describe('Add liquidity', () => {
    test('flexible', async ({ page }) => {
      await clickButton(page, 'Add liquidity')
      await page.getByPlaceholder('0.00').nth(1).fill('100')

      await agreeToBoostedPoolRisks(page)
      await clickButton(page, 'Next')

      await doAddLiquidityTxSteps(page)
      await expect(page.getByText('Transaction confirmed')).toBeVisible()
    })

    test('proportional', async ({ page }) => {
      await page.getByRole('button', { name: 'Add liquidity' }).click()

      await page.locator('#button-group-1').click() // proportional tab
      await page.getByPlaceholder('0.00').nth(1).fill('100')
      await agreeToBoostedPoolRisks(page)
      await clickButton(page, 'Next')

      await doAddLiquidityTxSteps(page)
      await expect(page.getByText('Transaction confirmed')).toBeVisible()
    })
  })

  test.describe('Remove Liquidity', () => {
    test('proportional', async ({ page }) => {
      await clickButton(page, 'Remove')
      await setSliderPercent(page, 50)
      await clickButton(page, 'Next')

      await clickButton(page, `Sign approval: ${aave_USDC_USDTMock.symbol}`)
      await clickButton(page, 'Remove liquidity')
      await expect(page.getByText('Transaction confirmed')).toBeVisible()

      await forceClickButton(page, 'Return to pool')
      await expect(page.getByText(aave_USDC_USDTMock.symbol).first()).toBeVisible()
    })

    test('single token', async ({ page }) => {
      await clickButton(page, 'Remove')
      const singleTokenTab = page.locator('#button-group-single')
      await expect(singleTokenTab).toBeDisabled() // Boosted pools do not support single token removes
    })
  })
})

async function agreeToBoostedPoolRisks(page: Page) {
  await page.getByText('I accept the risks of').click()
  await page.getByText('I accept that by adding tokens').click()
}

async function doAddLiquidityTxSteps(page: Page) {
  const addButton = button(page, 'Add liquidity')
  const approveOrSignButton = page.getByRole('button', { name: /(Approve|Sign)/i })

  while (true) {
    await addButton.or(approveOrSignButton).waitFor()
    if (await addButton.isVisible()) break
    try {
      await approveOrSignButton.click({ timeout: 3000 })
    } catch {
      // Button was detached between visibility check and click
    }
  }

  await addButton.click()
}
