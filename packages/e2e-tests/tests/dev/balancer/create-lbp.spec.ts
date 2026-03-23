import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, button, clickRadio } from '@/helpers/user.helpers'
import { expect, test, type Page } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { oneDayInMs, oneWeekInMs, toISOString } from '@repo/lib/shared/utils/time'
import { LBP_FORM_STEPS } from '@repo/lib/modules/lbp/constants.lbp'

const BASE_URL = 'http://localhost:3000/lbp/create'
const stepUrl = (index: number) => `${BASE_URL}/${LBP_FORM_STEPS[index].id}`

async function mockCreateLbpMetadata(page: Page) {
  await page.route('**/graphql', async route => {
    const request = route.request()
    if (request.method() !== 'POST') {
      await route.continue()
      return
    }

    const payload = request.postDataJSON?.()
    const operationName = payload?.operationName as string | undefined
    const query = payload?.query as string | undefined
    const isCreateLbpMutation =
      operationName === 'CreateLBP' || query?.includes('mutation CreateLBP') || false

    if (!isCreateLbpMutation) {
      await route.continue()
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { createLBP: true } }),
    })
  })
}

async function doSaleStructureStep(page: Page, { continue: shouldContinue = false } = {}) {
  await expect(page).toHaveURL(stepUrl(0))

  await expect(page.getByText('Launch token details')).toBeVisible()
  const launchTokenInput = page.getByPlaceholder('Enter token address')
  await expect(launchTokenInput).toBeEmpty()
  await launchTokenInput.fill('0xc3d21f79c3120a4ffda7a535f8005a7c297799bf')

  await expect(page.getByRole('heading', { name: 'Sale period' })).toBeVisible()
  const dateInputs = page.locator('input[type="datetime-local"]')
  await dateInputs.first().fill(toISOString(Date.now() + oneDayInMs).slice(0, 16))
  await dateInputs.last().fill(toISOString(Date.now() + oneWeekInMs).slice(0, 16))

  await clickRadio(page, 'Seed type', 'Yes — seeded LBP')

  await expect(
    page.getByRole('heading', { name: 'Sale token amount and collateral balance' }),
  ).toBeVisible()

  const nextButton = button(page, 'Next')

  await page.getByLabel('Sale token').fill('100')
  await page.getByLabel('Collateral token').fill('1')
  await expect(nextButton).toBeEnabled()

  if (shouldContinue) await nextButton.click()
}

async function doProjectInfoStep(page: Page, { continue: shouldContinue = false } = {}) {
  await expect(page).toHaveURL(stepUrl(1))

  const nextButton = button(page, 'Next')

  await page.getByLabel('Project name').fill('The Phoenix Project')
  await page
    .getByLabel('Project description')
    .fill('Rises from the ashes every time a developer is hit by a bus')
  await page.getByLabel('Project website URL').fill('https://example.com')
  await page
    .getByLabel('Token icon URL')
    .fill('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')

  await page.getByRole('checkbox').check({ force: true })

  if (shouldContinue) await nextButton.click()
}

async function doReviewStep(page: Page) {
  await expect(page).toHaveURL(stepUrl(2))
  await clickButton(page, 'Create LBP')
  await clickButton(page, 'Deploy pool on Ethereum Mainnet')
  await clickButton(page, 'Approve WETH')
  await clickButton(page, 'Approve TERM')
  await clickButton(page, 'Sign approvals: WETH, TERM')
  await clickButton(page, 'Seed pool liquidity')
}

async function clickResetAndConfirm(page: Page) {
  await page.getByRole('button', { name: 'Delete & restart' }).click()
  await page.getByRole('button', { name: 'Delete and start over' }).click()
}

async function expectInitialFormState(page: Page) {
  await expect(page).toHaveURL(stepUrl(0))
  await expect(page.getByPlaceholder('Enter token address')).toBeEmpty()
}

test.describe('Create LBP page', () => {
  test.beforeEach(async ({ page }) => {
    await mockCreateLbpMetadata(page)
    await page.goto(BASE_URL)
    await impersonate(page, defaultAnvilAccount)
  })

  test('can complete all steps', async ({ page }) => {
    await doSaleStructureStep(page, { continue: true })
    await doProjectInfoStep(page, { continue: true })
    await doReviewStep(page)
  })

  test('shows validation errors when required fields are missing', async ({ page }) => {
    await expect(page).toHaveURL(stepUrl(0))

    await clickButton(page, 'Next')

    await expect(page.getByText('Token address is required')).toBeVisible()
    await expect(page.getByText('Start date and time is required')).toBeVisible()
    await expect(page.getByText('End date and time is required')).toBeVisible()
    await expect(page.getByText('Sale token amount is required')).toBeVisible()
    await expect(page.getByText('Collateral token amount is required')).toBeVisible()
    await expect(page).toHaveURL(stepUrl(0))
  })

  test('blocks sale period shorter than 24 hours', async ({ page }) => {
    await doSaleStructureStep(page)

    const dateInputs = page.locator('input[type="datetime-local"]')
    const invalidEndTime = toISOString(Date.now() + oneDayInMs + 60 * 60 * 1000).slice(0, 16)
    await dateInputs.last().fill(invalidEndTime)

    await clickButton(page, 'Next')

    await expect(
      page.getByText('End time must be at least 24 hours after start time'),
    ).toBeVisible()
    await expect(page).toHaveURL(stepUrl(0))
  })

  test.describe('Form reset', () => {
    test('sale structure step', async ({ page }) => {
      await doSaleStructureStep(page)
      await clickButton(page, 'Next')

      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })

    test('project info step', async ({ page }) => {
      await doSaleStructureStep(page, { continue: true })
      await doProjectInfoStep(page)

      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })

    test('review step', async ({ page }) => {
      await doSaleStructureStep(page, { continue: true })
      await doProjectInfoStep(page, { continue: true })

      await expect(page).toHaveURL(stepUrl(2))
      await clickResetAndConfirm(page)
      await expectInitialFormState(page)
    })
  })
})
