import { describe, expect, it } from 'vitest'
import { isPoolAddressSearch, mapPoolToPoolListItem } from './findPoolsByAddress'
import { GqlChainValues, GqlPoolTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { GetPoolQuery } from '@repo/lib/shared/services/api/generated/graphql'

describe('isPoolAddressSearch', () => {
  it('returns true for checksummed and lowercase addresses', () => {
    expect(isPoolAddressSearch('0xAE4f5c7767db2931a7e82200C14EdCFf4A5fa1fE')).toBe(true)
    expect(isPoolAddressSearch('0xae4f5c7767db2931a7e82200c14edcff4a5fa1fe')).toBe(true)
  })

  it('returns false for names, empty values, and invalid hex', () => {
    expect(isPoolAddressSearch('wstETH')).toBe(false)
    expect(isPoolAddressSearch('')).toBe(false)
    expect(isPoolAddressSearch(null)).toBe(false)
    expect(isPoolAddressSearch('0xdead')).toBe(false)
  })
})

describe('mapPoolToPoolListItem', () => {
  it('maps LBP start/end times onto lbpParams and fills missing list dynamic fields', () => {
    const pool = {
      __typename: 'GqlPoolLiquidityBootstrappingV3',
      id: '0xae4f5c7767db2931a7e82200c14edcff4a5fa1fe',
      address: '0xae4f5c7767db2931a7e82200c14edcff4a5fa1fe',
      name: 'Hyperwave Liquidity Bootstrapping Pool',
      symbol: 'HWAVE-LBP',
      type: GqlPoolTypeValues.LiquidityBootstrapping,
      chain: GqlChainValues.Hyperevm,
      protocolVersion: 3,
      startTime: 1_700_000_000,
      endTime: 1_700_086_400,
      dynamicData: {
        totalLiquidity: '0',
        volume24h: '0',
        fees24h: '0',
        holdersCount: '0',
        swapFee: '0.01',
        totalShares: '0',
        aprItems: [],
      },
      poolTokens: [],
    } as unknown as GetPoolQuery['pool']

    const listItem = mapPoolToPoolListItem(pool)

    expect(listItem.lbpParams).toEqual({
      startTime: 1_700_000_000,
      endTime: 1_700_086_400,
    })

    expect(listItem.dynamicData.lifetimeVolume).toBe('0')
    expect(listItem.dynamicData.lifetimeSwapFees).toBe('0')
    expect(listItem.dynamicData.swapsCount).toBe('0')
    expect(listItem.id).toBe('0xae4f5c7767db2931a7e82200c14edcff4a5fa1fe')
  })
})
