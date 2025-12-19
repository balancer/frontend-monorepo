import { impersonate } from '@/helpers/e2e.helpers'
import { button, clickButton, clickLink } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { setForkBalances } from '@/helpers/e2e.helpers'

test('Unstake stS on /stake', async ({ page }) => {
  await setForkBalances(page, {
    chainId: 146,
    forkBalances: {
      146: [
        {
          tokenAddress: '0xe5da20f15420ad15de0fa650600afc998bbe3955', // stS
          value: '10',
        },
      ],
    },
  })

  await page.goto('http://localhost:3001/pools')
  await impersonate(page, defaultAnvilAccount)

  // Wait for dev tools panel to fully close before checking wallet button
  await expect(button(page, 'Dev tools button')).toBeVisible()
  await expect(button(page, 'Connect wallet')).not.toBeVisible()
  await clickLink(page, 'Stake \\$S')

  // The Stake tab should be active by default
  await expect(page.getByRole('button', { name: 'Stake' })).toBeVisible()

  // The Unstake tab should be clicked to become active
  await page.locator('#button-group-1').click()

  // Confirm unstake tab is active
  await expect(page.getByRole('button', { name: 'stS', exact: true })).toBeVisible()

  // Fill in the amount to unstake
  await page.getByPlaceholder('0.00').nth(0).fill('0.1')

  // Click Next to open unstake modal
  await clickButton(page, 'Next')

  // Click the Unstake button in the modal to execute the transaction
  await clickButton(page, 'Unstake')
  await expect(page.getByText('Unstake again')).toBeVisible()
})
