import { GqlNestedPool } from '@repo/lib/shared/services/api/generated/graphql'
import { Pool } from './PoolProvider'
import { PoolToken, PoolCore } from './pool.types'
import { isV3Pool } from './pool.helpers'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { Address } from 'viem'
import { sortBy } from 'lodash'

export function getCompositionTokens(pool: PoolCore | GqlNestedPool): PoolToken[] {
  return sortByIndex(excludeNestedBptTokens(getPoolTokens(pool), pool.address))
}

/*
  The set of tokens that are reference tokens for the user so that they know at a glance what can be added to the pool.
   Used in the pool header and in the pools list.
*/
export function getUserReferenceTokens(pool: PoolCore): PoolToken[] {
  if (isV3Pool(pool) && pool.hasErc4626 && pool.hasAnyAllowedBuffer) {
    return sortByIndex(
      pool.poolTokens.map(token =>
        token.isErc4626 && token.isBufferAllowed
          ? ({ ...token, ...token.underlyingToken } as PoolToken)
          : (token as PoolToken)
      )
    )
  }

  return sortByIndex(getCompositionTokens(pool))
}

function isPool(pool: any): pool is Pool {
  return (pool as Pool).poolTokens !== undefined
}

function isGqlNestedPool(pool: any): pool is GqlNestedPool {
  return (pool as GqlNestedPool).tokens !== undefined
}

function getPoolTokens(pool: PoolCore | GqlNestedPool): PoolToken[] {
  if (isPool(pool)) {
    return pool.poolTokens as PoolToken[]
  }
  if (isGqlNestedPool(pool)) {
    return pool.tokens as PoolToken[]
  }
  throw new Error('Invalid pool type: poolTokens or tokens must be defined')
}

function sortByIndex(tokens: PoolToken[]): PoolToken[] {
  return sortBy(tokens, 'index')
}

function excludeNestedBptTokens(tokens: PoolToken[], poolAddress: string): PoolToken[] {
  return tokens
    .filter(token => !isSameAddress(token.address, poolAddress as Address)) // Exclude the BPT pool token itself
    .filter(token => token !== undefined) as PoolToken[]
}

// Returns user reference tokens with nested tokens flattened
export function getFlatUserReferenceTokens(pool: PoolCore): PoolToken[] {
  return flatNestedTokens(getUserReferenceTokens(pool)) as PoolToken[]
}

// Returns composition tokens with nested tokens flattened
export function getFlatCompositionTokens(pool: PoolCore) {
  return flatNestedTokens(getCompositionTokens(pool)) as PoolToken[]
}

// Returns the provided poolTokens, replacing any BPT with its nested pool tokens
function flatNestedTokens(tokens: PoolToken[]): PoolToken[] {
  const hasNestedPools = tokens.some(token => token.hasNestedPool)

  if (!hasNestedPools) return tokens
  const tokensWithNestedPools: PoolToken[] = []

  tokens.forEach(token => {
    if (token.hasNestedPool) {
      token.nestedPool?.tokens.forEach(nestedPoolToken => {
        tokensWithNestedPools.push(nestedPoolToken as PoolToken)
      })
    } else {
      tokensWithNestedPools.push(token)
    }
  })

  return tokensWithNestedPools
}
