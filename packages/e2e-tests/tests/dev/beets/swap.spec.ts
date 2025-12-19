import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, clickLink } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Wrap 1 S to wS', async ({ page }) => {
  await page.goto('http://localhost:3001/pools')
  await impersonate(page, defaultAnvilAccount)

  // Wait for dev tools panel to fully close before checking wallet button
  await expect(button(page, 'Dev tools button')).toBeVisible()
  await expect(button(page, 'Connect wallet')).not.toBeVisible()
  await clickLink(page, 'Swap')

  await page.getByRole('button', { name: 'Select token' }).nth(1).click()
  await page.getByText('Wrapped Sonic', { exact: true }).click()
  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('1')

  await clickButton(page, 'Next')

  await clickButton(page, 'Wrap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
