import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, clickLink } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test.describe('Stake $S page at /stake', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/stake')
    await impersonate(page, defaultAnvilAccount)
  })

  test('Can stake S to stS', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Stake' })).toBeVisible()
    await page.getByPlaceholder('0.00').nth(0).fill('1')
    await clickButton(page, 'Next')
    await expect(page.getByText('Review stake')).toBeVisible()
    await clickButton(page, 'Stake')
    await expect(page.getByText('Stake again')).toBeVisible()
  })

  test('Can unstake stS', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Stake' })).toBeVisible()
    await page.locator('#button-group-1').click()
    await expect(page.getByRole('button', { name: 'stS', exact: true })).toBeVisible()
    await page.getByPlaceholder('0.00').nth(0).fill('10')
    await clickButton(page, 'Next')
    await clickButton(page, 'Unstake')
    await expect(page.getByText('Unstake again')).toBeVisible()
  })
})
