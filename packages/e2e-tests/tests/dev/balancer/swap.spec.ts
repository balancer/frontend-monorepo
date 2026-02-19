import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, isButtonVisible } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Swap 1 ETH to USDC)', async ({ page }) => {
  await page.goto('http://localhost:3000/swap/ethereum/ETH')

  await impersonate(page, defaultAnvilAccount)

  await clickButton(page, 'ETH')
  await page.getByText('Wrapped Ether', { exact: true }).click()

  await clickButton(page, 'Select token')
  await page.getByText('USDCUSDC').click()
  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('0.1')

  await clickButton(page, 'Next')

  if (await isButtonVisible(page, 'Approve WETH to swap')) {
    await clickButton(page, 'Approve WETH to swap')
  }

  await clickButton(page, 'Swap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
