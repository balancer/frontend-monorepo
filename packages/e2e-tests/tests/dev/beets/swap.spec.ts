import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, selectPopularToken } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

/*
  Ported from tests/dev/balancer/swap.spec.ts

  Balancer swaps native ETH for GHO on the mainnet fork; Beets swaps native S for stS on the Sonic
  fork. The token in is passed as the native address because, unlike mainnet's popularTokens, the
  Sonic config has no entry for the native asset so a "S" slug would not resolve (see
  SwapProvider.setInitialTokenIn). stS is the output because it is a Sonic popularToken and the SOR
  finds a deep route for it on the pinned fork block; USDC.e quoted a route but reverted with
  Vault.NotEnoughLiquidity().
*/
test('Swap 0.1 S to stS', async ({ page }) => {
  await page.goto('http://localhost:3001/swap/sonic/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')

  await impersonate(page, defaultAnvilAccount)

  await page.getByRole('textbox', { name: 'TokenIn' }).fill('0.1')
  await selectPopularToken(page, 'stS')
  await clickButton(page, 'Next')

  await clickButton(page, 'Swap')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Swap again' }).click()
})
