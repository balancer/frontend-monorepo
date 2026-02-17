import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, clickLink } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Wrap 1 S to wS', async ({ page }) => {
  await page.goto('http://localhost:3001/swap')
  await impersonate(page, defaultAnvilAccount)

  await clickButton(page, 'Select token')
  await page.getByText('Wrapped Sonic', { exact: true }).click()
  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('1')

  await clickButton(page, 'Next')

  await clickButton(page, 'Wrap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
