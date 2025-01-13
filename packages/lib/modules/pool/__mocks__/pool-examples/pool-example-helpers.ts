import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { chainToSlugMap } from '../../pool.utils'
import { PoolExample } from './pool-examples.types'

export function tokenSymbols(apiTokens: ApiToken[]): string[] {
  return apiTokens.map(token => token.symbol).sort()
}

export function underlyingTokenSymbols(apiTokens: ApiToken[]): string[] {
  return apiTokens.map(token => token.underlyingToken?.symbol || '-').sort()
}

export function getPoolExampleUri(pool: PoolExample): string {
  return `/pools/${chainToSlugMap[pool.poolChain]}/v${pool.version}/${pool.poolId}`
}
