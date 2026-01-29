import { clickButton, button } from '@/helpers/user.helpers'
import { expect, Page } from '@playwright/test'
import { POOL_CREATION_FORM_STEPS } from '@repo/lib/modules/pool/actions/create/constants'
import { POOL_TYPES } from '@repo/lib/modules/pool/actions/create/constants'
import { PoolType } from '@balancer/sdk'
import { isPoolCreatorEnabled } from '@repo/lib/modules/pool/actions/create/helpers'

const BASE_URL = 'http://localhost:3000/create'

export type PoolCreationConfig = {
  type: PoolType
  tokens: { symbol: string; amount: string | undefined }[]
}

export const POOL_CREATION_CONFIGS: PoolCreationConfig[] = [
  {
    type: PoolType.Stable,
    tokens: [
      { symbol: 'USDC', amount: '10' },
      { symbol: 'GHO', amount: '10' },
    ],
  },
  {
    type: PoolType.StableSurge,
    tokens: [
      { symbol: 'USDC', amount: '10' },
      { symbol: 'GHO', amount: '10' },
    ],
  },
  {
    type: PoolType.Weighted,
    tokens: [
      { symbol: 'AAVE', amount: '1' },
      { symbol: 'BAL', amount: '333' },
    ],
  },
  {
    type: PoolType.GyroE,
    tokens: [
      { symbol: 'wstETH', amount: '1' },
      { symbol: 'fwstETH', amount: undefined },
    ],
  },
  {
    type: PoolType.ReClamm,
    tokens: [
      { symbol: 'WETH', amount: '1' },
      { symbol: 'USDC', amount: undefined },
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

  get isReClamm() {
    return this.config.type === PoolType.ReClamm
  }

  get isGyroEclp() {
    return this.config.type === PoolType.GyroE
  }

  get isWeighted() {
    return this.config.type === PoolType.Weighted
  }

  async goToPage() {
    await this.page.goto(this.urls.base)
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

  async fillTokenAmounts() {
    const shouldOnlyFillOneAmount = this.isReClamm || this.isGyroEclp

    if (shouldOnlyFillOneAmount) {
      await this.page.getByLabel('Token 1').fill(this.config.tokens[0].amount)
    } else {
      for (let i = 0; i < this.config.tokens.length; i++) {
        const tokenAmount = this.config.tokens[i].amount
        await this.page.getByLabel(`Token ${i + 1}`).fill(tokenAmount)
      }
    }
  }

  async typeStep({ continue: shouldContinue = false } = {}) {
    await expect(this.page).toHaveURL(this.urls.type)
    await expect(this.page.getByText('Choose protocol')).toBeVisible()
    await expect(this.page.getByText('Choose network')).toBeVisible()
    await expect(this.page.getByText('Choose a pool type')).toBeVisible()

    await this.page
      .getByRole('radiogroup', { name: 'Choose a pool type' })
      .getByText(POOL_TYPES[this.config.type].label, { exact: true })
      .click()

    if (shouldContinue) await clickButton(this.page, 'Next')
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

    if (isPoolCreatorEnabled(this.config.type)) {
      await this.page
        .getByRole('radiogroup', { name: 'Pool creator' })
        .getByText('My connected wallet:', { exact: false })
        .click()
    }

    if (shouldContinue) await clickButton(this.page, 'Next')
  }

  async fundStep() {
    await expect(this.page).toHaveURL(this.urls.fund)
    await expect(this.page.getByText('Seed initial pool liquidity')).toBeVisible()
    await expect(button(this.page, 'Create Pool')).toBeDisabled()

    const acceptRisksCheckbox = this.page
      .locator('label')
      .filter({ hasText: 'I accept the Risks and Terms' })
      .locator('.chakra-checkbox__control')

    if (this.isReClamm) {
      await acceptRisksCheckbox.click()
      await clickButton(this.page, 'Create Pool')
      await clickButton(this.page, 'Deploy pool on Ethereum Mainnet')
    }

    await this.fillTokenAmounts()

    if (this.isWeighted) {
      await this.page
        .locator('label')
        .filter({ hasText: 'I understand that I will' })
        .locator('.chakra-checkbox__control')
        .click()
    }

    if (!this.isReClamm) await acceptRisksCheckbox.click()
  }

  async transactionSteps() {
    if (this.isReClamm) {
      await clickButton(this.page, 'Initialize Pool')
    } else {
      await clickButton(this.page, 'Create Pool')
      await clickButton(this.page, 'Deploy pool on Ethereum Mainnet')
    }

    const signApprovalsButtonText = `Sign approvals: ${this.config.tokens.map(t => t.symbol).join(', ')}`
    const signApprovalsButton = button(this.page, signApprovalsButtonText)
    const firstApproveButton = button(this.page, `Approve ${this.config.tokens[0].symbol}`)

    // after first pool creation test runs, some tokens may have already been approved
    await firstApproveButton.or(signApprovalsButton).waitFor()

    for (const token of this.config.tokens) {
      const approveButton = button(this.page, `Approve ${token.symbol}`)
      if (await approveButton.isVisible()) {
        await approveButton.click()
        await expect(this.page.getByText(`${token.symbol} approved!`)).toBeVisible()
      }
    }

    await signApprovalsButton.click()
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
