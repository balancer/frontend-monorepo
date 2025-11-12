/* eslint-disable react-hooks/preserve-manual-memoization */
import { Pool } from '../pool.types'
import { PoolListItem } from '@repo/lib/modules/pool/pool.types'
import { usePoolsMetadata } from './PoolsMetadataProvider'
import { useMemo } from 'react'

export function usePoolMetadata(pool: Pick<Pool | PoolListItem, 'chain' | 'address'>) {
  const { getPoolMetadata } = usePoolsMetadata()

  const poolMetadata = useMemo(() => getPoolMetadata(pool), [pool])

  return { ...poolMetadata }
}
