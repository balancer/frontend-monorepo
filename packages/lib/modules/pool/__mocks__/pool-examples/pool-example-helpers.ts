import { ApiToken } from '../../pool.types'

// TODO: move to testing utils
export function tokenSymbols(apiTokens: ApiToken[]): string[] {
  return apiTokens.map(token => token.symbol).sort()
}

export function underlyingTokenSymbols(apiTokens: ApiToken[]): string[] {
  return apiTokens.map(token => token.underlyingToken?.symbol || '-').sort()
}
