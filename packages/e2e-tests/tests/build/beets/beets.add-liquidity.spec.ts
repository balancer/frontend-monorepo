import { expect, test } from '@playwright/test'

/*
  Ported from tests/build/balancer/bal.add-liquidity.spec.ts

  Target: "I believe I can FLY" (25USDC-50FLY-25stS), a v3 weighted pool on Sonic. Its TVL is
  below the $50k balanced-add threshold, so the tab states are the inverse of the Balancer
  original (a v2 WeightedPool2Tokens that does not support proportional adds): here flexible
  adds are disabled and proportional is the only option.
*/
const flyPoolId = '0xa476b33460e792bac5cc294ba19f0543ab00dc01'

test('Beets: add liquidity page renders', async ({ page }) => {
  await page.goto(`http://localhost:3001/pools/sonic/v3/${flyPoolId}`)

  await page.getByRole('button', { name: 'Add liquidity' }).click()

  // Flexible tab is disabled while pool TVL is below the balanced-add minimum
  await page.locator('#button-group-0').hover() //TODO: add id to the button to improve locator
  await expect(page.getByText('Liquidity must be added proportionally')).toBeVisible()
  await page.locator('#button-group-1').hover() //TODO: add id to the button to improve locator

  // Form works for proportional tab
  await expect(page.getByText('Proportional', { exact: true })).toBeVisible()
  await page.getByPlaceholder('0.00').first().click()
  await page.getByPlaceholder('0.00').first().fill('1')
  await page.getByRole('button', { name: 'Connect' }).nth(2).click()
})
