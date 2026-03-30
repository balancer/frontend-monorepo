import { impersonate } from '@/helpers/e2e.helpers'
import { checkbox, clickButton } from '@/helpers/user.helpers'
import { expect, test, type Page } from '@playwright/test'
import { defaultAnvilAccount, forkClient } from '@repo/lib/test/utils/wagmi/fork.helpers'

const baseUrl = 'http://localhost:3001'
const mabeetsUrlPattern = new RegExp(`${baseUrl}/mabeets(?:\\?focusPosition=\\d+)?$`)
const nextButtonName = 'Next'
const returnToMabeetsButtonName = /Return to maBEETS/i

test.describe('Reliquary page at /mabeets', () => {
  test('Shows reliquary landing sections', async ({ page }) => {
    await gotoMabeetsAndImpersonate(page)
    await expect(page.getByText('Your maBEETS positions')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create New maBEETS position' })).toBeVisible()
  })

  test('Can create a new maBEETS position', async ({ page }) => {
    await gotoMabeetsAndImpersonate(page)
    await createPositionAndReturnToMabeets(page)
  })

  test.describe('Existing maBEETS position Actions', () => {
    let existingPositionSnapshotId: `0x${string}`

    test.beforeAll(async ({ browser }) => {
      await forkClient.reset()

      const context = await browser.newContext()
      const page = await context.newPage()

      await gotoMabeetsAndImpersonate(page)
      await createPositionAndReturnToMabeets(page)
      existingPositionSnapshotId = await forkClient.snapshot()

      await context.close()
    })

    test.beforeEach(async ({ page }) => {
      await forkClient.revert({ id: existingPositionSnapshotId })
      existingPositionSnapshotId = await forkClient.snapshot()
      await gotoMabeetsAndImpersonate(page)
    })

    test('Can add liquidity to created maBEETS position', async ({ page }) => {
      await addLiquidityToExistingPositionAndReturn(page)
    })

    test('Can remove liquidity from created maBEETS position', async ({ page }) => {
      await removeLiquidityFromExistingPositionAndReturn(page)
    })
  })
})

async function gotoMabeetsAndImpersonate(page: Page) {
  await page.goto(`${baseUrl}/mabeets`)
  await impersonate(page, defaultAnvilAccount)
}

async function createPositionAndReturnToMabeets(page: Page) {
  await clickButton(page, 'Create New maBEETS position')

  await page.waitForURL(`${baseUrl}/mabeets/add-liquidity/new`, { waitUntil: 'commit' })
  await expect(page.getByText('Add liquidity to maBEETS position')).toBeVisible()
  await expect(
    page.getByText('A new maBEETS position will be created with this add liquidity'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: nextButtonName, exact: true })).toBeVisible()

  await page.locator('[data-id="add-liquidity-tab-proportional"]').click()
  await page.getByRole('button', { name: 'stS', exact: true }).waitFor({ state: 'visible' })
  await page.getByPlaceholder('0.00').nth(1).fill('1')

  const termsCheckbox = await checkbox(page, 'I agree to the terms of service as stated here')
  await termsCheckbox.click()

  const risksCheckbox = await checkbox(page, 'I accept the risks of interacting with this pool')
  await risksCheckbox.click()

  await clickEnabledNextButton(page)

  await docreatePositionTxSteps(page)
  await expect(page.getByText('Transaction confirmed')).toBeVisible()
  await expect(
    page.getByText("You've successfully created a new maBEETS position and added liquidity to it!"),
  ).toBeVisible()

  await returnToMabeets(page)
}

async function addLiquidityToExistingPositionAndReturn(page: Page) {
  await clickButton(page, 'Add')
  await expect(page).toHaveURL(new RegExp(`${baseUrl}/mabeets/add-liquidity/\\d+`))
  await expect(page.getByText('Add liquidity to maBEETS position')).toBeVisible()
  await expect(page.getByText('Adding liquidity to maBEETS #')).toBeVisible()

  // Flexible tab is default; provide only BEETS amount.
  await page.getByPlaceholder('0.00').first().fill('1000')
  const risksCheckbox = await checkbox(page, 'I accept the risks of interacting with this pool')
  await risksCheckbox.click()

  await clickEnabledNextButton(page)

  const addLiquidityButton = page.getByRole('button', { name: /Add liquidity to maBEETS/i })
  await addLiquidityButton.click()

  await confirmTxAndReturnToMabeets(page)
}

async function removeLiquidityFromExistingPositionAndReturn(page: Page) {
  await clickButton(page, 'Remove')
  await expect(page).toHaveURL(new RegExp(`${baseUrl}/mabeets/remove-liquidity/\\d+`))
  await expect(page.getByText('Remove liquidity from maBEETS position')).toBeVisible()

  await clickEnabledNextButton(page)

  const removeLiquidityButton = page.getByRole('button', {
    name: /Remove liquidity from maBEETS position/i,
  })
  await removeLiquidityButton.click()

  await confirmTxAndReturnToMabeets(page)
}

async function docreatePositionTxSteps(page: Page) {
  const modal = page
    .getByRole('dialog')
    .filter({ has: page.getByText(/Create new maBEETS position\s*(?:&|and)\s*add liquidity/i) })
  const createPositionButton = modal.getByRole('button', {
    name: /Create(?: new)? maBEETS position\s*(?:&|and)\s*add liquidity/i,
  })

  const approveOrSignButton = modal.getByRole('button', { name: /(Approve|Sign)/i })

  while (true) {
    await createPositionButton.or(approveOrSignButton).first().waitFor()
    if ((await createPositionButton.isVisible()) && (await createPositionButton.isEnabled())) break
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

  await createPositionButton.click()
}

async function clickEnabledNextButton(page: Page) {
  const nextButton = page.getByRole('button', { name: nextButtonName, exact: true })
  await nextButton.click()
}

async function confirmTxAndReturnToMabeets(page: Page) {
  await expect(page.getByText('Transaction confirmed')).toBeVisible()
  await returnToMabeets(page)
}

async function returnToMabeets(page: Page) {
  const returnToMabeetsButton = page.getByRole('button', { name: returnToMabeetsButtonName })
  await expect(returnToMabeetsButton).toBeVisible()
  await returnToMabeetsButton.click()
  await page.waitForURL(mabeetsUrlPattern, { waitUntil: 'commit' })
  await expect(page.getByText('Your maBEETS Summary')).toBeVisible()
}
