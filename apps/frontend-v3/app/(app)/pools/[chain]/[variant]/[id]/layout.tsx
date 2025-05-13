import { FetchPoolProps, PoolVariant } from '@repo/lib/modules/pool/pool.types'
import { ChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { generatePoolMetadata, PoolLayout, PoolMetadata } from '@repo/lib/shared/layouts/PoolLayout'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export type Props = PropsWithChildren<{
  params: Omit<FetchPoolProps, 'chain'> & { chain: ChainSlug }
}>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const poolMetadata: PoolMetadata = await generatePoolMetadata(props.params)

  function getOpenGraphImage(variant?: PoolVariant) {
    // We could use poolMetadata?.pool to have a more accurate image (by pool type, chain, etc)
    if (variant && variant === 'cow') {
      return `/images/opengraph/og-cow-pool.png`
    }
    return `/images/opengraph/og-balancer-pool.jpg`
  }

  return {
    ...poolMetadata.metadata,
    openGraph: {
      images: getOpenGraphImage(props.params.variant),
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
