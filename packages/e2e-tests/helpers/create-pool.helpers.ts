import { clickButton, button } from '@/helpers/user.helpers'
import { expect, Page } from '@playwright/test'
import { POOL_CREATION_FORM_STEPS } from '@repo/lib/modules/pool/actions/create/constants'

const BASE_URL = 'http://localhost:3000/create'

export type PoolCreationConfig = {
  type: string
  tokens: { symbol: string; amount: string | undefined }[]
}

export const POOL_CREATION_CONFIGS: PoolCreationConfig[] = [
  {
    type: 'Stable',
    tokens: [
      { symbol: 'USDC', amount: '10' },
      { symbol: 'GHO', amount: '10' },
    ],
  },
  {
    type: 'Weighted',
    tokens: [
      { symbol: 'AAVE', amount: '1' },
      { symbol: 'BAL', amount: '333' },
    ],
  },
  {
    type: 'Gyro Elliptic CLP',
    tokens: [
      { symbol: 'WETH', amount: '1' },
      { symbol: 'wstETH', amount: undefined },
    ],
  },
]

export class CreatePoolPage {
  readonly urls = {
    base: BASE_URL,
    type: `${BASE_URL}/${POOL_CREATION_FORM_STEPS[0].id}`,
    tokens: `${BASE_URL}/${POOL_CREATION_FORM_STEPS[1].id}`,
    details: `${BASE_URL}/${POOL_CREATION_FORM_STEPS[2].id}`,
    fund: `${BASE_URL}/${POOL_CREATION_FORM_STEPS[3].id}`,
  }

  constructor(
    private page: Page,
    private config: PoolCreationConfig = POOL_CREATION_CONFIGS[0],
  ) {}

  async goToPage() {
    await this.page.goto(this.urls.base)
  }

  async typeStep({ continue: shouldContinue = false } = {}) {
    await expect(this.page).toHaveURL(this.urls.type)
    await expect(this.page.getByText('Choose protocol')).toBeVisible()
    await expect(this.page.getByText('Choose network')).toBeVisible()
    await expect(this.page.getByText('Choose a pool type')).toBeVisible()

    await this.page.getByLabel(this.config.type, { exact: true }).click({ force: true })

    if (shouldContinue) await clickButton(this.page, 'Next')
  }

  async selectToken(tokenName: string) {
    await button(this.page, 'Select token').first().click()
    const modalHeader = this.page.getByText('Select a token: Ethereum', { exact: true })
    await modalHeader.waitFor({ state: 'visible' })
    const modal = this.page.getByRole('dialog').filter({ has: modalHeader })
    await modal
      .getByRole('group')
      .filter({ has: this.page.getByText(tokenName, { exact: true }) })
      .first()
      .click()
  }

  async tokensStep({ continue: shouldContinue = false } = {}) {
    await expect(this.page).toHaveURL(this.urls.tokens)
    await expect(this.page.getByText('Choose pool tokens')).toBeVisible()

    await expect(button(this.page, 'Next')).toBeDisabled()
    for (const token of this.config.tokens) {
      await this.selectToken(token.symbol)
    }
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

    for (let i = 0; i < this.config.tokens.length; i++) {
      const tokenAmount = this.config.tokens[i].amount
      if (tokenAmount) {
        await this.page.getByLabel(`Token ${i + 1}`).fill(tokenAmount)
      }
    }

    if (this.config.type === 'Weighted') {
      await this.page
        .getByRole('checkbox', { name: 'I understand that I will' })
        .check({ force: true })
    }

    await this.page
      .getByRole('checkbox', { name: 'I accept the Risks and Terms' })
      .check({ force: true })
  }

  async transactionSteps() {
    await clickButton(this.page, 'Create Pool')
    await clickButton(this.page, 'Deploy pool on Ethereum Mainnet')
    for (const token of this.config.tokens) {
      await clickButton(this.page, `Approve ${token.symbol}`)
      await expect(this.page.getByText(`${token.symbol} approved!`)).toBeVisible()
    }
    await clickButton(
      this.page,
      `Sign approvals: ${this.config.tokens.map(t => t.symbol).join(', ')}`,
    )
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
