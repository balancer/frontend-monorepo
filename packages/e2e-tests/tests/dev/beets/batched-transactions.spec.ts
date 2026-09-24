import { impersonate } from '@/helpers/e2e.helpers'
import { button, checkbox, clickButton } from '@/helpers/user.helpers'
import { expect, test, Page } from '@playwright/test'
import { EIP5792_EMULATION_LS_KEY } from '@repo/lib/modules/web3/impersonation/customMock'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

/*
  Ported from tests/dev/balancer/batched-transactions.spec.ts

  Covers the batched transaction flow (EIP-5792 wallet_sendCalls) end to end against a Sonic fork.

  The mock connector emulates an atomic-batching wallet (like an EIP-7702 upgraded EOA) when the
  EIP5792_EMULATION_LS_KEY localStorage flag is set before the app boots (see
  packages/lib/modules/web3/impersonation/customMock.ts). The app then:
    - detects the atomic capability (useEip5792AtomicCapability)
    - shows the "Token approval bundling" alert
    - submits approvals + action as a single wallet_sendCalls batch
      (useEip5792BatchSubmitter), which the emulator executes against the fork

  Target is Boosted Angular Symphony (bpt-anS-SiloWS), the Sonic v3 boosted stable pool at the
  requested URL. The add-liquidity transaction requires both pool tokens, so its Sonic fork balance
  fixtures include anS, SiloWS, and the SiloWS underlying wS. Its TVL is below the balanced-add
  threshold, so flexible adds are disabled and the test drives the proportional tab (the Balancer
  original used flexible on a higher-TVL pool).
*/
const boostedPoolId = '0x944d4ae892de4bfd38742cc8295d6d5164c5593c'

test.describe('Boosted stable pool v3 - batched transactions', () => {
  test.beforeEach(async ({ page }) => {
    await enableEip5792Emulation(page)

    await page.goto(`http://localhost:3001/pools/sonic/v3/${boostedPoolId}`)
    await impersonate(page, defaultAnvilAccount)
    await expect(button(page, 'Connect')).not.toBeVisible()
  })

  test('add liquidity batches approval and action into a single call', async ({ page }) => {
    await clickButton(page, 'Add liquidity')
    await page.locator('[data-id="add-liquidity-tab-proportional"]').click()
    await page.getByPlaceholder('0.00').first().fill('100')

    await agreeToBoostedPoolRisks(page)
    await clickButton(page, 'Next')

    // The app detected an atomic-batching wallet and announces the bundled flow
    await expect(page.getByText('Token approval bundling')).toBeVisible()

    // No separate approve/sign steps: everything goes in one batched call
    await expect(page.getByRole('button', { name: /(Approve|Sign)/i })).toHaveCount(0)

    await clickButton(page, 'Add liquidity')

    await expect(page.getByText('Transaction confirmed')).toBeVisible()
  })
})

async function enableEip5792Emulation(page: Page) {
  await page.addInitScript(key => {
    window.localStorage.setItem(key, 'true')
  }, EIP5792_EMULATION_LS_KEY)
}

async function agreeToBoostedPoolRisks(page: Page) {
  const boostedPoolRiskCheckbox = await checkbox(
    page,
    /I accept the risks of interacting with this pool/i,
  )

  const boostedPoolAdditionRiskCheckbox = await checkbox(
    page,
    /^I accept that by adding tokens to this Boosted Pool/i,
  )

  await boostedPoolRiskCheckbox.click()
  await boostedPoolAdditionRiskCheckbox.click()
}
