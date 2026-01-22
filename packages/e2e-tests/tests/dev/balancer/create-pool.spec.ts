import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, button } from '@/helpers/user.helpers'
import { expect, test, Page } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { POOL_CREATION_FORM_STEPS } from '@repo/lib/modules/pool/actions/create/constants'

const BASE_URL = 'http://localhost:3000/create'
const stepUrl = (index: number) => `${BASE_URL}/${POOL_CREATION_FORM_STEPS[index].id}`

async function doTypeStep(page: Page, { continue: shouldContinue = false } = {}) {
  await expect(page).toHaveURL(stepUrl(0))
  await expect(page.getByText('Choose protocol')).toBeVisible()
  await expect(page.getByText('Choose network')).toBeVisible()

  if (shouldContinue) await clickButton(page, 'Next')
}

async function doTokenStep(page: Page, { continue: shouldContinue = false } = {}) {
  await expect(page).toHaveURL(stepUrl(1))
  await expect(page.getByText('Choose pool tokens')).toBeVisible()
  const step2NextButton = button(page, 'Next')
  await expect(step2NextButton).toBeDisabled()
  await button(page, 'Select token').first().click()
  await page.getByText('Wrapped liquid staked Ether 2.0', { exact: true }).click()
  await button(page, 'Select token').first().click()
  await page.getByText('Aave Token', { exact: true }).click()
  await expect(step2NextButton).toBeEnabled()

  if (shouldContinue) await clickButton(page, 'Next')
}

async function doDetailsStep(page: Page, { continue: shouldContinue = false } = {}) {
  await expect(page).toHaveURL(stepUrl(2))
  await expect(page.getByText('Pool details')).toBeVisible()
  await expect(page.getByText('Pool settings')).toBeVisible()

  if (shouldContinue) await clickButton(page, 'Next')
}

async function doTransactionSteps(page: Page) {
  await clickButton(page, 'Create Pool')
  await clickButton(page, 'Deploy pool on Ethereum Mainnet')
  await clickButton(page, 'Approve wstETH')
  await clickButton(page, 'Approve AAVE')
  await clickButton(page, 'Sign approvals: wstETH, AAVE')
  await clickButton(page, 'Seed pool liquidity')
  await expect(button(page, 'View pool page')).toBeVisible()
  await expect(button(page, 'Create another pool')).toBeVisible()
}

async function doFundStep(page: Page) {
  await expect(page).toHaveURL(stepUrl(3))
  await expect(page.getByText('Seed initial pool liquidity')).toBeVisible()
  await expect(button(page, 'Create Pool')).toBeDisabled()

  await page.getByLabel('Token 1').fill('10')
  await page.getByLabel('Token 2').fill('188')
  await page.getByRole('checkbox').check({ force: true })
}

async function clickResetAndConfirm(page: Page) {
  await page.getByRole('button', { name: 'Delete & restart' }).click()
  await page.getByRole('button', { name: 'Delete and start over' }).click()
}

async function expectInitialFormState(page: Page) {
  await doTypeStep(page)
}

test.describe('Create pool page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}`)
    await impersonate(page, defaultAnvilAccount)
  })

  test('can complete all steps', async ({ page }) => {
    await doTypeStep(page, { continue: true })
    await doTokenStep(page, { continue: true })
    await doDetailsStep(page, { continue: true })
    await doFundStep(page)
    await doTransactionSteps(page)
  })

  test.describe('Form reset', () => {
    test('pool type step', async ({ page }) => {
      await page.getByText('Plasma').click()
      await page.getByText('Weighted', { exact: true }).click()
      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })

    test('token step', async ({ page }) => {
      await doTypeStep(page, { continue: true })
      await doTokenStep(page)
      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })

    test('details step', async ({ page }) => {
      await doTypeStep(page, { continue: true })
      await doTokenStep(page, { continue: true })
      await doDetailsStep(page)
      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })

    test('fund step', async ({ page }) => {
      await doTypeStep(page, { continue: true })
      await doTokenStep(page, { continue: true })
      await doDetailsStep(page, { continue: true })
      await doFundStep(page)
      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })
  })

  test.describe('Build popover', () => {
    test('Sets form state for protocol', async ({ page }) => {
      const buildLink = page.getByText('Build', { exact: true })
      await expect(buildLink).toBeVisible()
      await buildLink.click()

      await page.getByText('CoW AMM', { exact: true }).click()
      await expect(page).toHaveURL(`${BASE_URL}?protocol=cow`)
      await expect(page.getByText('CoW AMM: 50/50')).toBeVisible()
    })

    test.describe('Progress warning modal', () => {
      test.beforeEach(async ({ page }) => {
        await clickButton(page, 'Next')
        await expect(page).toHaveURL(stepUrl(1))

        const buildLink = page.getByText('Build', { exact: true })
        await expect(buildLink).toBeVisible()
        await buildLink.click()

        await page.getByText('CoW AMM', { exact: true }).click()
        await expect(page).toHaveURL(`${BASE_URL}?protocol=cow`)
        await expect(page.getByText('Delete progress and start over')).toBeVisible()
      })

      test('can continue progress', async ({ page }) => {
        await clickButton(page, 'Continue set up')
        // await expect(page).toHaveURL(stepUrl(1)) // fix me in useFormSteps hook
        await expect(page.getByText('Choose pool tokens')).toBeVisible()
      })

      test('can reset progress', async ({ page }) => {
        await clickButton(page, 'Delete and start over')
        await expect(page).toHaveURL(stepUrl(0))
        await expect(page.getByText('Choose protocol')).toBeVisible()
      })
    })
  })
})
