'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { Pool } from '../PoolProvider'
import { Erc4626Metadata } from './getErc4626Metadata'
import { PoolListItem } from '../pool.types'
import { getChainId } from '@repo/lib/config/app.config'
import { PoolMetadata, PoolsMetadata } from './getPoolsMetadata'

export type UsePoolsMetadataResult = ReturnType<typeof _usePoolsMetadata>
export const PoolsMetadataContext = createContext<UsePoolsMetadataResult | null>(null)

export function _usePoolsMetadata(
  erc4626Metadata: Erc4626Metadata[] | undefined,
  poolsMetadata: PoolsMetadata | undefined
) {
  function getErc4626Metadata(pool: Pool | PoolListItem): Erc4626Metadata[] {
    if (!erc4626Metadata) return []

    return erc4626Metadata.filter(_metadata =>
      pool.tags?.map(tag => tag?.toLowerCase()).includes(_metadata.id)
    )
  }

  function getPoolMetadata(
    pool: Pick<Pool | PoolListItem, 'chain' | 'address'>
  ): PoolMetadata | undefined {
    if (!poolsMetadata) return undefined

    const poolChainId = getChainId(pool.chain)

    return poolsMetadata?.[poolChainId]?.[pool.address]
  }

  return { getErc4626Metadata, getPoolMetadata }
}

export function PoolsMetadataProvider({
  children,
  erc4626Metadata,
  poolsMetadata,
}: PropsWithChildren & {
  erc4626Metadata: Erc4626Metadata[] | undefined
  poolsMetadata: PoolsMetadata | undefined
}) {
  const hook = _usePoolsMetadata(erc4626Metadata, poolsMetadata)
  return <PoolsMetadataContext.Provider value={hook}>{children}</PoolsMetadataContext.Provider>
}

export const usePoolsMetadata = (): UsePoolsMetadataResult =>
  useMandatoryContext(PoolsMetadataContext, 'PoolsMetadata')
