import {
  VotingPoolWithData,
  VotesState,
  SortVotesBy,
} from '@repo/lib/modules/vebal/vote/vote.types'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { VotingPool, PoolToken } from '@repo/lib/modules/pool/pool.types'
import { compact } from 'lodash'
import { GetTokenFn } from '@repo/lib/modules/tokens/TokensProvider'

export function getVotesState(relativeWeightCap: number, votesNextPeriod: number) {
  if (relativeWeightCap === 0 || votesNextPeriod === 0) return VotesState.Normal
  if (votesNextPeriod > relativeWeightCap) {
    return VotesState.Exceeded
  }
  if (relativeWeightCap - votesNextPeriod <= 0.01) {
    return VotesState.Close
  }
  return VotesState.Normal
}

export function voteToPool(vote: VotingPoolWithData, getToken: GetTokenFn): VotingPool {
  return {
    id: vote.id,
    type: vote.type,
    chain: vote.chain,
    /*
    TODO:
    Tokens in veBalGetVotingList query have type GqlVotingGaugeToken which does not have all the properties of PoolToken
    That means that token pills will be different for voting pools (unless we change the backend types or we query and map the pool list tokens):
    - Showing symbol instead of name
    - GqlVotingGaugeToken does not have nestedPool property so NestedTokenPills won't be displayed
    */
    poolTokens: compact(
      vote.tokens.map(token =>
        token.underlyingTokenAddress
          ? getToken(token.underlyingTokenAddress, vote.chain)
          : ({ ...token, name: token.symbol } as unknown as PoolToken)
      )
    ),
    address: vote.address,
    protocolVersion: vote.protocolVersion, // fix: (votes) no data
    symbol: vote.symbol,
    // TODO: API is not returning the following fields in GqlVotingPool yet
    hook: undefined, // fix: (votes) no data
    hasErc4626: false, // fix: (votes) no data
    tags: [], // fix: (votes) no data
  }
}

export function isGaugeExpired(expiredGauges: string[] | undefined, gaugeAddress: string): boolean {
  if (!expiredGauges) return false
  return expiredGauges.some(item => isSameAddress(gaugeAddress, item))
}

export function isPoolExpired(pool: VotingPoolWithData) {
  return pool.gauge.isKilled
}

export const orderByHash: Record<SortVotesBy, { label: string; title?: string }> = {
  type: { label: 'Details' },
  bribes: {
    label: 'Bribes',
    title:
      'Voting incentives (referred to as ‘Bribes’ in DeFi) are provided by unaffiliated 3rd parties through the Hidden Hand platform to incentivize liquidity to certain pools.',
  },
  bribesPerVebal: {
    label: 'Bribes/veBAL',
    title:
      'This shows the ratio of 3rd party voting incentives (known as Bribes) to veBAL. The higher this ratio, the more profitable it is to currently vote on this pool. Note this ratio could change up till the voting deadline.',
  },
  votes: { label: 'veBAL votes' },
}
