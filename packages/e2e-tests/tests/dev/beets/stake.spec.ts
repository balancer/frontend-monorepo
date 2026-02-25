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
    // The Stake tab should be active by default
    await expect(page.getByRole('button', { name: 'Stake' })).toBeVisible()

    // Fill in the amount to stake (S is the native asset)
    await page.getByPlaceholder('0.00').nth(0).fill('1')

    // Click Next to open stake modal
    await clickButton(page, 'Next')

    // Click the Stake button in the modal to execute the transaction
    await expect(page.getByText('Review stake')).toBeVisible()
    await clickButton(page, 'Stake')
    await expect(page.getByText('Stake again')).toBeVisible()
  })

  // depends on stake test executing first to give user stS balance (cannot be done with setForkBalances)
  test('Can unstake stS', async ({ page }) => {
    // The Stake tab should be active by default
    await expect(page.getByRole('button', { name: 'Stake' })).toBeVisible()

    // The Unstake tab should be clicked to become active
    await page.locator('#button-group-1').click()

    // Confirm unstake tab is active
    await expect(page.getByRole('button', { name: 'stS', exact: true })).toBeVisible()

    // Fill in the amount to unstake
    await page.getByPlaceholder('0.00').nth(0).fill('0.1')

    // Click Next to open unstake modal
    await clickButton(page, 'Next')

    await clickButton(page, 'Unstake')
    await expect(page.getByText('Unstake again')).toBeVisible()
  })
})
