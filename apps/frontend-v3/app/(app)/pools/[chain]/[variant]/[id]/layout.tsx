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

  function getOpenGraphImage() {
    const baseUrl =
      //process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      process.env.VERCEL_BRANCH_URL
        ? `https://${process.env.VERCEL_BRANCH_URL}`
        : 'https://localhost:3000'
    const params = new URLSearchParams({
      name: poolMetadata?.pool?.name || 'Pool',
    })
    return `${baseUrl}/api/og?${params.toString()}`
  }

  return {
    ...poolMetadata.metadata,
    openGraph: {
      images: [getOpenGraphImage()],
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
