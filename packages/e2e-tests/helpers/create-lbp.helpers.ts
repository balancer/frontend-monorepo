import { clickButton, button, clickRadio, checkbox } from '@/helpers/user.helpers'
import { expect, type Page } from '@playwright/test'
import { LBP_FORM_STEPS } from '@repo/lib/modules/lbp/constants.lbp'
import { oneDayInMs, oneWeekInMs, toISOString } from '@repo/lib/shared/utils/time'

export type LbpSaleType = 'seedless' | 'seeded' | 'fixed-price'
export type LbpConfig = {
  saleType: LbpSaleType
  saleToken: {
    address: string
    symbol: string
  }
}

export const LBP_CONFIGS: LbpConfig[] = [
  {
    saleType: 'seedless',
    saleToken: {
      address: '0xba100000625a3754423978a60c9317c58a424e3d',
      symbol: 'BAL',
    },
  },
  {
    saleType: 'seeded',
    saleToken: {
      address: '0xc3d21f79c3120a4ffda7a535f8005a7c297799bf',
      symbol: 'TERM',
    },
  },
  // TODO: fixed-price
]

export const BASE_URL = 'http://localhost:3000/lbp/create'
export const stepUrl = (index: number) => `${BASE_URL}/${LBP_FORM_STEPS[index].id}`

export async function mockCreateLbpMetadata(page: Page) {
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
      operationName === 'CreateLBP' || query?.includes('mutation CreateLBP')

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

export async function doSaleStructureStep(
  page: Page,
  {
    lbpConfig = LBP_CONFIGS[0],
    continue: shouldContinue = false,
  }: { lbpConfig?: LbpConfig; continue?: boolean } = {},
) {
  await expect(page).toHaveURL(stepUrl(0))

  await expect(page.getByText('Launch token details')).toBeVisible()
  const launchTokenInput = page.getByPlaceholder('Enter token address')
  await expect(launchTokenInput).toBeEmpty()
  await launchTokenInput.fill(lbpConfig.saleToken.address)

  await expect(page.getByRole('heading', { name: 'Sale period' })).toBeVisible()
  const dateInputs = page.locator('input[type="datetime-local"]')
  await dateInputs.first().fill(toISOString(Date.now() + oneDayInMs).slice(0, 16))
  await dateInputs.last().fill(toISOString(Date.now() + oneWeekInMs).slice(0, 16))

  if (lbpConfig.saleType === 'seedless') {
    await expect(
      page.getByRole('heading', { name: 'Sale token amount and virtual collateral balance' }),
    ).toBeVisible()
    await page.getByLabel('Virtual paired token initial balance').fill('1')
  }

  if (lbpConfig.saleType === 'seeded') {
    await clickRadio(page, 'Seed type', 'Yes — seeded LBP')
    await expect(
      page.getByRole('heading', { name: 'Sale token amount and collateral balance' }),
    ).toBeVisible()
    await page.getByLabel('Collateral token').fill('1')
  }

  await page.getByLabel('Sale token').fill('100')

  const nextButton = button(page, 'Next')
  await expect(nextButton).toBeEnabled()
  if (shouldContinue) await nextButton.click()
}

export async function doProjectInfoStep(page: Page, { continue: shouldContinue = false } = {}) {
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

  const disclaimerCheckbox = await checkbox(
    page,
    'I accept the Risks and Terms of Use for creating an LBP',
  )

  await disclaimerCheckbox.click()

  if (shouldContinue) await nextButton.click()
}

export async function doReviewStep(page: Page, { lbpConfig }: { lbpConfig: LbpConfig }) {
  await expect(page).toHaveURL(stepUrl(2))
  await clickButton(page, 'Create LBP')
  await clickButton(page, 'Deploy pool on Ethereum Mainnet')

  if (lbpConfig.saleType === 'seeded') {
    await clickButton(page, 'Approve WETH')
    await clickButton(page, `Approve ${lbpConfig.saleToken.symbol}`)
    await clickButton(page, `Sign approvals: WETH, ${lbpConfig.saleToken.symbol}`)
  } else if (lbpConfig.saleType === 'seedless') {
    await clickButton(page, `Approve ${lbpConfig.saleToken.symbol}`)
    await clickButton(page, `Sign permit: ${lbpConfig.saleToken.symbol}`)
  }

  await clickButton(page, 'Seed pool liquidity')
}

export async function clickResetAndConfirm(page: Page) {
  await page.getByRole('button', { name: 'Delete & restart' }).click()
  await page.getByRole('button', { name: 'Delete and start over' }).click()
}

export async function expectInitialFormState(page: Page) {
  await expect(page).toHaveURL(stepUrl(0))
  await expect(page.getByPlaceholder('Enter token address')).toBeEmpty()
}
