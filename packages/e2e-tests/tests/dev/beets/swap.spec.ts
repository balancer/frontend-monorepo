import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, clickLink, isButtonVisible } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { setForkBalances } from '@/helpers/e2e.helpers'

test('Swap 1000 wS to stS)', async ({ page }) => {
  await setForkBalances(page, {
    chainId: 146,
    forkBalances: {
      146: [
        {
          tokenAddress: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38', // wS
          value: '1000',
        },
      ],
    },
  })

  await page.goto('http://localhost:3001/pools')
  await impersonate(page, defaultAnvilAccount)

  // Wait for dev tools panel to fully close before checking wallet button
  await expect(button(page, 'Dev tools button')).toBeVisible()
  await expect(button(page, 'Connect wallet')).not.toBeVisible()
  await clickLink(page, 'Swap')

  await clickButton(page, 'S')
  await page.getByText('Wrapped Sonic', { exact: true }).click()
  await clickButton(page, 'Select token')
  await page.getByText('Beets Staked Sonic').click()
  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('1000')

  await clickButton(page, 'Next')

  if (await isButtonVisible(page, 'Approve wS to swap')) {
    await clickButton(page, 'Approve wS to swap')
  }

  await clickButton(page, 'Swap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
