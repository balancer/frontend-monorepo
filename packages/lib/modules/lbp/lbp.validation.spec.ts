import { addDays, format } from 'date-fns'
import { GqlChainValues, GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { saleStructureStepSchema } from './lbp.validation'
import { UserActions, WeightAdjustmentType } from './lbp.types'

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890'

function futureDateTime(daysFromNow: number) {
  return format(addDays(new Date(), daysFromNow), "yyyy-MM-dd'T'HH:mm")
}

function validSaleStructure(overrides = {}) {
  return {
    selectedChain: GqlChainValues.Mainnet,
    launchTokenAddress: VALID_ADDRESS,
    saleType: GqlPoolTypeValues.LiquidityBootstrapping,
    startDateTime: futureDateTime(2),
    endDateTime: futureDateTime(4),
    collateralTokenAddress: VALID_ADDRESS,
    weightAdjustmentType: WeightAdjustmentType.LINEAR_90_10,
    customStartWeight: 90,
    customEndWeight: 10,
    userActions: UserActions.BUY_AND_SELL,
    fee: 1,
    launchTokenRate: '',
    saleTokenAmount: '100',
    collateralTokenAmount: '20',
    ...overrides,
  }
}

function issuesByPath(input: unknown) {
  const result = saleStructureStepSchema.safeParse(input)
  if (result.success) return {}

  return Object.fromEntries(result.error.issues.map(issue => [issue.path.join('.'), issue.message]))
}

describe('saleStructureStepSchema', () => {
  it('accepts a valid dynamic LBP sale structure', () => {
    expect(saleStructureStepSchema.safeParse(validSaleStructure()).success).toBe(true)
  })

  it('requires collateral token amount for dynamic LBPs', () => {
    expect(issuesByPath(validSaleStructure({ collateralTokenAmount: '' }))).toMatchObject({
      collateralTokenAmount: 'Collateral token amount is required',
    })
  })

  it('requires custom weights between 1 and 99 for dynamic custom weight LBPs', () => {
    expect(
      issuesByPath(
        validSaleStructure({
          weightAdjustmentType: WeightAdjustmentType.CUSTOM,
          customStartWeight: 100,
          customEndWeight: 0,
        })
      )
    ).toMatchObject({
      customStartWeight: 'Starting weight must be between 1 and 99',
      customEndWeight: 'Ending weight must be between 1 and 99',
    })
  })

  it('requires token sale price for fixed price LBPs instead of collateral token amount', () => {
    expect(
      issuesByPath(
        validSaleStructure({
          saleType: GqlPoolTypeValues.FixedLbp,
          collateralTokenAmount: '',
          launchTokenRate: '',
        })
      )
    ).toMatchObject({
      launchTokenRate: 'Token sale price is required',
    })
  })

  it('requires end time to be at least 24 hours after start time', () => {
    expect(
      issuesByPath(
        validSaleStructure({
          startDateTime: futureDateTime(2),
          endDateTime: futureDateTime(3),
        })
      )
    ).toMatchObject({
      endDateTime: 'End time must be at least 24 hours after start time',
    })
  })

  it('enforces LBP swap fee bounds', () => {
    expect(issuesByPath(validSaleStructure({ fee: 0.5 }))).toMatchObject({
      fee: 'LBP swap fees must be set at or above 1.00% and at or below 10.00%',
    })

    expect(issuesByPath(validSaleStructure({ fee: 10.1 }))).toMatchObject({
      fee: 'LBP swap fees must be set at or above 1.00% and at or below 10.00%',
    })
  })
})
