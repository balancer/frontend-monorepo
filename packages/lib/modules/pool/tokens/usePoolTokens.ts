import { Pool } from '../PoolProvider'
import { useIgnoreErc4626 } from '../metadata/useIgnoreErc4626'

import { PoolListItem } from '../pool.types'
import { getPoolTokensExclSelf } from '../pool.utils'

export function usePoolTokens(pool: Pool | PoolListItem) {
  const ignoreErc4626 = useIgnoreErc4626(pool)

  function shouldUseUnderlyingTokens() {
    return !ignoreErc4626 && pool.hasErc4626 && !pool.hasNestedErc4626
  }

  function getPoolActionTokens() {
    const poolTokens = getPoolTokensExclSelf(pool)

    if (shouldUseUnderlyingTokens()) {
      return poolTokens.map(token =>
        token.underlyingToken ? { ...token, ...token.underlyingToken } : token
      )
    }

    return poolTokens
  }

  return { getPoolActionTokens }
}
