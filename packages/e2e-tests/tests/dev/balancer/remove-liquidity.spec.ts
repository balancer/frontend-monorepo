import { impersonate, setForkBalances } from '@/helpers/e2e.helpers'
import { button, clickButton, forceClickButton } from '@/helpers/user.helpers'
import { expect, Page, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

const POOL_ID = '0x3de27efa2f1aa663ae5d458857e731c129069f29000200000000000000000588'
const BPT_ADDRESS = '0x3de27EFa2F1AA663Ae5D458857e731c129069F29'

test('Removes liquidity from v2 pool (20wstETH-80AAVE)', async ({ page }) => {
  await setPoolInitialBalance(page)

  await page.goto(`http://localhost:3000/pools/ethereum/v3/${POOL_ID}`)

  await impersonate(page, defaultAnvilAccount)
  await expect(button(page, 'Connect')).not.toBeVisible()

  await clickButton(page, 'Remove')
  await clickButton(page, 'Next')
  await clickButton(page, 'Remove liquidity')
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await forceClickButton(page, 'Return to pool')
  await expect(page.getByText('20wstETH-80AAVE').first()).toBeVisible()
})

async function setPoolInitialBalance(page: Page) {
  await setForkBalances(page, {
    chainId: 1,
    forkBalances: {
      1: [
        {
          // Note that setting balance for weighted v2 pools works but it
          // could not work for other pool types (due to proxies or other reasons)
          tokenAddress: BPT_ADDRESS,
          value: '5000',
        },
      ],
    },
  })
}
