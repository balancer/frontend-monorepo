import { impersonate } from '@/helpers/e2e.helpers'
import { button, checkbox, clickButton, setSliderPercent } from '@/helpers/user.helpers'
import { expect, test, Page } from '@playwright/test'
import { aave_GHO_USDT_USDCMock } from '@repo/lib/modules/pool/__mocks__/api-mocks/aave_GHO_USDT_USDCMock'
import { EIP5792_EMULATION_LS_KEY } from '@repo/lib/modules/web3/impersonation/customMock'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'

/*
  Covers the batched transaction flow (EIP-5792 wallet_sendCalls) end to end.

  The mock connector emulates an atomic-batching wallet (like an EIP-7702 upgraded
  EOA) when the EIP5792_EMULATION_LS_KEY localStorage flag is set before the app
  boots (see packages/lib/modules/web3/impersonation/customMock.ts). The app then:
    - detects the atomic capability (useEip5792AtomicCapability)
    - shows the "Token approval bundling" alert
    - submits approvals + action as a single wallet_sendCalls batch
      (useEip5792BatchSubmitter), which the emulator executes against the fork
*/
test.describe('Boosted stable pool v3 - batched transactions', () => {
  test.beforeEach(async ({ page }) => {
    await enableEip5792Emulation(page)

    await page.goto(`http://localhost:3000/pools/ethereum/v3/${aave_GHO_USDT_USDCMock.id}`)
    await impersonate(page, defaultAnvilAccount)
    await expect(button(page, 'Connect')).not.toBeVisible()
  })

  test('add liquidity batches approval and action into a single call', async ({ page }) => {
    await clickButton(page, 'Add liquidity')
    await page.getByPlaceholder('0.00').nth(1).fill('100')

    await agreeToBoostedPoolRisks(page)
    await clickButton(page, 'Next')

    // The app detected an atomic-batching wallet and announces the bundled flow
    await expect(page.getByText('Token approval bundling')).toBeVisible()

    // No separate approve/sign steps: everything goes in one batched call
    await expect(page.getByRole('button', { name: /(Approve|Sign)/i })).toHaveCount(0)

    await clickButton(page, 'Add liquidity')

    await expect(page.getByText('Transaction confirmed')).toBeVisible()
  })

  test('remove liquidity batches approvals and action into a single call', async ({ page }) => {
    await clickButton(page, 'Remove')
    await setSliderPercent(page, 50)
    await clickButton(page, 'Next')

    await expect(page.getByText('Token approval bundling')).toBeVisible()

    // Without batching this pool shows a separate 'Sign approval' step
    await expect(page.getByRole('button', { name: /(Approve|Sign)/i })).toHaveCount(0)

    await clickButton(page, 'Remove liquidity')

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
