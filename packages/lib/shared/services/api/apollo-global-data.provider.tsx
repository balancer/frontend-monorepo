/**
 * Apollo Global Data Provider
 *
 * This component is used to fetch data that is needed for the entire
 * application during the RSC render pass. The data is then passed to the client
 * providers that should then call `useSeedApolloCache` to seed the apollo cache
 * prior to the useQuery call, ensuring the data is already present on the first
 * client render pass.
 */
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import {
  GetProtocolStatsDocument,
  GetTokenPricesDocument,
  GetTokensDocument,
} from '@repo/lib/shared/services/api/generated/graphql'
import { TokensProvider } from '@repo/lib/modules/tokens/TokensProvider'
import { FiatFxRatesProvider } from '../../hooks/FxRatesProvider'
import { getFxRates } from '../../utils/currencies'
import { mins } from '../../utils/time'
import { PropsWithChildren } from 'react'
import { getHooksMetadata } from '@repo/lib/modules/hooks/getHooksMetadata'
import { HooksProvider } from '@repo/lib/modules/hooks/HooksProvider'
import { getPoolTags } from '@repo/lib/modules/pool/tags/getPoolTags'
import { PoolTagsProvider } from '@repo/lib/modules/pool/tags/PoolTagsProvider'
import { getErc4626Metadata } from '@repo/lib/modules/pool/metadata/getErc4626Metadata'
import { PoolsMetadataProvider } from '@repo/lib/modules/pool/metadata/PoolsMetadataProvider'
import { getPoolsMetadata } from '@repo/lib/modules/pool/metadata/getPoolsMetadata'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ProtocolStatsProvider } from '@repo/lib/modules/protocol/ProtocolStatsProvider'

export const revalidate = 60

export async function ApolloGlobalDataProvider({ children }: PropsWithChildren) {
  const client = getApolloServerClient()

  const tokensQueryVariables = {
    chains: PROJECT_CONFIG.supportedNetworks,
  }

  const { data: tokensQueryData } = await client.query({
    query: GetTokensDocument,
    variables: tokensQueryVariables,
    context: {
      fetchOptions: {
        next: { revalidate: mins(20).toSecs() },
      },
    },
  })

  const { data: tokenPricesQueryData } = await client.query({
    query: GetTokenPricesDocument,
    variables: {
      chains: PROJECT_CONFIG.supportedNetworks,
    },
    context: {
      fetchOptions: {
        next: { revalidate: mins(10).toSecs() },
      },
    },
  })

  const { data: protocolData } = await client.query({
    query: GetProtocolStatsDocument,
    variables: {
      chains: PROJECT_CONFIG.networksForProtocolStats || PROJECT_CONFIG.supportedNetworks,
    },
    context: {
      fetchOptions: {
        next: { revalidate: mins(10).toSecs() },
      },
    },
  })

  const [exchangeRates, hooksMetadata, poolTags, erc4626Metadata, poolsMetadata] =
    await Promise.all([
      getFxRates(),
      getHooksMetadata(),
      getPoolTags(),
      getErc4626Metadata(),
      getPoolsMetadata(),
    ])

  return (
    <TokensProvider
      tokenPricesData={tokenPricesQueryData}
      tokensData={tokensQueryData}
      variables={tokensQueryVariables}
    >
      <FiatFxRatesProvider data={exchangeRates}>
        <PoolTagsProvider data={poolTags}>
          <HooksProvider data={hooksMetadata}>
            <ProtocolStatsProvider data={protocolData}>
              <PoolsMetadataProvider
                erc4626Metadata={erc4626Metadata}
                poolsMetadata={poolsMetadata}
              >
                {children}
              </PoolsMetadataProvider>
            </ProtocolStatsProvider>
          </HooksProvider>
        </PoolTagsProvider>
      </FiatFxRatesProvider>
    </TokensProvider>
  )
}
