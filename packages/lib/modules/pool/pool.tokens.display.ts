import { GqlNestedPool, GqlPoolBase } from '@repo/lib/shared/services/api/generated/graphql'
import { Pool } from './PoolProvider'
import { ApiToken, ApiTokenWithBalance, PoolCore, PoolListItem } from './pool.types'
// import { isV3Pool } from './pool.helpers'
import { PoolToken } from '../tokens/token.helpers'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { Address } from 'viem'
import { sortBy } from 'lodash'

// CRITICAL TODO: duplicated function as importing from pool.helpers creates a circular dependency or something
// (use the import from pool.helpers to see the error)
export function isV3Pool(
  pool: Pick<Pool | PoolListItem | GqlPoolBase, 'protocolVersion'>
): boolean {
  return pool.protocolVersion === 3
}

export function getCompositionTokens(pool: PoolCore | GqlNestedPool): ApiTokenWithBalance[] {
  const tokens = getPoolTokens(pool).map(token => {
    if (token.hasNestedPool && token.nestedPool) {
      return {
        ...token,
        nestedTokens: getCompositionTokens(token.nestedPool as GqlNestedPool),
      } as ApiTokenWithBalance
    }
    return token as ApiTokenWithBalance
  })

  return sortApiTokensBySymbol(
    excludeNestedBptTokens(tokens as ApiToken[], pool.address)
  ) as ApiTokenWithBalance[]
}

export function getUserReferenceTokens(pool: PoolCore): ApiToken[] {
  //  excludeNestedBptTokens(pool.poolTokens, pool.address) //TODO: do we need this case?? How is Panthom displayed after API fix?
  if (isV3Pool(pool) && pool.hasErc4626 && pool.hasAnyAllowedBuffer) {
    return sortApiTokensBySymbol(
      pool.poolTokens.map(token =>
        token.isErc4626 && token.isBufferAllowed
          ? ({ ...token, ...token.underlyingToken } as ApiToken)
          : (token as ApiToken)
      )
    )
  }

  return sortApiTokensBySymbol(getCompositionTokens(pool))
}

function isPool(pool: any): pool is Pool {
  return (pool as Pool).poolTokens !== undefined
}

function isGqlNestedPool(pool: any): pool is GqlNestedPool {
  return (pool as GqlNestedPool).tokens !== undefined
}

function getPoolTokens(pool: PoolCore | GqlNestedPool): PoolToken[] {
  if (isPool(pool)) {
    return pool.poolTokens
  }
  if (isGqlNestedPool(pool)) {
    return pool.tokens
  }
  throw new Error('Invalid pool type: poolTokens or tokens but be defined')
}

function sortApiTokensBySymbol(tokens: ApiToken[]): ApiToken[] {
  return sortBy(tokens, 'symbol')
}

function excludeNestedBptTokens(tokens: PoolToken[] | ApiToken[], poolAddress: string): ApiToken[] {
  return tokens
    .filter(token => !isSameAddress(token.address, poolAddress as Address)) // Exclude the BPT pool token itself
    .filter(token => token !== undefined) as ApiToken[]
}

export function getUserReferenceTokensWithPossibleNestedTokensWithBalance(
  pool: PoolCore
): ApiTokenWithBalance[] {
  return getUserReferenceTokensWithPossibleNestedTokens(pool) as ApiTokenWithBalance[]
}

export function getUserReferenceTokensWithPossibleNestedTokens(pool: PoolCore) {
  return addPossibleNestedTokens(getUserReferenceTokens(pool as PoolCore))
}

export function getCompositionDisplayTokensWithPossibleNestedTokensWithBalance(pool: PoolCore) {
  return addPossibleNestedTokens(getCompositionTokens(pool as PoolCore)) as ApiTokenWithBalance[]
}

export function addPossibleNestedTokens(apiTokens: ApiToken[]) {
  const hasNestedPools = apiTokens.some(token => token.hasNestedPool)

  if (!hasNestedPools) return apiTokens
  const apiTokensWithNestedPools: ApiToken[] = []

  apiTokens.forEach(token => {
    if (token.hasNestedPool) {
      token.nestedPool?.tokens.forEach(nestedPoolToken => {
        apiTokensWithNestedPools.push(nestedPoolToken as ApiToken)
      })
    } else {
      apiTokensWithNestedPools.push(token)
    }
  })

  return apiTokensWithNestedPools
}
