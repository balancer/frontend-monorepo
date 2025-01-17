import { Pool } from '../pool.types'
import { PoolListItem } from '@repo/lib/modules/pool/pool.types'
import { usePoolsMetadata } from './PoolsMetadataProvider'
import { useMemo } from 'react'

export function usePoolMetadata(pool: Pick<Pool | PoolListItem, 'chain' | 'address'>) {
  const { getPoolMetadata } = usePoolsMetadata()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const poolMetadata = useMemo(() => getPoolMetadata(pool), [pool])

  return { ...poolMetadata }
}
