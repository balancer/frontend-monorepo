import { PoolVariant } from '@repo/lib/modules/pool/pool.types'
import { ChainSlug, getChainSlug, getPoolTypeLabel } from '@repo/lib/modules/pool/pool.utils'
import { PropsWithChildren, Suspense } from 'react'
import { PoolDetailSkeleton } from '@repo/lib/modules/pool/PoolDetail/PoolDetailSkeleton'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { GetPoolDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { Metadata } from 'next'
import { PoolProvider } from '@repo/lib/modules/pool/PoolProvider'
import { arrayToSentence } from '@repo/lib/shared/utils/strings'
import { ensureError } from '@repo/lib/shared/utils/errors'
import { notFound } from 'next/navigation'
import { getUserReferenceTokens } from '@repo/lib/modules/pool/pool-tokens.utils'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export type Props = PropsWithChildren<{
  chain: ChainSlug
  id: string
  variant?: PoolVariant
}>

async function getPoolQuery(chain: ChainSlug, id: string) {
  const _chain = getChainSlug(chain)
  const variables = { id: id.toLowerCase(), chain: _chain }

  try {
    const result = await getApolloServerClient().query({
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

export async function generateMetadata({ id, chain, variant }: Props): Promise<Metadata> {
  const { data } = await getPoolQuery(chain, id)

  const pool = data?.pool
  if (!pool) return {}

  const displayTokens = getUserReferenceTokens(pool)
  const poolTokenString = arrayToSentence(displayTokens.map(token => token.symbol))
  const poolSymbol = PROJECT_CONFIG.options.showPoolName ? 'This' : pool.symbol // pool name is already shown in the title so we don't need to show it twice

  return {
    title: `Liquidity Pool (${variant}): ${pool.name}`,
    description: `${poolSymbol} is a Balancer ${variant} ${getPoolTypeLabel(
      pool.type
    )} liquidity pool which contains ${poolTokenString}.`,
  }
}

export async function PoolLayout({ id, chain, variant, children }: Props) {
  const _chain = getChainSlug(chain)

  const { data, error } = await getPoolQuery(chain, id)

  if (error) {
    if (error?.message === 'Pool with id does not exist') {
      notFound()
    }

    throw new Error('Failed to fetch pool')
  } else if (!data) {
    throw new Error('Failed to fetch pool')
  }

  return (
    <Suspense fallback={<PoolDetailSkeleton />}>
      <PoolProvider chain={_chain} data={data} id={id} variant={variant}>
        {children}
      </PoolProvider>
    </Suspense>
  )
}
