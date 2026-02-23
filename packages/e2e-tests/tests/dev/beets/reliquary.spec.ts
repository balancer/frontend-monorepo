import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton } from '@/helpers/user.helpers'
import { expect, test, type Page } from '@playwright/test'
import { defaultAnvilAccount, forkClient } from '@repo/lib/test/utils/wagmi/fork.helpers'

const baseUrl = 'http://localhost:3001'

test.describe('Reliquary page at /mabeets', () => {
  test('Shows reliquary landing sections', async ({ page }) => {
    await gotoMabeetsAndImpersonate(page)
    await expect(page.getByText('Your Relics')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create New Relic' })).toBeVisible()
  })

  test('Can create a new Relic', async ({ page }) => {
    await gotoMabeetsAndImpersonate(page)
    await createRelicAndReturnToMabeets(page)
  })

  test.describe('Existing Relic Actions', () => {
    let existingRelicSnapshotId: `0x${string}`

    test.beforeAll(async ({ browser }) => {
      await forkClient.reset()

      const context = await browser.newContext()
      const page = await context.newPage()

      await gotoMabeetsAndImpersonate(page)
      await createRelicAndReturnToMabeets(page)
      existingRelicSnapshotId = await forkClient.snapshot()

      await context.close()
    })

    test.beforeEach(async ({ page }) => {
      await forkClient.revert({ id: existingRelicSnapshotId })
      existingRelicSnapshotId = await forkClient.snapshot()
      await gotoMabeetsAndImpersonate(page)
    })

    test('Can add liquidity to created Relic', async ({ page }) => {
      await addLiquidityToExistingRelicAndReturn(page)
    })
  })
})

async function gotoMabeetsAndImpersonate(page: Page) {
  await page.goto(`${baseUrl}/mabeets`)
  await impersonate(page, defaultAnvilAccount)
}

async function createRelicAndReturnToMabeets(page: Page) {
  await clickButton(page, 'Create New Relic')

  await page.waitForURL(`${baseUrl}/mabeets/add-liquidity/new`, { waitUntil: 'commit' })
  await expect(page.getByText('Add liquidity to Relic')).toBeVisible()
  await expect(page.getByText('A new Relic will be created with this add liquidity')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeVisible()

  await page.locator('#button-group-1').click() // proportional tab
  await page.getByRole('button', { name: 'stS', exact: true }).waitFor({ state: 'visible' })
  await page.getByPlaceholder('0.00').nth(1).fill('1')
  await page.getByText('I agree to the terms of service as stated here').click()
  await page.getByText('I accept the risks of interacting with this pool').click()

  const nextButton = page.getByRole('button', { name: 'Next', exact: true })
  await expect(nextButton).toBeEnabled()
  await nextButton.click()

  await doCreateRelicTxSteps(page)
  await expect(page.getByText('Transaction confirmed')).toBeVisible()
  await expect(
    page.getByText("You've successfully created a new Relic and added liquidity to it!"),
  ).toBeVisible()

  await page.getByRole('button', { name: /Return to maBEETS/i }).click()
  await page.waitForURL(new RegExp(`${baseUrl}/mabeets(?:\\?focusRelic=\\d+)?$`), {
    waitUntil: 'commit',
  })
  await expect(page.getByText('Your maBEETS Summary')).toBeVisible()
}

async function addLiquidityToExistingRelicAndReturn(page: Page) {
  await clickButton(page, 'Add')
  await expect(page).toHaveURL(new RegExp(`${baseUrl}/mabeets/add-liquidity/\\d+`))
  await expect(page.getByText('Add liquidity to Relic')).toBeVisible()
  await expect(page.getByText('Adding liquidity to Relic #')).toBeVisible()

  // Flexible tab is default; provide only BEETS amount.
  await page.getByPlaceholder('0.00').first().fill('1000')
  await page.getByText('I accept the risks of interacting with this pool').click()

  const nextButton = page.getByRole('button', { name: 'Next', exact: true })
  await expect(nextButton).toBeEnabled()
  await nextButton.click()

  const addLiquidityButton = page.getByRole('button', { name: /Add liquidity to Relic/i })
  await expect(addLiquidityButton).toBeEnabled()
  await addLiquidityButton.click()

  await expect(page.getByText('Transaction confirmed')).toBeVisible()
  const returnToMabeetsButton = page.getByRole('button', { name: /Return to maBEETS/i })
  await expect(returnToMabeetsButton).toBeVisible()
  await returnToMabeetsButton.click()
  await page.waitForURL(new RegExp(`${baseUrl}/mabeets(?:\\?focusRelic=\\d+)?$`), {
    waitUntil: 'commit',
  })
  await expect(page.getByText('Your maBEETS Summary')).toBeVisible()
}

async function doCreateRelicTxSteps(page: Page) {
  const modal = page
    .getByRole('dialog')
    .filter({ has: page.getByText(/Create new Relic\s*(?:&|and)\s*add liquidity/i) })
  const createRelicButton = modal.getByRole('button', {
    name: /Create(?: new)? Relic\s*(?:&|and)\s*add liquidity/i,
  })

  const approveOrSignButton = modal.getByRole('button', { name: /(Approve|Sign)/i })

  while (true) {
    await createRelicButton.or(approveOrSignButton).first().waitFor()
    if ((await createRelicButton.isVisible()) && (await createRelicButton.isEnabled())) break
    try {
      if (
        (await approveOrSignButton.first().isVisible()) &&
        (await approveOrSignButton.first().isEnabled())
      ) {
        await approveOrSignButton.first().click({ timeout: 3000 })
      }
    } catch {
      // Button was detached between visibility check and click.
    }
  }

  await expect(createRelicButton).toBeEnabled()
  await createRelicButton.click()
}
