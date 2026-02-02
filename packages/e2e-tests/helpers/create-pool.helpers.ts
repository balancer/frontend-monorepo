import { clickButton, clickRadio, button, checkbox } from '@/helpers/user.helpers'
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
      { symbol: 'USDC', amount: '1' },
      { symbol: 'GHO', amount: undefined },
    ],
  },
  {
    type: PoolType.ReClamm,
    tokens: [
      { symbol: 'WETH', amount: '1' },
      { symbol: 'USDC', amount: undefined },
    ],
  },
  {
    type: PoolType.CowAmm,
    tokens: [
      { symbol: 'AAVE', amount: '1' },
      { symbol: 'BAL', amount: '333' },
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
    buildCow: `${BASE_URL}?protocol=cow`,
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

  get isCowAmm() {
    return this.config.type === PoolType.CowAmm
  }

  async goToPage() {
    await this.page.goto(this.urls.base)
  }

  async clickBuildPopoverToCowAmm() {
    await this.page.getByText('Build', { exact: true }).click()
    await this.page.getByText('CoW AMM', { exact: true }).click()
    await expect(this.page).toHaveURL(this.urls.buildCow)
  }

  async chooseProtocol(protocol: string) {
    await this.page.getByText(protocol, { exact: true }).click()
  }

  async chooseNetwork(network: string) {
    await this.page.getByText(network).click()
  }

  async choosePoolType(poolType: PoolType) {
    await clickRadio(this.page, 'Choose a pool type', POOL_TYPES[poolType].label)
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

  async resetAndConfirm() {
    await this.page.getByRole('button', { name: 'Delete & restart' }).click()
    await this.page.getByRole('button', { name: 'Delete and start over' }).click()
  }

  async expectInitialFormState() {
    await expect(this.page).toHaveURL(this.urls.type)
    await expect(this.page.getByText('Choose protocol')).toBeVisible()
    await expect(this.page.getByText('Choose network')).toBeVisible()
    await expect(this.page.getByText('Choose a pool type')).toBeVisible()
  }

  async typeStep(goToNextStep?: boolean) {
    await this.expectInitialFormState()
    if (this.isCowAmm) await this.chooseProtocol('CoW')
    await this.choosePoolType(this.config.type)
    if (goToNextStep) await clickButton(this.page, 'Next')
  }

  async tokensStep(goToNextStep?: boolean) {
    await expect(this.page).toHaveURL(this.urls.tokens)
    await expect(this.page.getByText('Choose pool tokens')).toBeVisible()
    await expect(button(this.page, 'Next')).toBeDisabled()
    for (const token of this.config.tokens) await this.selectToken(token.symbol)
    await expect(button(this.page, 'Next')).toBeEnabled()
    if (goToNextStep) await clickButton(this.page, 'Next')
  }

  async detailsStep(goToNextStep?: boolean) {
    await expect(this.page).toHaveURL(this.urls.details)
    await expect(this.page.getByText('Pool details')).toBeVisible()

    if (!this.isCowAmm) await expect(this.page.getByText('Pool settings')).toBeVisible()

    if (isPoolCreatorEnabled(this.config.type)) {
      await clickRadio(this.page, 'Pool creator', 'My connected wallet:', false)
    }

    if (goToNextStep) await clickButton(this.page, 'Next')
  }

  async fundStep() {
    await expect(this.page).toHaveURL(this.urls.fund)
    await expect(this.page.getByText('Seed initial pool liquidity')).toBeVisible()
    await expect(button(this.page, 'Create Pool')).toBeDisabled()

    const generalRisksCheckbox = await checkbox(this.page, 'I accept the Risks and Terms')

    if (this.isReClamm) {
      await generalRisksCheckbox.click()
      await clickButton(this.page, 'Create Pool')
      await clickButton(this.page, 'Deploy pool on Ethereum Mainnet')
    }

    await this.fillTokenAmounts()

    if (this.isCowAmm || this.isWeighted) {
      const proportionalRiskCheckbox = await checkbox(this.page, 'I understand that I will')
      await proportionalRiskCheckbox.click()
    }

    if (!this.isReClamm) await generalRisksCheckbox.click()
  }

  async transactionSteps() {
    if (this.isReClamm) {
      await clickButton(this.page, 'Initialize Pool')
    } else {
      await clickButton(this.page, 'Create Pool')
      await clickButton(this.page, 'Deploy pool on Ethereum Mainnet')
      await expect(this.page.getByText('Pool creation confirmed!')).toBeVisible()
    }

    const signApprovalsButtonText = `Sign approvals: ${this.config.tokens.map(t => t.symbol).join(', ')}`
    const signApprovalsButton = button(this.page, signApprovalsButtonText)

    // after first pool creation test runs, some tokens may have already been approved
    for (const token of this.config.tokens) {
      const approveButton = button(this.page, `Approve ${token.symbol}`)
      await approveButton.or(signApprovalsButton).waitFor()

      if (await approveButton.isVisible()) await approveButton.click()
    }

    if (this.isCowAmm) {
      for (const token of this.config.tokens) {
        await clickButton(this.page, `Add ${token.symbol}`)
      }
      await clickButton(this.page, 'Set Swap Fee')
      await clickButton(this.page, 'Finalize')
    } else {
      await signApprovalsButton.click()
      await clickButton(this.page, 'Seed pool liquidity')
    }

    await expect(button(this.page, 'View pool page')).toBeVisible()
    await expect(button(this.page, 'Create another pool')).toBeVisible()
  }
}
