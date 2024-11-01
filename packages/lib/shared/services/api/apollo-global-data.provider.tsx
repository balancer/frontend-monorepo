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
  GetTokenPricesDocument,
  GetTokensDocument,
} from '@repo/lib/shared/services/api/generated/graphql'
import { getProjectConfig } from '@repo/lib/config/getProjectConfig'
import { TokensProvider } from '@repo/lib/modules/tokens/TokensProvider'
import { FiatFxRatesProvider } from '../../hooks/FxRatesProvider'
import { getFxRates } from '../../utils/currencies'
import { getPoolCategories } from '@repo/lib/modules/pool/categories/getPoolCategories'
import { PoolCategoriesProvider } from '@repo/lib/modules/pool/categories/PoolCategoriesProvider'
import { mins } from '../../utils/time'
import { PropsWithChildren } from 'react'
import { getHooksMetadata } from '@repo/lib/modules/hooks/getHooksMetadata'
import { HooksProvider } from '@repo/lib/modules/hooks/HooksProvider'

export const revalidate = 60

export async function ApolloGlobalDataProvider({ children }: PropsWithChildren) {
  const client = getApolloServerClient()

  const tokensQueryVariables = {
    chains: getProjectConfig().supportedNetworks,
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
      chains: getProjectConfig().supportedNetworks,
    },
    context: {
      fetchOptions: {
        next: { revalidate: mins(10).toSecs() },
      },
    },
  })

  const exchangeRates = await getFxRates()
  const poolCategories = await getPoolCategories()
  const hooksMetadata = await getHooksMetadata()

  return (
    <TokensProvider
      tokenPricesData={tokenPricesQueryData}
      tokensData={tokensQueryData}
      variables={tokensQueryVariables}
    >
      <FiatFxRatesProvider data={exchangeRates}>
        <PoolCategoriesProvider data={poolCategories}>
          <HooksProvider data={hooksMetadata}>{children}</HooksProvider>
        </PoolCategoriesProvider>
      </FiatFxRatesProvider>
    </TokensProvider>
  )
}
