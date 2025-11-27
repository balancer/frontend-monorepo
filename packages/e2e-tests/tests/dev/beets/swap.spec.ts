import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, clickLink, isButtonVisible } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Swap 1 S to USDC)', async ({ page }) => {
  await page.goto('http://localhost:3001/pools')
  await impersonate(page, defaultAnvilAccount)

  await expect(button(page, 'Connect wallet')).not.toBeVisible()
  await clickLink(page, 'Swap')

  await clickButton(page, 'S')
  await page.getByText('USDCUSDC').click()
  await clickButton(page, 'Select token')
  await page.getByText('Wrapped Sonic', { exact: true }).click()
  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('100')

  await clickButton(page, 'Next')

  if (await isButtonVisible(page, 'Approve USDC to swap')) {
    await clickButton(page, 'Approve USDC to swap')
  }

  await clickButton(page, 'Swap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
