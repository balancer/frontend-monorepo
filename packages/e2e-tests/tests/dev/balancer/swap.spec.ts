import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, selectPopularToken } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Swap 1 ETH to GHO)', async ({ page }) => {
  await page.goto('http://localhost:3000/swap/ethereum/ETH')

  await impersonate(page, defaultAnvilAccount)

  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('0.1')
  await selectPopularToken(page, 'GHO')
  await clickButton(page, 'Next')

  await clickButton(page, 'Swap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
