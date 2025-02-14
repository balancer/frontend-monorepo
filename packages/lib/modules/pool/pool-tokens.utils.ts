import { GqlNestedPool, GqlPoolBase } from '@repo/lib/shared/services/api/generated/graphql'
import { Pool, TokenCore } from './pool.types'
import { PoolToken, PoolCore } from './pool.types'
import { isBoosted, isV3Pool } from './pool.helpers'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { Address } from 'viem'
import { sortBy, uniqBy } from 'lodash'
import { ApiToken } from '../tokens/token.types'
import { getLeafTokens } from '../tokens/token.helpers'
import { supportsNestedActions } from './actions/LiquidityActionHelpers'

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
  return flatNestedTokens(getUserReferenceTokens(pool))
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
      getNestedPoolTokens(token).forEach(nestedPoolToken => {
        tokensWithNestedPools.push(nestedPoolToken as PoolToken)
      })
    } else {
      tokensWithNestedPools.push(token)
    }
  })

  return tokensWithNestedPools
}

/*
  Given a BPT, it returns it's nested tokens excluding the BPT itself
  Used in PoolComposition to render token composition of nested pools
*/
export function getNestedPoolTokens(poolToken: PoolToken) {
  if (!poolToken.nestedPool) return []
  return excludeNestedBptTokens(poolToken.nestedPool.tokens as PoolToken[], poolToken.address)
}

/*
  Returns all the tokens in the structure of the given pool:
  top level tokens + children nested tokens + ERC4626 underlying tokens.
*/
export function allPoolTokens(pool: Pool | GqlPoolBase): TokenCore[] {
  const extractUnderlyingTokens = (token: PoolToken): TokenCore[] => {
    if (shouldUseUnderlyingToken(token, pool)) {
      return [{ ...token.underlyingToken, index: token.index } as TokenCore]
    }
    return []
  }

  const extractNestedUnderlyingTokens = (nestedPool?: GqlNestedPool): TokenCore[] => {
    if (!nestedPool) return []
    return nestedPool.tokens.flatMap(nestedToken =>
      shouldUseUnderlyingToken(nestedToken as PoolToken, pool)
        ? ([
            nestedToken,
            { ...nestedToken.underlyingToken, index: nestedToken.index },
          ] as TokenCore[])
        : [nestedToken as TokenCore]
    )
  }

  const poolTokens: PoolToken[] = pool.poolTokens as PoolToken[]

  const underlyingTokens: TokenCore[] = poolTokens.flatMap(extractUnderlyingTokens)

  const nestedParentTokens: PoolToken[] = poolTokens.flatMap(token =>
    token.nestedPool ? token : []
  )

  const nestedChildrenTokens: TokenCore[] = pool.poolTokens.flatMap(token =>
    token.nestedPool ? extractNestedUnderlyingTokens(token.nestedPool as GqlNestedPool) : []
  )

  const isTopLevelToken = (token: PoolToken): boolean => {
    if (token.hasNestedPool) return false
    if (!isV3Pool(pool)) return true
    if (!token.isErc4626) return true
    if (token.isErc4626 && !token.isBufferAllowed) return true
    return true
  }

  const standardTopLevelTokens: PoolToken[] = poolTokens.flatMap(token =>
    isTopLevelToken(token) ? token : []
  )

  const allTokens = underlyingTokens.concat(
    toTokenCores(nestedParentTokens),
    nestedChildrenTokens,
    toTokenCores(standardTopLevelTokens)
  )

  // Remove duplicates as phantom BPTs can be both in the top level and inside nested pools
  return uniqBy(allTokens, 'address')
}

function toTokenCores(poolTokens: PoolToken[]): TokenCore[] {
  return poolTokens.map(
    t =>
      ({
        address: t.address as Address,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
        index: t.index,
      }) as TokenCore
  )
}
export function shouldUseUnderlyingToken(token: ApiToken, pool: Pool | GqlPoolBase): boolean {
  if (isV3Pool(pool) && token.isErc4626 && token.isBufferAllowed && !token.underlyingToken) {
    // This should never happen unless the API some some inconsistency
    throw new Error(
      `Underlying token is missing for ERC4626 token with address ${token.address} in chain ${pool.chain}`
    )
  }
  // Only v3 pools should underlying tokens
  return isV3Pool(pool) && token.isErc4626 && token.isBufferAllowed && !!token.underlyingToken
}

