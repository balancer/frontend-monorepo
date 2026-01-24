import { clickButton, button } from '@/helpers/user.helpers'
import { expect, Page } from '@playwright/test'
import { POOL_CREATION_FORM_STEPS } from '@repo/lib/modules/pool/actions/create/constants'

const BASE_URL = 'http://localhost:3000/create'

export class CreatePoolPage {
  readonly urls = {
    base: BASE_URL,
    type: `${BASE_URL}/${POOL_CREATION_FORM_STEPS[0].id}`,
    tokens: `${BASE_URL}/${POOL_CREATION_FORM_STEPS[1].id}`,
    details: `${BASE_URL}/${POOL_CREATION_FORM_STEPS[2].id}`,
    fund: `${BASE_URL}/${POOL_CREATION_FORM_STEPS[3].id}`,
  }

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(this.urls.base)
  }

  async typeStep({ continue: shouldContinue = false } = {}) {
    await expect(this.page).toHaveURL(this.urls.type)
    await expect(this.page.getByText('Choose protocol')).toBeVisible()
    await expect(this.page.getByText('Choose network')).toBeVisible()

    if (shouldContinue) await clickButton(this.page, 'Next')
  }

  async selectToken(tokenName: string) {
    await button(this.page, 'Select token').first().click()
    await this.page.getByTitle(tokenName).click()
  }

  async tokensStep({ continue: shouldContinue = false } = {}) {
    await expect(this.page).toHaveURL(this.urls.tokens)
    await expect(this.page.getByText('Choose pool tokens')).toBeVisible()

    await expect(button(this.page, 'Next')).toBeDisabled()
    await this.selectToken('Wrapped liquid staked Ether 2.0')
    await this.selectToken('Aave Token')
    await expect(button(this.page, 'Next')).toBeEnabled()

    if (shouldContinue) await clickButton(this.page, 'Next')
  }

  async detailsStep({ continue: shouldContinue = false } = {}) {
    await expect(this.page).toHaveURL(this.urls.details)
    await expect(this.page.getByText('Pool details')).toBeVisible()
    await expect(this.page.getByText('Pool settings')).toBeVisible()

    if (shouldContinue) await clickButton(this.page, 'Next')
  }

  async fundStep() {
    await expect(this.page).toHaveURL(this.urls.fund)
    await expect(this.page.getByText('Seed initial pool liquidity')).toBeVisible()
    await expect(button(this.page, 'Create Pool')).toBeDisabled()

    await this.page.getByLabel('Token 1').fill('10')
    await this.page.getByLabel('Token 2').fill('188')
    await this.page.getByRole('checkbox').check({ force: true })
  }

  async transactionSteps() {
    await clickButton(this.page, 'Create Pool')
    await clickButton(this.page, 'Deploy pool on Ethereum Mainnet')
    await clickButton(this.page, 'Approve wstETH')
    await clickButton(this.page, 'Approve AAVE')
    await clickButton(this.page, 'Sign approvals: wstETH, AAVE')
    await clickButton(this.page, 'Seed pool liquidity')
    await expect(button(this.page, 'View pool page')).toBeVisible()
    await expect(button(this.page, 'Create another pool')).toBeVisible()
  }

  async resetAndConfirm() {
    await this.page.getByRole('button', { name: 'Delete & restart' }).click()
    await this.page.getByRole('button', { name: 'Delete and start over' }).click()
  }

  async expectInitialFormState() {
    await this.typeStep()
  }
}
