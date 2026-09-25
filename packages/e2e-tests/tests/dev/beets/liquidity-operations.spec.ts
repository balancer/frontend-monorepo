import { impersonate } from '@/helpers/e2e.helpers'
import {
  button,
  checkbox,
  clickButton,
  forceClickButton,
  setSliderPercent,
} from '@/helpers/user.helpers'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { defaultAnvilAccount, forkClient } from '@repo/lib/test/utils/wagmi/fork.helpers'

const BASE_URL = 'http://localhost:3001/pools/sonic'
const WEIGHTED_POOL = {
  url: `${BASE_URL}/v2/0x25ca5451cd5a50ab1d324b5e64f32c0799661891000200000000000000000018`,
  symbol: 'BPT-scUSD-stS',
}
const BOOSTED_POOL = {
  url: `${BASE_URL}/v3/0x944d4ae892de4bfd38742cc8295d6d5164c5593c`,
  symbol: 'bpt-anS-SiloWS',
}

async function openPool(page: Page, url: string) {
  await page.goto(url)
  await impersonate(page, defaultAnvilAccount)
  await expect(button(page, 'Connect')).not.toBeVisible()
}

async function agreeToBoostedPoolRisks(page: Page) {
  await (await checkbox(page, /I accept the risks of interacting with this pool/i)).click()
  await (await checkbox(page, /^I accept that by adding tokens to this Boosted Pool/i)).click()
}

async function addLiquidity(page: Page, boosted: boolean, proportional = boosted) {
  await clickButton(page, 'Add liquidity')
  if (proportional) {
    await page.locator('[data-id="add-liquidity-tab-proportional"]').click()
  }
  if (boosted) {
    // This pool is below the balanced-add threshold; only proportional adds are available.
    await page.getByPlaceholder('0.00').first().fill('10')
    await agreeToBoostedPoolRisks(page)
  } else {
    await page.getByPlaceholder('0.00').first().fill('1')
    await page.getByText('I accept the risks of').click()
  }
  await clickButton(page, 'Next')
  await doAddLiquidityTxSteps(page)
  await expect(page.getByText('Transaction confirmed')).toBeVisible()
}

async function doAddLiquidityTxSteps(page: Page) {
  const addButton = button(page, 'Add liquidity')
  const approveOrSignButton = page.getByRole('button', { name: /(Approve|Sign)/i })

  while (true) {
    await addButton.or(approveOrSignButton).waitFor()
    if (await addButton.isVisible()) break
    try {
      await approveOrSignButton.click({ timeout: 3000 })
    } catch {
      // Approval buttons can detach while the next transaction step loads.
    }
  }

  await addButton.click()
}

async function seedLpForRemoves(browser: Browser, url: string, boosted: boolean) {
  const context = await browser.newContext()
  try {
    const page = await context.newPage()
    await openPool(page, url)
    await addLiquidity(page, boosted)
  } finally {
    await context.close()
  }
}

for (const [pool, boosted] of [
  [WEIGHTED_POOL, false],
  [BOOSTED_POOL, true],
] as const) {
  test.describe(boosted ? 'Boosted stable pool v3 on Sonic' : 'Weighted pool v2 on Sonic', () => {
    test.beforeEach(async ({ page }) => {
      await openPool(page, pool.url)
    })

    test.describe('Add liquidity', () => {
      let snapshotId: `0x${string}`

      test.beforeEach(async () => {
        snapshotId = await forkClient.snapshot()
      })

      test.afterEach(async () => {
        await forkClient.revert({ id: snapshotId })
      })

      if (!boosted) {
        test('flexible', async ({ page }) => {
          await addLiquidity(page, false)
        })
      }

      test('proportional', async ({ page }) => {
        await addLiquidity(page, boosted, true)
      })
    })

    test.describe('Remove liquidity', () => {
      let initialSnapshotId: `0x${string}`
      let seededSnapshotId: `0x${string}`

      test.beforeAll(async ({ browser }) => {
        initialSnapshotId = await forkClient.snapshot()
        await seedLpForRemoves(browser, pool.url, boosted)
        seededSnapshotId = await forkClient.snapshot()
      })

      test.beforeEach(async () => {
        await forkClient.revert({ id: seededSnapshotId })
        seededSnapshotId = await forkClient.snapshot()
      })

      test.afterAll(async () => {
        await forkClient.revert({ id: initialSnapshotId })
      })

      test('proportional', async ({ page }) => {
        await clickButton(page, 'Remove')
        await setSliderPercent(page, 50)
        await clickButton(page, 'Next')

        if (boosted) {
          const signApproval = button(page, `Sign approval: ${pool.symbol}`)
          const removeLiquidity = button(page, 'Remove liquidity')
          await expect(signApproval.or(removeLiquidity).first()).toBeVisible()
          if (await signApproval.isVisible()) await signApproval.click()
        }
        await clickButton(page, 'Remove liquidity')
        await expect(page.getByText('Transaction confirmed')).toBeVisible()

        await forceClickButton(page, 'Return to pool')
        await expect(page.getByText(pool.symbol).first()).toBeVisible()
      })

      test('single token', async ({ page }) => {
        await clickButton(page, 'Remove')
        const singleTokenTab = page.locator('#button-group-single')
        if (boosted) {
          await expect(singleTokenTab).toBeDisabled()
          return
        }

        await singleTokenTab.click()
        await clickButton(page, 'Next')
        await clickButton(page, 'Remove liquidity')
        await expect(page.getByText('Transaction confirmed')).toBeVisible()
        await forceClickButton(page, 'Return to pool')
        await expect(page.getByText(pool.symbol).first()).toBeVisible()
      })
    })
  })
}
