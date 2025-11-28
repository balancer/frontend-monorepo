import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, clickLink } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Unstake stS on /stake', async ({ page }) => {
  await page.goto('http://localhost:3001/pools')
  await impersonate(page, defaultAnvilAccount)

  // Wait for dev tools panel to fully close before checking wallet button
  await expect(button(page, 'Dev tools button')).toBeVisible()
  await expect(button(page, 'Connect wallet')).not.toBeVisible()
  await clickLink(page, 'Stake \\$S')

  // The Stake tab should be active by default
  //await expect(page.getByRole('button', { name: 'S' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Stake' })).toBeVisible()

  // The Unstake tab should be clicked to become active
  //await page.getByRole('button', { name: 'Unstake' }).click()
  await page.locator('#button-group-1').click()

  // Confirm unstake tab is active
  await expect(page.getByRole('button', { name: 'stS', exact: true })).toBeVisible()

  // Fill in the amount to unstake
  await page.getByPlaceholder('0.00').nth(0).fill('1')

  // Click Next to open unstake modal
  await clickButton(page, 'Next')

  // Click the Unstake button in the modal to execute the transaction
  await clickButton(page, 'Unstake')
  await expect(page.getByText('Unstake again')).toBeVisible()
})
