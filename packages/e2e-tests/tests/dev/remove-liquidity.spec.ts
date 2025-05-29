import { impersonate, setForkBalances } from '@/helpers/e2e.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

test('Removes liquidity from v2 pool (20wstETH-80AAVE)', async ({ page }) => {
  const poolBPTAddress = '0x3de27EFa2F1AA663Ae5D458857e731c129069F29'
  const poolId = '0x3de27efa2f1aa663ae5d458857e731c129069f29000200000000000000000588'
  // Must go before loading the page
  await setForkBalances(page, {
    chainId: 1,
    forkBalances: {
      1: [
        {
          // Note that setting balance for weighted v2 pools works but it could not work for other pool types (due to proxies or other reasons)
          tokenAddress: poolBPTAddress,
          value: '5000',
        },
      ],
    },
  })

  await page.goto(`http://localhost:3000/pools/ethereum/v3/${poolId}`)

  await impersonate(page, defaultAnvilAccount)

  await page.getByRole('button', { name: 'Remove' }).click()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Remove liquidity' }).click()
  await expect(page.getByText('Transaction confirmed')).toBeVisible()

  await page.getByRole('button', { name: 'Return to pool' }).click()
})
