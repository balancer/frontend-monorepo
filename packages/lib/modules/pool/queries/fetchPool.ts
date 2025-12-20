import { ApolloClient } from '@apollo/client'
import { ChainSlug, getChainSlug } from '../pool.utils'
import { GetPoolDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { ensureError } from '@repo/lib/shared/utils/errors'

export async function getPoolQuery(
  apolloClient: ApolloClient<object>,
  chain: ChainSlug,
  id: string
) {
  const _chain = getChainSlug(chain)
  const variables = { id: id.toLowerCase(), chain: _chain }

  try {
    const result = await apolloClient.query({
      query: GetPoolDocument,
      variables,
      context: {
        fetchOptions: {
          next: { revalidate: 30 },
        },
      },
    })
    return { data: result.data, error: null }
  } catch (error: unknown) {
    return { data: null, error: ensureError(error) }
  }
}
