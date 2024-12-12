'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { Pool } from '../PoolProvider'
import { Erc4626Metadata } from './getErc4626Metadata'
import { PoolListItem } from '../pool.types'
import { getChainId } from '@repo/lib/config/app.config'
import { PoolMetadata, PoolsMetadata } from './getPoolsMetadata'

export type UsePoolMetadataResult = ReturnType<typeof _usePoolMetadata>
export const PoolMetadataContext = createContext<UsePoolMetadataResult | null>(null)

export function _usePoolMetadata(
  erc4626Metadata: Erc4626Metadata[] | undefined,
  poolsMetadata: PoolsMetadata | undefined
) {
  function getErc4626Metadata(pool: Pool | PoolListItem): Erc4626Metadata[] {
    if (!erc4626Metadata) return []

    return erc4626Metadata.filter(_metadata =>
      pool.tags?.map(tag => tag?.toLowerCase()).includes(_metadata.id)
    )
  }

  function getPoolMetadata(pool: Pool | PoolListItem): PoolMetadata | undefined {
    if (!poolsMetadata) return undefined

    const poolChainId = getChainId(pool.chain)

    return poolsMetadata?.[poolChainId]?.[pool.address]
  }

  return { getErc4626Metadata, getPoolMetadata }
}

export function PoolMetadataProvider({
  children,
  erc4626Metadata,
  poolsMetadata,
}: PropsWithChildren & {
  erc4626Metadata: Erc4626Metadata[] | undefined
  poolsMetadata: PoolsMetadata | undefined
}) {
  const hook = _usePoolMetadata(erc4626Metadata, poolsMetadata)
  return <PoolMetadataContext.Provider value={hook}>{children}</PoolMetadataContext.Provider>
}

export const usePoolMetadata = (): UsePoolMetadataResult =>
  useMandatoryContext(PoolMetadataContext, 'PoolMetadata')
