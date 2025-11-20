import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, isButtonVisible } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Swap 1 S to USDC)', async ({ page }) => {
  await page.goto('http://localhost:3001/swap/sonic/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')

  await impersonate(page, defaultAnvilAccount)
  await expect(button(page, 'Connect wallet')).not.toBeVisible({ timeout: 20000 })

  await clickButton(page, 'S')
  await page.getByText('Wrapped Sonic').click()

  await clickButton(page, 'Select token')
  await page.getByText('USDCUSDC').click()
  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('0.1')

  await clickButton(page, 'Next')

  if (await isButtonVisible(page, 'Approve wS to swap')) {
    await clickButton(page, 'Approve wS to swap')
  }

  await clickButton(page, 'Swap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
