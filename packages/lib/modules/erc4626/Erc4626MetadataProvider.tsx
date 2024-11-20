'use client'

import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { createContext, PropsWithChildren } from 'react'
import { Pool } from '../pool/PoolProvider'
import { Erc4626Metadata } from './getErc4626Metadata'
import { PoolListItem } from '../pool/pool.types'

export type UseErc4626MetadataResult = ReturnType<typeof _useErc4626Metadata>
export const Erc4626MetadataContext = createContext<UseErc4626MetadataResult | null>(null)

export function _useErc4626Metadata(metadata: Erc4626Metadata[] | undefined) {
  const hasMetadata = !!metadata

  function getErc4626Metadata(pool: Pool | PoolListItem): Erc4626Metadata[] {
    if (!metadata) return []
    return metadata.filter(_metadata =>
      pool.tags?.map(tag => tag?.toLowerCase()).includes(_metadata.id)
    )
  }

  return { hasMetadata, metadata, getErc4626Metadata }
}

export function Erc4626MetadataProvider({
  children,
  data,
}: PropsWithChildren & { data: Erc4626Metadata[] | undefined }) {
  const hook = _useErc4626Metadata(data)
  return <Erc4626MetadataContext.Provider value={hook}>{children}</Erc4626MetadataContext.Provider>
}

export const useErc4626Metadata = (): UseErc4626MetadataResult =>
  useMandatoryContext(Erc4626MetadataContext, 'Erc4626Metadata')
