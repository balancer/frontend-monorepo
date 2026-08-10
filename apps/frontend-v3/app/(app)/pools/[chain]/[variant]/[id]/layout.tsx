import { FetchPoolProps, PoolVariant } from '@repo/lib/modules/pool/pool.types'
import { ChainSlug, chainToSlugMap } from '@repo/lib/modules/pool/pool.utils'
import { generatePoolMetadata, PoolLayout, PoolMetadata } from '@repo/lib/shared/layouts/PoolLayout'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export type Props = PropsWithChildren<{
  params: Promise<Omit<FetchPoolProps, 'chain'> & { chain: ChainSlug }>
}>

export async function generateMetadata(props: Props): Promise<Metadata> {
  const resolvedParams = await props.params
  const poolMetadata: PoolMetadata = await generatePoolMetadata(resolvedParams)

  function getOpenGraphImage(variant?: PoolVariant) {
    // CoW pools keep their branded static image
    if (variant && variant === 'cow') {
      return `/images/opengraph/og-cow-pool.png`
    }
    const chain = poolMetadata?.pool?.chain
    const chainSlug = chain ? chainToSlugMap[chain] : undefined
    return `/api/og/pool/${chainSlug ?? poolMetadata?.pool?.chain.toLowerCase()}/${poolMetadata?.pool?.id}`
  }

  return {
    ...poolMetadata.metadata,
    openGraph: {
      images: getOpenGraphImage(resolvedParams.variant),
    },
  }
}

export default async function PoolLayoutWrapper({ params, children }: Props) {
  const { id, chain, variant } = await params

  return (
    <PoolLayout chain={chain} id={id} variant={variant}>
      {children}
    </PoolLayout>
  )
}
