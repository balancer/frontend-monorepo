import { button, checkbox, clickRadio, clickButton } from '@/helpers/user.helpers'
import { expect, type Page } from '@playwright/test'
import {
  oneDayInMs,
  oneSecondInMs,
  oneWeekInMs,
  unixTimestampToDateTimeLocalString,
} from '@repo/lib/shared/utils/time'
import { LBP_FORM_STEPS } from '@repo/lib/modules/lbp/constants.lbp'

/*
  Beets counterpart of helpers/create-lbp.helpers.ts. Kept as a separate file rather than
  parameterizing the shared one so that changes for Beets cannot alter what the Balancer LBP spec
  drives.

  Sale token is BEETS for all three sale types: it is the only Sonic token that both supports
  EIP-2612 (the seedless path signs `Sign permit: <symbol>`) and is already funded in
  sonicTokenBalances. Collateral is wS because SaleStructureStep restricts it to
  networkConfig.lbps.collateralTokens, which on Sonic is [USSD, wS, stS], and USSD is not funded.
*/
export const BASE_URL = 'http://localhost:3001/lbp/create'
export const stepUrl = (index: number) => {
  const step = LBP_FORM_STEPS[index]
  if (!step) throw new Error(`Missing LBP form step at index ${index}`)
  return `${BASE_URL}/${step.id}`
}

export type BeetsLbpSaleType = 'seedless' | 'seeded' | 'fixed-price'

export type BeetsLbpConfig = {
  saleType: BeetsLbpSaleType
  saleToken: { address: string; symbol: string }
}

const BEETS = {
  address: '0x2d0e0814e62d80056181f5cd932274405966e4f0',
  symbol: 'BEETS',
}

const COLLATERAL_SYMBOL = 'wS'

export const BEETS_LBP_CONFIGS: [BeetsLbpConfig, ...BeetsLbpConfig[]] = [
  { saleType: 'seedless', saleToken: BEETS },
  { saleType: 'seeded', saleToken: BEETS },
  { saleType: 'fixed-price', saleToken: BEETS },
]

/*
  The Beets API URL has no graphql path segment (CI sets it to
  https://backend-v3.beets-ftm-node.com/), so the Balancer helper's graphql-suffix route would never
  match and the CreateLBP mutation would hit the real backend and fail metadata syncing. Match the
  configured API URL instead, keeping the suffix match as a fallback.
*/
export async function mockCreateLbpMetadata(page: Page) {
  const apiUrl = process.env.NEXT_PUBLIC_BALANCER_API_URL?.replace(/\/$/, '')

  await page.route(
    url => url.href.replace(/\/$/, '') === apiUrl || url.pathname.endsWith('/graphql'),
    async route => {
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
    },
  )
}

export async function doSaleStructureStep(
  page: Page,
  {
    lbpConfig = BEETS_LBP_CONFIGS[0],
    continue: shouldContinue = false,
  }: { lbpConfig?: BeetsLbpConfig; continue?: boolean } = {},
) {
  await expect(page).toHaveURL(stepUrl(0))

  await expect(page.getByText('Launch token details')).toBeVisible()

  if (lbpConfig.saleType === 'fixed-price') {
    await page.getByText('Fixed price LBP', { exact: true }).click()
  }

  const launchTokenInput = page.getByPlaceholder('Enter token address')
  await expect(launchTokenInput).toBeEmpty()
  await launchTokenInput.fill(lbpConfig.saleToken.address)

  await expect(page.getByRole('heading', { name: 'Sale period' })).toBeVisible()
  const dateInputs = page.locator('input[type="datetime-local"]')
  await dateInputs
    .first()
    .fill(unixTimestampToDateTimeLocalString((Date.now() + oneDayInMs) / oneSecondInMs))
  await dateInputs
    .last()
    .fill(unixTimestampToDateTimeLocalString((Date.now() + oneWeekInMs) / oneSecondInMs))

  if (lbpConfig.saleType === 'seedless') {
    await expect(
      page.getByRole('heading', { name: 'Sale token amount and virtual collateral balance' }),
    ).toBeVisible()
    await page.getByLabel('Sale token').fill('100')
    await page.getByLabel('Virtual paired token initial balance').fill('1')
  }

  if (lbpConfig.saleType === 'seeded') {
    await clickRadio(page, 'Seed type', 'Yes — seeded LBP')
    await expect(
      page.getByRole('heading', { name: 'Sale token amount and collateral balance' }),
    ).toBeVisible()
    // The form defaults collateral to the first Sonic collateral token (USSD), which the fork does
    // not fund, so pick wS explicitly.
    await selectCollateralToken(page, COLLATERAL_SYMBOL)
    await page.getByLabel('Sale token').fill('100')
    await page.getByLabel('Collateral token').fill('1')
  }

  if (lbpConfig.saleType === 'fixed-price') {
    await selectCollateralToken(page, COLLATERAL_SYMBOL)
    await expect(page.getByRole('heading', { name: 'Sale configuration' })).toBeVisible()
    await page
      .getByLabel(`${lbpConfig.saleToken.symbol} token sale price (against ${COLLATERAL_SYMBOL})`)
      .fill('100')
    await page.getByLabel('How many tokens do you want to sell in this sale?').fill('100')
  }

  const nextButton = button(page, 'Next')
  await expect(nextButton).toBeEnabled()
  if (shouldContinue) await nextButton.click()
}

async function selectCollateralToken(page: Page, symbol: string) {
  await page.locator('#token-select').click()
  await page.locator('[id^="react-select"]').getByText(symbol, { exact: true }).click()
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

export async function doReviewStep(page: Page, { lbpConfig }: { lbpConfig: BeetsLbpConfig }) {
  await expect(page).toHaveURL(stepUrl(2))
  await clickButton(page, 'Create LBP')
  await clickButton(page, 'Deploy pool on Sonic')

  if (lbpConfig.saleType === 'seeded') {
    const collateralApproval = button(page, `Approve ${COLLATERAL_SYMBOL}`)
    const saleTokenApproval = button(page, `Approve ${lbpConfig.saleToken.symbol}`)
    await expect(collateralApproval.or(saleTokenApproval).first()).toBeVisible()
    if (await collateralApproval.isVisible()) await collateralApproval.click()
    await saleTokenApproval.click()
    await clickButton(page, `Sign approvals: ${COLLATERAL_SYMBOL}, ${lbpConfig.saleToken.symbol}`)
  } else {
    await clickButton(page, `Approve ${lbpConfig.saleToken.symbol}`)
    await clickButton(page, `Sign permit: ${lbpConfig.saleToken.symbol}`)
  }

  await clickButton(page, 'Seed pool liquidity')
}
