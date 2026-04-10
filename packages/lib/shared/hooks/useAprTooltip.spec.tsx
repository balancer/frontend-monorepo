import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { bn, fNum } from '../utils/numbers'
import { useAprTooltip } from './useAprTooltip'
import { aprTooltipDataMock } from './_mocks_/aprTooltipDataMock'
import BigNumber from 'bignumber.js'
import { GqlPoolAprItem, GqlChain } from '../services/api/generated/graphql'
import { getApiPoolMock } from '@repo/lib/modules/pool/__mocks__/api-mocks/api-mocks'
import { boostedCoinshiftUsdcUsdl } from '@repo/lib/modules/pool/__mocks__/pool-examples/boosted'

const defaultNumberFormatter = (value: string) => bn(bn(value).toFixed(4, BigNumber.ROUND_HALF_UP))

function testUseAprTooltip({ aprItems }: { aprItems: GqlPoolAprItem[] }) {
  const { result } = testHook(() =>
    useAprTooltip({ aprItems, numberFormatter: defaultNumberFormatter, chain: GqlChain.Mainnet })
  )
  return result
}

describe('useAprTooltip', () => {
  test('formats APRs with default formatter', () => {
    const result = testUseAprTooltip({ aprItems: aprTooltipDataMock.aprItems })

    expect(result.current.swapFeesDisplayed.toFixed()).toBe('0.0007')
    expect(fNum('apr', result.current.swapFeesDisplayed)).toBe('0.07%')

    const yieldBearingTokensApr = result.current.yieldBearingTokensDisplayed[0].apr
    expect(yieldBearingTokensApr.toFixed()).toBe('0.0068')
    expect(fNum('apr', yieldBearingTokensApr)).toBe('0.68%')

    const totalBaseDisplayed = result.current.totalBaseDisplayed
    expect(totalBaseDisplayed.toFixed()).toBe('0.0075')
    expect(fNum('apr', totalBaseDisplayed)).toBe('0.75%') // 0.07 + 0.0068 + 0.68 = 0.75
  })
})

it('When the pool has multiple Yield bearing token APRs', () => {
  const pool = getApiPoolMock(boostedCoinshiftUsdcUsdl)

  const result = testUseAprTooltip({ aprItems: pool.dynamicData.aprItems })

  /* APR should tooltip should display:
    - Yield bearing tokens 3.72%
                    csUSDL 1.72%
                    csUSDC 2%
  */
  expect(result.current.yieldBearingTokensAprDisplayed).toMatchInlineSnapshot(`"0.0372"`)
  expect(result.current.yieldBearingTokensDisplayed).toMatchInlineSnapshot(`
    [
      {
        "apr": "0.0172",
        "title": "csUSDL",
      },
      {
        "apr": "0.02",
        "title": "csUSDC",
      },
    ]
  `)
})

it('When the pool has multiple MERKL token incentives', () => {
  const pool = getApiPoolMock(boostedCoinshiftUsdcUsdl)

  const result = testUseAprTooltip({ aprItems: pool.dynamicData.aprItems })

  /* APR should tooltip should display
    - Merkl.xyz incentives: 1.80%
                     MORPHO 1.80%
  */
  expect(result.current.merklIncentivesAprDisplayed).toMatchInlineSnapshot(`"0.01778366853303084"`)
  expect(result.current.merklTokensDisplayed).toMatchInlineSnapshot(`
    [
      {
        "apr": "0.0178",
        "title": "MORPHO",
      },
    ]
  `)
})
