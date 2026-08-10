import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PoolOgCard } from '@bal/lib/components/og/PoolOgCard'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { getPoolQuery } from '@repo/lib/modules/pool/queries/fetchPool'
import { ChainSlug } from '@repo/lib/modules/pool/pool.utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const POOL_ID_REGEX = /^0x[a-fA-F0-9]{64}$/

export default async function PoolOgPage({
  params,
}: {
  params: Promise<{ chain: string; id: string }>
}) {
  const { chain, id } = await params

  const chainSlugs = Object.values(ChainSlug) as string[]
  if (!chainSlugs.includes(chain) || !POOL_ID_REGEX.test(id)) notFound()

  const { data } = await getPoolQuery(getApolloServerClient(), chain as ChainSlug, id)
  if (!data?.pool) notFound()

  return (
    <main
      id="og-image"
      style={{
        width: 1200,
        height: 630,
        overflow: 'hidden',
      }}
    >
      <PoolOgCard pool={data.pool} />
    </main>
  )
}
