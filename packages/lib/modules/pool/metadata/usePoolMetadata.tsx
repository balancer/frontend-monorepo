import { Pool } from '../PoolProvider'
import { PoolListItem } from '@repo/lib/modules/pool/pool.types'
import { usePoolsMetadata } from './PoolsMetadataProvider'
import { useMemo } from 'react'

export function usePoolMetadata(pool: Pool | PoolListItem) {
  const { getPoolMetadata } = usePoolsMetadata()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const poolMetadata = useMemo(() => getPoolMetadata(pool), [pool])

  return { ...poolMetadata }
}
