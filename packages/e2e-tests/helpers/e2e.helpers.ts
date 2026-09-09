import { Page, expect } from '@playwright/test'
import { setErc20Balance } from '@repo/lib/test/anvil/useSetErc20Balance'
import { defaultManualForkOptions } from '@repo/lib/test/utils/wagmi/fork-options'
import { forkClient, impersonatedAddressStorageKey } from '@repo/lib/test/utils/wagmi/fork.helpers'

type Address = `0x${string}`

/*
  Replaces the dev-tools drawer flow. Token balances are set node-side against the anvil fork and
  the address is written to localStorage via an init script; the app then auto-reconnects from
  that key on boot (see useImpersonateAccount). Reloaded so the init script runs before the app
  boots, letting specs keep calling this after page.goto.
*/
export async function impersonate(page: Page, impersonationAddress: Address) {
  await fundImpersonatedAccount(impersonationAddress)

  await page.addInitScript(({ key, address }) => window.localStorage.setItem(key, address), {
    key: impersonatedAddressStorageKey,
    address: impersonationAddress,
  })

  await page.reload({ waitUntil: 'commit' })
  await waitForConnected(page)
}

export async function waitForConnected(page: Page) {
  await page.locator('img[alt="Avatar"]').first().waitFor({ state: 'visible' })
}

async function fundImpersonatedAccount(address: Address) {
  const tokenBalances = defaultManualForkOptions.forkBalances[forkClient.chain.id] || []

  for (const balance of tokenBalances) {
    await setErc20Balance({ client: forkClient, address, balance })
  }
}
