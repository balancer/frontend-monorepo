import { impersonate } from '@/helpers/e2e.helpers'
import { clickButton, button } from '@/helpers/user.helpers'
import { expect, test, Page } from '@playwright/test'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { oneDayInMs, oneWeekInMs, toISOString } from '@repo/lib/shared/utils/time'
import { LBP_FORM_STEPS } from '@repo/lib/modules/lbp/constants.lbp'

const BASE_URL = 'http://localhost:3000/lbp/create'
const stepUrl = (index: number) => `${BASE_URL}/${LBP_FORM_STEPS[index].id}`

async function setSaleStructure(page: Page) {
  const launchTokenInput = page.getByPlaceholder('Enter token address')
  await launchTokenInput.fill('0xc3d21f79c3120a4ffda7a535f8005a7c297799bf')

  const dateInputs = page.locator('input[type="datetime-local"]')
  await dateInputs.first().fill(toISOString(Date.now() + oneDayInMs).slice(0, 16))
  await dateInputs.last().fill(toISOString(Date.now() + oneWeekInMs).slice(0, 16))

  await page.getByLabel('Sale token').fill('100')
  await page.getByLabel('Collateral token').fill('1')
}

async function setProjectInfo(page: Page) {
  await page.getByLabel('Project name').fill('The Phoenix Project')
  await page
    .getByLabel('Project description')
    .fill('Rises from the ashes every time a developer is hit by a bus')
  await page.getByLabel('Project website URL').fill('https://example.com')
  await page
    .getByLabel('Token icon URL')
    .fill('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')
  await page.getByRole('checkbox').check({ force: true })
}

async function clickResetAndConfirm(page: Page) {
  await page.getByRole('button', { name: 'Delete & restart' }).click()
  await page.getByRole('button', { name: 'Delete and start over' }).click()
}

async function expectStep0Empty(page: Page) {
  await expect(page).toHaveURL(stepUrl(0))
  await expect(page.getByPlaceholder('Enter token address')).toBeEmpty()
}

test.describe('LBP creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
    await impersonate(page, defaultAnvilAccount)
  })

  test('can create an LBP', async ({ page }) => {
    await expect(page).toHaveURL(stepUrl(0))
    await expect(page.getByText('Launch token details')).toBeVisible()
    await expect(page.getByPlaceholder('Enter token address')).toBeEmpty()
    await setSaleStructure(page)
    await expect(page.getByRole('heading', { name: 'Sale period' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Seed initial pool liquidity' })).toBeVisible()
    const nextButton = button(page, 'Next')
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    await expect(page).toHaveURL(stepUrl(1))
    await expect(page.getByRole('heading', { name: 'Project info', level: 2 })).toBeVisible()
    await setProjectInfo(page)
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    await expect(page).toHaveURL(stepUrl(2))
    await clickButton(page, 'Create LBP')
    await clickButton(page, 'Deploy pool on Ethereum Mainnet')
    await clickButton(page, 'Approve WETH')
    await clickButton(page, 'Approve TERM')
    await clickButton(page, 'Sign approvals: WETH, TERM')
    await clickButton(page, 'Seed pool liquidity')

    // API sync fails because pool only exists on fork
    await expect(button(page, 'Retry sync metadata')).toBeVisible()
  })

  test.describe('Reset form', () => {
    test('sale structure step', async ({ page }) => {
      await expect(page).toHaveURL(stepUrl(0))
      await setSaleStructure(page)

      await clickResetAndConfirm(page)
      await expectStep0Empty(page)
    })

    test('project info step', async ({ page }) => {
      await setSaleStructure(page)
      await button(page, 'Next').click()
      await expect(page).toHaveURL(stepUrl(1))

      await setProjectInfo(page)
      await clickResetAndConfirm(page)

      await expectStep0Empty(page)
    })

    test('review step', async ({ page }) => {
      await setSaleStructure(page)
      await button(page, 'Next').click()

      await setProjectInfo(page)
      await button(page, 'Next').click()

      await expect(page).toHaveURL(stepUrl(2))

      await clickResetAndConfirm(page)
      await expectStep0Empty(page)
    })
  })
})
