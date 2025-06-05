import { impersonate, setForkBalances } from '@/helpers/e2e.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Swap 1 ETH to USDC)', async ({ page }) => {
  await page.goto('http://localhost:3000/swap/ethereum/ETH')

  await impersonate(page, defaultAnvilAccount)

  await page.getByRole('button', { name: 'Select token' }).click()
  await page.getByText('USD Coin').click()

  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('0.1')

  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Swap' }).click()
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
