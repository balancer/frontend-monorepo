/* eslint-disable max-len */
import { FetchPoolProps } from '@repo/lib/modules/pool/pool.types'
import { ChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { PoolLayout } from '@repo/lib/shared/layouts/PoolLayout'
import { PropsWithChildren } from 'react'

export type Props = PropsWithChildren<{
  params: Omit<FetchPoolProps, 'chain'> & { chain: ChainSlug }
}>

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
