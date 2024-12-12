import { isV3Pool } from '../pool.helpers'
import { PoolListItem } from '../pool.types'
import { Pool } from '../PoolProvider'
import { usePoolMetadata } from './PoolMetadataProvider'

export function useIgnoreErc4626(pool: Pool | PoolListItem) {
  const { getPoolMetadata } = usePoolMetadata()
  const poolMetadata = getPoolMetadata(pool)
  const _isV3Pool = isV3Pool(pool)

  // Ignore ERC4626 tokens if pool is not a v3 pool or if the pool metadata has ignoreERC4626 set to true.
  return !_isV3Pool || poolMetadata?.ignoreERC4626
}
