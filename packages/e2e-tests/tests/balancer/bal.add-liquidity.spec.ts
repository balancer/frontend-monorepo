import { test, expect } from '@playwright/test'
import { balWeth8020 } from '@repo/lib/modules/pool/__mocks__/pool-examples/flat'

test('Balancer: can add liquidity to random pool', async ({ page }) => {
  await page.goto(`http://localhost:3000/pools/ethereum/v2/${balWeth8020.poolId}`)

  await page.getByRole('button', { name: 'Add liquidity' }).click()

  // Proportional tab is disabled
  await page.locator('#button-group-1').hover() //TODO: add id to the button to improve locator
  await expect(page.getByText('This pool does not support')).toBeVisible()

  // Form works for flexible tab
  await expect(page.getByText('Flexible')).toBeVisible()
  await page.getByPlaceholder('0.00').first().click()
  await page.getByPlaceholder('0.00').first().fill('1')
  await page.getByRole('button', { name: 'Connect wallet' }).nth(2).click()
})
