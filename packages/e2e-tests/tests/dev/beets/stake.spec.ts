import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, clickLink } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Stake S to stS on /stake', async ({ page }) => {
  await page.goto('http://localhost:3001/pools')
  await impersonate(page, defaultAnvilAccount)

  // Wait for dev tools panel to fully close before checking wallet button
  await expect(button(page, 'Dev tools button')).toBeVisible()
  await expect(button(page, 'Connect wallet')).not.toBeVisible()
  await clickLink(page, 'stake')

  // The Stake tab should be active by default
  await expect(page.getByRole('button', { name: 'Stake' })).toBeVisible()

  // Fill in the amount to stake (S is the native asset)
  await page.getByPlaceholder('0.00').nth(0).fill('1')

  // Click Next to open stake modal
  await clickButton(page, 'Next')

  // Click the Stake button in the modal to execute the transaction
  await clickButton(page, 'Stake')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()
})
