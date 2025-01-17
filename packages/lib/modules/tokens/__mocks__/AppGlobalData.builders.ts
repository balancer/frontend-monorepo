import { GetAppGlobalPollingDataQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { fakeTokenBySymbol } from '@repo/lib/test/data/all-gql-tokens.fake'
import { aGqlTokenPriceMock } from '@repo/lib/test/msw/builders/gqlTokenPrice.builders'

export function anAppGlobalData(options?: Partial<GetAppGlobalPollingDataQuery>) {
  const defaultAppGlobalData: GetAppGlobalPollingDataQuery = {
    __typename: 'Query',
    blocksGetAverageBlockTime: 1000,
    blocksGetBlocksPerDay: 100,
    tokenGetCurrentPrices: [
      aGqlTokenPriceMock({ address: fakeTokenBySymbol('ETH').address }),
      aGqlTokenPriceMock({ address: fakeTokenBySymbol('BAL').address }),
    ],
    protocolMetricsChain: {
      __typename: 'GqlProtocolMetricsChain',
      swapFee24h: 'test fee',
      swapVolume24h: 'test volume 24h',
      poolCount: '24',
      totalLiquidity: 'test liquidity',
    },
  }
  return Object.assign({}, defaultAppGlobalData, options)
}