// Returns top level standard tokens + Erc4626 (only v3) underlying tokens
export function getBoostedGqlTokens(pool: Pool): ApiToken[] {
  const poolTokens = pool.poolTokens as PoolToken[]
  const underlyingTokens = poolTokens
    .flatMap(token =>
      shouldUseUnderlyingToken(token, pool)
        ? [{ ...token, ...token.underlyingToken } as ApiToken]
        : [token as ApiToken]
    )
    .filter((token): token is ApiToken => token !== undefined)
  return underlyingTokens
}

// Returns the child tokens (children of a parent nestedBpt)
export function getChildTokens(pool: Pool, poolActionableTokens?: ApiToken[]): ApiToken[] {
  if (!poolActionableTokens) return []
  return poolActionableTokens.filter(
    token => !isStandardOrUnderlyingRootToken(pool, token.address as Address)
  )
} // TODO: refactor into a more generic function that looks for the symbol in any pool token

export function getActionableTokenSymbol(tokenAddress: Address, pool: Pool): string {
  const token = getPoolActionableTokens(pool).find(token =>
    isSameAddress(token.address, tokenAddress)
  )
  if (!token) {
    console.log('Token symbol not found for address ', tokenAddress)
    return ''
  }

  return token.symbol
}

/*
  Depending on the pool type, iterates pool.poolTokens and returns the list of GqlTokens that can be used in the pool's actions (add/remove/swap).

  For instance:
    If the pool supports nested actions, returns the leaf tokens.
    If the pool is boosted, returns the underlying tokens instead of the ERC4626 tokens.
*/
export function getPoolActionableTokens(pool: Pool): ApiToken[] {
  function excludeNestedBptTokens(tokens: ApiToken[]): ApiToken[] {
    return tokens
      .filter(token => !isSameAddress(token.address, pool.address)) // Exclude the BPT pool token itself
      .filter(token => token !== undefined)
  }

  // TODO add exception for composable pools where we can allow adding
  // liquidity with nested tokens
  if (supportsNestedActions(pool)) {
    return excludeNestedBptTokens(getLeafTokens(pool.poolTokens as PoolToken[]))
  }

  if (isBoosted(pool)) {
    return excludeNestedBptTokens(getBoostedGqlTokens(pool))
  }

  return excludeNestedBptTokens(pool.poolTokens as ApiToken[])
}

export function getNonBptTokens(pool: Pool) {
  return pool.poolTokens.filter(token => !token.nestedPool)
}

export function getNestedBptTokens(poolTokens: PoolToken[]) {
  return poolTokens.filter(token => token.nestedPool)
}

// Returns the parent BPT token whose nested tokens include the given child token address
export function getNestedBptParentToken(poolTokens: PoolToken[], childTokenAddress: Address) {
  const nestedBptToken = getNestedBptTokens(poolTokens).find(token =>
    token.nestedPool?.tokens.some(nestedToken =>
      isSameAddress(nestedToken.address, childTokenAddress)
    )
  )
  if (!nestedBptToken) {
    throw new Error(
      `Provided nestedTokenAddress ${childTokenAddress} does not belong to any underlying token amongst the nested pool/s (${getNestedBptTokens(
        poolTokens
      )
        .map(t => t.symbol)
        .join(' ,')})`
    )
  }

  return nestedBptToken
}

// Returns true if the given token address belongs to a top level standard/underlying token that is not a nestedBpt
export function isStandardOrUnderlyingRootToken(pool?: Pool, tokenAddress?: Address): boolean {
  if (!pool || !tokenAddress) return true
  const token = pool.poolTokens.find(
    token =>
      isSameAddress(token.address, tokenAddress) ||
      isSameAddress(token.underlyingToken?.address || '', tokenAddress)
  )
  return token?.hasNestedPool === false
}

// Returns the top level tokens that are not nestedBpt
export function getStandardRootTokens(pool: Pool, poolActionableTokens?: ApiToken[]): ApiToken[] {
  if (!poolActionableTokens) return []
  return poolActionableTokens.filter(token =>
    isStandardOrUnderlyingRootToken(pool, token.address as Address)
  )
}

export function getPriceRateForToken(token: ApiToken, pool: Pool) {
  return pool.poolTokens.find(poolToken => poolToken.underlyingToken?.address === token.address)
    ?.priceRate
}
