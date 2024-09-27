import { testHook } from '@/test/utils/custom-renderers'
import { bn, fNum } from '../utils/numbers'
import { useAprTooltip } from './useAprTooltip'
import { aprTooltipDataMock } from './_mocks_/aprTooltipDataMock'
import BigNumber from 'bignumber.js'
import { GqlPoolAprItem, GqlPoolAprItemType } from '../services/api/generated/graphql'

const defaultNumberFormatter = (value: string) => bn(bn(value).toFixed(4, BigNumber.ROUND_HALF_UP))

function testUseAprTooltip({ aprItems }: { aprItems: GqlPoolAprItem[] }) {
  const { result } = testHook(() =>
    useAprTooltip({ aprItems, numberFormatter: defaultNumberFormatter })
  )
  return result
}

describe('useAprTooltip', () => {
  test('formats APRs with default formatter', () => {
    const result = testUseAprTooltip({ aprItems: aprTooltipDataMock.aprItems })

    expect(result.current.swapFeesDisplayed.toFixed()).toBe('0.0007')
    expect(fNum('apr', result.current.swapFeesDisplayed)).toBe('0.07%')

    const stakingIncentivesApr = result.current.stakingIncentivesDisplayed[0].apr
    expect(stakingIncentivesApr.toFixed()).toBe('0.0191')
    expect(fNum('apr', stakingIncentivesApr)).toBe('1.91%')

    const yieldBearingTokensApr = result.current.yieldBearingTokensDisplayed[0].apr
    expect(yieldBearingTokensApr.toFixed()).toBe('0.0068')
    expect(fNum('apr', yieldBearingTokensApr)).toBe('0.68%')

    const totalBaseDisplayed = result.current.totalBaseDisplayed
    expect(totalBaseDisplayed.toFixed()).toBe('0.0266')
    expect(fNum('apr', totalBaseDisplayed)).toBe('2.66%') // 0.07 + 1.91 + 0.68 = 2.66

    const extraBalApr = result.current.extraBalAprDisplayed
    expect(extraBalApr.toFixed()).toBe('0.0225')
    expect(fNum('apr', extraBalApr)).toBe('2.25%')

    const maxVeBalApr = result.current.maxVeBalDisplayed
    expect(maxVeBalApr.toFixed()).toBe('0.0491')
    expect(fNum('apr', maxVeBalApr)).toBe('4.91%')
  })
})

it('When the pool has BAL staking incentives (outside the veBAL system)', () => {
  const aprItems: GqlPoolAprItem[] = [
    {
      __typename: 'GqlPoolAprItem',
      id: '0xf08d4dea369c456d26a3168ff0024b904f2d8b91-swap-apr',
      title: 'Swap fees APR',
      type: GqlPoolAprItemType.SwapFee,
      apr: 0.01557208351741454,
    },
    {
      __typename: 'GqlPoolAprItem',
      id: '0xf08d4dea369c456d26a3168ff0024b904f2d8b91-surplus',
      title: 'Surplus APR',
      type: GqlPoolAprItemType.Surplus,
      apr: 0.05520228189828037,
    },
    // BAL incentives that are outside of the veBAL system
    {
      __typename: 'GqlPoolAprItem',
      id: '0xf9423b78d784d610a00955e733dba0bf9bda7b06-BAL-apr',
      title: 'BAL reward APR',
      type: GqlPoolAprItemType.Staking,
      apr: 6883.427340115957,
    },
  ]

  const result = testUseAprTooltip({ aprItems })

  expect(result.current.hasVeBalBoost).toBeFalsy()
})

it('When the pool has BAL staking incentives (inside the veBAL system)', () => {
  const aprItems: GqlPoolAprItem[] = [
    {
      __typename: 'GqlPoolAprItem',
      id: '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112-rETH-yield-apr',
      title: 'rETH APR',
      type: GqlPoolAprItemType.IbYield,
      apr: 0.007768926276078092,
    },
    {
      __typename: 'GqlPoolAprItem',
      id: '0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112-swap-apr',
      title: 'Swap fees APR',
      type: GqlPoolAprItemType.SwapFee,
      apr: 0.001428043486003915,
    },
    {
      __typename: 'GqlPoolAprItem',
      id: '0x79ef6103a513951a3b25743db509e267685726b7-BAL-apr',
      title: 'BAL reward APR',
      type: GqlPoolAprItemType.Staking,
      apr: 0.01454219612063976,
    },
  ]

  const result = testUseAprTooltip({ aprItems })

  expect(result.current.hasVeBalBoost).toBeFalsy()
})
