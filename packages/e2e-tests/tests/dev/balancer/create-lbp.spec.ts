import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, button } from '@/helpers/user.helpers'
import { expect, test } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { oneDayInMs, oneWeekInMs, toISOString } from '@repo/lib/shared/utils/time'
import { LBP_FORM_STEPS } from '@repo/lib/modules/lbp/constants.lbp'

const BASE_URL = 'http://localhost:3000/lbp/create'
const FIRST_STEP_URL = BASE_URL + '/' + LBP_FORM_STEPS[0].id
const SECOND_STEP_URL = BASE_URL + '/' + LBP_FORM_STEPS[1].id
const THIRD_STEP_URL = BASE_URL + '/' + LBP_FORM_STEPS[2].id

test('Create LBP form step navigation', async ({ page }) => {
  await page.goto(`${BASE_URL}`)
  await impersonate(page, defaultAnvilAccount)

  await expect(page).toHaveURL(FIRST_STEP_URL)
  await expect(page.getByText('Launch token details')).toBeVisible()
  const nextButton = button(page, 'Next')
  await expect(nextButton).toBeDisabled()
  const launchTokenInput = page.getByPlaceholder('Enter token address')
  await expect(launchTokenInput).toBeEmpty()
  await launchTokenInput.fill('0xc3d21f79c3120a4ffda7a535f8005a7c297799bf')
  await expect(page.getByRole('heading', { name: 'Sale period' })).toBeVisible()

  const dateInputs = page.locator('input[type="datetime-local"]')
  const startInput = dateInputs.first()
  const endInput = dateInputs.last()
  await startInput.fill(toISOString(Date.now() + oneDayInMs).slice(0, 16))
  await endInput.fill(toISOString(Date.now() + oneWeekInMs).slice(0, 16))
  await expect(page.getByRole('heading', { name: 'Seed initial pool liquidity' })).toBeVisible()
  await page.getByLabel('Sale token').fill('100')
  await page.getByLabel('Collateral token').fill('1')
  await expect(nextButton).toBeEnabled()
  await nextButton.click()

  await expect(page).toHaveURL(SECOND_STEP_URL)
  await expect(page.getByRole('heading', { name: 'Project info', level: 2 })).toBeVisible()
  await page.getByLabel('Project name').fill('The Phoenix Project')
  await page
    .getByLabel('Project description')
    .fill('Rises from the ashes every time a developer is hit by a bus')
  await page.getByLabel('Project website URL').fill('https://example.com')
  await page.getByLabel('Token icon URL').fill('https://avatars.githubusercontent.com/u/0')
  await page.getByRole('checkbox').check({ force: true })
  await expect(nextButton).toBeEnabled()
  await nextButton.click()

  await expect(page).toHaveURL(THIRD_STEP_URL)
  await clickButton(page, 'Create LBP')

  await expect(button(page, 'Deploy pool on Ethereum Mainnet')).toBeVisible()
})
