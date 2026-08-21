import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { sDAIWeighted } from '../../../__mocks__/pool-examples/flat'
import type { GqlPoolElement } from '@repo/lib/shared/services/api/graphql-derived-types'
import { getPoolRisks, RiskCategory, RiskKey } from './usePoolRisks'

describe('getPoolRisks', () => {
  it('includes Oracle risk when a rate provider has the market-rate warning', () => {
    const pool = getApiPoolMock(sDAIWeighted) as GqlPoolElement

    pool.poolTokens[0].priceRateProviderData = {
      __typename: 'GqlPriceRateProviderData',
      address: '0x0000000000000000000000000000000000000001',
      name: 'MarketRateProvider',
      summary: 'safe',
      reviewed: true,
      warnings: ['market-rate'],
      upgradeableComponents: [],
      reviewFile: null,
      factory: null,
    }

    const riskGroups = getPoolRisks(pool)
    const poolSpecificRisks = riskGroups.find(group => group.category === RiskCategory.PoolSpecific)

    expect(poolSpecificRisks?.risks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Oracle risk',
          path: `/risks#${RiskKey.Oracle}`,
        }),
      ])
    )
  })

  it('does not include Oracle risk without a market-rate warning', () => {
    const pool = getApiPoolMock(sDAIWeighted) as GqlPoolElement
    const riskGroups = getPoolRisks(pool)
    const poolSpecificRisks = riskGroups.find(group => group.category === RiskCategory.PoolSpecific)

    expect(poolSpecificRisks?.risks.some(risk => risk.title === 'Oracle risk')).toBe(false)
  })
})
