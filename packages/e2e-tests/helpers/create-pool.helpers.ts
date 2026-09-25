import {
  clickButton,
  clickRadio,
  button,
  checkbox,
  selectPopularToken,
} from '@/helpers/user.helpers'
import { expect, Page } from '@playwright/test'
import { POOL_CREATION_FORM_STEPS } from '@repo/lib/modules/pool/actions/create/constants'
import { POOL_TYPES } from '@repo/lib/modules/pool/actions/create/constants'
import { PoolType } from '@balancer/sdk'
import { isPoolCreatorEnabled } from '@repo/lib/modules/pool/actions/create/helpers'
import { SupportedPoolTypes } from '@repo/lib/modules/pool/actions/create/types'

const BASE_URL = 'http://localhost:3000/create'

export type PoolCreationConfig = {
  type: SupportedPoolTypes
  tokens: { symbol: string; amount: string | undefined }[]
}

export const POOL_CREATION_CONFIGS: [PoolCreationConfig, ...PoolCreationConfig[]] = [
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
  // AutoRange pool creation has been temporarily disabled for audit investigations
  // {
  //   type: PoolType.ReClamm,
  //   tokens: [
  //     { symbol: 'WETH', amount: '1' },
  //     { symbol: 'USDC', amount: undefined },
  //   ],
  // },
  {
    type: PoolType.CowAmm,
    tokens: [
      { symbol: 'AAVE', amount: '1' },
      { symbol: 'BAL', amount: '333' },
    ],
  },
]

function stepUrl(index: number, baseUrl = BASE_URL) {
  const step = POOL_CREATION_FORM_STEPS[index]
  if (!step) throw new Error(`Missing pool creation form step at index ${index}`)
  return `${baseUrl}/${step.id}`
}

export class CreatePoolPage {
  get urls() {
    const baseUrl = this.options.baseUrl ?? BASE_URL
    return {
      base: baseUrl,
      type: stepUrl(0, baseUrl),
      tokens: stepUrl(1, baseUrl),
      details: stepUrl(2, baseUrl),
      fund: stepUrl(3, baseUrl),
      buildCow: `${baseUrl}?protocol=cow`,
    }
  }

  constructor(
    private page: Page,
    private config: PoolCreationConfig = POOL_CREATION_CONFIGS[0],
    private readonly options: {
      baseUrl?: string
      networkName?: string
      hasProtocolChoice?: boolean
    } = {},
  ) {}

  get isStable() {
    return this.config.type === PoolType.Stable
  }

  get isStableSurge() {
    return this.config.type === PoolType.StableSurge
  }

  get isWeighted() {
    return this.config.type === PoolType.Weighted
  }

  get isGyroEclp() {
    return this.config.type === PoolType.GyroE
  }

  get isAutoRange() {
    return this.config.type === PoolType.ReClamm
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

  async choosePoolType(poolType: SupportedPoolTypes) {
    await clickRadio(this.page, 'Choose a pool type', POOL_TYPES[poolType].label)
  }

  async fillTokenAmounts() {
    const shouldOnlyFillOneAmount = this.isAutoRange || this.isGyroEclp
    const tokens = shouldOnlyFillOneAmount ? this.config.tokens.slice(0, 1) : this.config.tokens

    for (const [index, token] of tokens.entries()) {
      if (token.amount === undefined) {
        throw new Error(`Missing amount in the pool creation config for Token ${index + 1}`)
      }
      await this.page.getByLabel(`Token ${index + 1}`).fill(token.amount)
    }
  }

  async resetAndConfirm() {
    await this.page.getByRole('button', { name: 'Delete & restart' }).click()
    await this.page.getByRole('button', { name: 'Delete and start over' }).click()
  }

  async expectInitialFormState() {
    await expect(this.page).toHaveURL(this.urls.type)
    if (this.options.hasProtocolChoice ?? true)
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
    for (const token of this.config.tokens) await selectPopularToken(this.page, token.symbol)
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

    if (goToNextStep) {
      await this.clickNextDismissingSimilarPools()
    } else {
      await this.dismissSimilarPoolsWarning()
    }
  }

  async fundStep() {
    await expect(this.page).toHaveURL(this.urls.fund)
    await expect(this.page.getByText('Seed initial pool liquidity')).toBeVisible()
    await expect(button(this.page, 'Create Pool')).toBeDisabled()

    const generalRisksCheckbox = await checkbox(this.page, 'I accept the Risks and Terms')

    if (this.isAutoRange) {
      await generalRisksCheckbox.click()
      await clickButton(this.page, 'Create Pool')
      await clickButton(
        this.page,
        `Deploy pool on ${this.options.networkName ?? 'Ethereum Mainnet'}`,
      )
    }

    await this.fillTokenAmounts()

    if (this.isCowAmm || this.isWeighted) {
      const proportionalRiskCheckbox = await checkbox(this.page, 'I understand that I will')
      await proportionalRiskCheckbox.click()
    }

    if (!this.isAutoRange) await generalRisksCheckbox.click()
  }

  async transactionSteps() {
    if (this.isAutoRange) {
      await clickButton(this.page, 'Initialize Pool')
    } else {
      await clickButton(this.page, 'Create Pool')
      await clickButton(
        this.page,
        `Deploy pool on ${this.options.networkName ?? 'Ethereum Mainnet'}`,
      )
      await expect(this.page.getByText('Pool creation confirmed!')).toBeVisible()
    }

    const signApprovalsButtonText = `Sign approvals: ${this.config.tokens.map(t => t.symbol).join(', ')}`
    for (const [index, token] of this.config.tokens.entries()) {
      if (!this.isCowAmm) {
        const remainingApprovals = this.config.tokens
          .slice(index)
          .map(t => button(this.page, `Approve ${t.symbol}`))
        const nextAction = remainingApprovals.reduce(
          (locator, approval) => locator.or(approval),
          button(this.page, signApprovalsButtonText),
        )
        await expect(nextAction.first()).toBeVisible()
        if (!(await button(this.page, `Approve ${token.symbol}`).isVisible())) continue
      }
      await clickButton(this.page, `Approve ${token.symbol}`)
    }

    if (this.isCowAmm) {
      for (const token of this.config.tokens) {
        await clickButton(this.page, `Add ${token.symbol}`)
      }
      await clickButton(this.page, 'Set Swap Fee')
      await clickButton(this.page, 'Finalize')
    } else {
      await clickButton(this.page, signApprovalsButtonText)
      await clickButton(this.page, 'Seed pool liquidity')
    }

    await expect(button(this.page, 'View pool page')).toBeVisible()
    await expect(button(this.page, 'Create another pool')).toBeVisible()
  }

  async dismissSimilarPoolsWarning() {
    const continueAnyway = button(this.page, 'Continue anyway')

    try {
      await continueAnyway.waitFor({ state: 'visible', timeout: 5000 })
      await continueAnyway.click()
    } catch {
      // No similar pool exists for this configuration, so the warning never opens
    }
  }

  /*
    The similar-pools query resolves after the details step renders, so the warning modal can open
    late and intercept the Next click. Retry the click, dismissing the modal whenever it blocks.
  */
  async clickNextDismissingSimilarPools() {
    const next = button(this.page, 'Next')
    const continueAnyway = button(this.page, 'Continue anyway')

    for (let attempt = 0; attempt < 5; attempt++) {
      if (await continueAnyway.isVisible()) {
        await continueAnyway.click()
        continue
      }

      try {
        await next.click({ timeout: 5000 })
        return
      } catch {
        // The modal intercepted the click; loop and dismiss it
      }
    }

    await next.click()
  }
}
