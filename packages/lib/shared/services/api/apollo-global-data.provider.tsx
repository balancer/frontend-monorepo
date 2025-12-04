/**
 * Apollo Global Data Provider
 *
 * This component is used to fetch data that is needed for the entire
 * application during the RSC render pass.
 */
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { GetProtocolStatsDocument } from '@repo/lib/shared/services/api/generated/graphql'
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
import { FeeManagersProvider } from '@repo/lib/modules/fee-managers/FeeManagersProvider'
import { getFeeManagersMetadata } from '@repo/lib/modules/fee-managers/getFeeManagersMetadata'
import { getPoolMigrations } from '@repo/lib/modules/pool/migrations/getPoolMigrations'
import { PoolMigrationsProvider } from '@repo/lib/modules/pool/migrations/PoolMigrationsProvider'

export const revalidate = 60

export async function ApolloGlobalDataProvider({ children }: PropsWithChildren) {
  const client = getApolloServerClient()

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

  const [
    exchangeRates,
    hooksMetadata,
    poolTags,
    erc4626Metadata,
    poolsMetadata,
    feeManagersMetadata,
    poolMigrations,
  ] = await Promise.all([
    getFxRates(),
    getHooksMetadata(),
    getPoolTags(),
    getErc4626Metadata(),
    getPoolsMetadata(),
    getFeeManagersMetadata(),
    getPoolMigrations(),
  ])

  return (
    <TokensProvider>
      <FiatFxRatesProvider data={exchangeRates}>
        <PoolTagsProvider data={poolTags}>
          <HooksProvider data={hooksMetadata}>
            <FeeManagersProvider data={feeManagersMetadata}>
              <ProtocolStatsProvider data={protocolData}>
                <PoolsMetadataProvider
                  erc4626Metadata={erc4626Metadata}
                  poolsMetadata={poolsMetadata}
                >
                  <PoolMigrationsProvider poolMigrations={poolMigrations}>
                    {children}
                  </PoolMigrationsProvider>
                </PoolsMetadataProvider>
              </ProtocolStatsProvider>
            </FeeManagersProvider>
          </HooksProvider>
        </PoolTagsProvider>
      </FiatFxRatesProvider>
    </TokensProvider>
  )
}
