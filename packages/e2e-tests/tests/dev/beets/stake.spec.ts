import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, clickLink } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Stake S to stS on /stake', async ({ page }) => {
  await page.goto('http://localhost:3001/stake')
  await impersonate(page, defaultAnvilAccount)

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
