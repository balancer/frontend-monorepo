import { test, expect } from '@playwright/test'
import { balWeth8020 } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'

test('Balancer: can add liquidity to random pool', async ({ page }) => {
  await page.goto(`http://localhost:3000/pools/ethereum/v2/${balWeth8020.poolId}`)

  await page.getByRole('button', { name: 'Add liquidity' }).click()

  // Proportional tab is disabled
  await page.locator('#button-group-1').hover() //TODO: add id to the button to improve locator
  await expect(
    page.getByText('does not support liquidity to be added proportionally'),
  ).toBeVisible()
  await page.locator('#button-group-0').hover() //TODO: add id to the button to improve locator

  // Form works for flexible tab
  await expect(page.getByText('Flexible', { exact: true })).toBeVisible()
  await page.getByPlaceholder('0.00').first().click()
  await page.getByPlaceholder('0.00').first().fill('1')
  await page.getByRole('button', { name: 'Connect' }).nth(2).click()
})
