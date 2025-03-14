/* eslint-disable max-len */
import { FetchPoolProps } from '@repo/lib/modules/pool/pool.types'
import { ChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { generatePoolMetadata, PoolLayout, PoolMetadata } from '@repo/lib/shared/layouts/PoolLayout'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export type Props = PropsWithChildren<{
  params: Omit<FetchPoolProps, 'chain'> & { chain: ChainSlug }
}>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const poolMetadata: PoolMetadata = await generatePoolMetadata(props.params)

  return {
    ...poolMetadata.metadata,
    openGraph: {
      // We could use a more accurate dynamic image by variant, pool type, chain, etc
      images: '/images/opengraph/og-beets-pool.png',
    },
  }
}

export default async function PoolLayoutWrapper({
  params: { id, chain, variant },
  children,
}: Props) {
  return (
    <PoolLayout chain={chain} id={id} variant={variant}>
      {children}
    </PoolLayout>
  )
}
