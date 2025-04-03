import { Page } from '@playwright/test'
import { TokenBalancesByChain, ForkOptions } from '@repo/lib/test/utils/wagmi/fork-options'
import { sleep } from '@repo/lib/shared/utils/sleep'

declare global {
  interface Window {
    forkOptions?: ForkOptions
  }
}

export async function impersonate(page: Page, impersonationAddress: string) {
  await page.getByLabel('Mock address').fill(impersonationAddress)
  await page.getByLabel('Impersonate').click()
  await sleep(1000)
  // Currently AcceptPoliciesModal is not shown when shouldUseAnvilFork is true
  // await acceptPolicies(page)
}

/*
  Helper to initialize anvil fork options though global interface window.forkOptions
*/
export async function setForkBalances(page: Page, forkOptions?: ForkOptions) {
  const defaultForkBalances: TokenBalancesByChain = {
    [1]: [
      {
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
        value: '100',
      },
      {
        tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d', // BAL
        value: '4000',
      },
    ],
  }
  const defaultChainId = 1

  const defaultForkOptions: ForkOptions = {
    chainId: defaultChainId,
    forkBalances: defaultForkBalances,
  }

  await page.addInitScript(forkOptions => {
    window.forkOptions = {
      chainId: forkOptions.chainId || 1,
      forkBalances: forkOptions.forkBalances,
    }
  }, forkOptions || defaultForkOptions)
}

export async function acceptPolicies(page: Page) {
  await page
    .getByRole('dialog', { name: 'Accept Balancer policies' })
    .locator('span')
    .first()
    .check()
  await page.getByRole('button', { name: 'Proceed' }).click()
}
