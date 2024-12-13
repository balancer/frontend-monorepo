import { GqlPoolTokenDetail, GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { Pool } from '../PoolProvider'
import { useIgnoreErc4626 } from '../metadata/useIgnoreErc4626'

import { PoolListItem, TokenCore } from '../pool.types'
import { getPoolTokensExclSelf } from '../pool.utils'
import { useTokens } from '../../tokens/TokensProvider'
import { buildGqlToken, PoolToken } from '../../tokens/token.helpers'

export function usePoolTokens(pool: Pool | PoolListItem) {
  const ignoreErc4626 = useIgnoreErc4626(pool)
  const { getToken } = useTokens()

  /**
   * Converts an array of PoolTokens or TokenCores to an array of GqlTokens.
   * If a token is not found in the tokens map, it will be constructed using the buildGqlToken function.
   * @param tokens - An array of PoolTokens or TokenCores.
   * @param filterMissingTokens - If true, only tokens that are found in the tokens map will be included.
   * @returns An array of GqlTokens.
   */
  function toGqlTokens(
    tokens: PoolToken[] | TokenCore[],
    { filterMissingTokens = false }: { filterMissingTokens?: boolean } = {}
  ): GqlToken[] {
    if (filterMissingTokens) {
      return tokens.map(token => getToken(token.address, pool.chain)).filter(Boolean) as GqlToken[]
    }

    return tokens.map(token => {
      const gqlToken = getToken(token.address, pool.chain)

      if (!gqlToken) {
        return buildGqlToken(token, pool.chain)
      }

      return gqlToken
    })
  }

  /**
   * Returns true if the pool should use underlying tokens. This is mostly
   * relevant for v3 Boosted pools.
   * @returns True if the pool should use underlying tokens.
   */
  function shouldUseUnderlyingTokens() {
    return !ignoreErc4626 && pool.hasErc4626 && !pool.hasNestedErc4626
  }

  /**
   * Gets the pool tokens that can be used to add or remove liquidity from the
   * pool. Does not include the native asset if one of the pool tokens is the
   * wrapped native asset. This should be included in a further step if needed.
   * @returns The pool tokens.
   */
  function getPoolActionTokens(): GqlPoolTokenDetail[] {
    let poolTokens = getPoolTokensExclSelf(pool) as unknown as GqlPoolTokenDetail[]

    if (shouldUseUnderlyingTokens()) {
      poolTokens = poolTokens.flatMap(token =>
        token.underlyingToken
          ? ({ ...token, ...token.underlyingToken } as unknown as GqlPoolTokenDetail)
          : token
      )
    }

    return poolTokens
  }

  return { getPoolActionTokens, toGqlTokens }
}
