import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, clickLink, isButtonVisible } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { setForkBalances } from '@/helpers/e2e.helpers'

test('Swap 1000 BEETS to stS)', async ({ page }) => {
  await setForkBalances(page, {
    chainId: 146,
    forkBalances: {
      146: [
        {
          tokenAddress: '0x2d0e0814e62d80056181f5cd932274405966e4f0', // BEETS
          value: '10000',
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
  await page.getByText('BEETSBEETS', { exact: true }).click()
  await clickButton(page, 'Select token')
  await page.getByText('Beets Staked Sonic').click()
  await page.getByRole('spinbutton', { name: 'TokenIn' }).fill('1000')

  await clickButton(page, 'Next')

  if (await isButtonVisible(page, 'Approve BEETS to swap')) {
    await clickButton(page, 'Approve BEETS to swap')
  }

  if (await isButtonVisible(page, 'Sign permit: BEETS ')) {
    await clickButton(page, 'Sign permit: BEETS')
  }

  await clickButton(page, 'Swap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
