import {
  VotingPoolWithData,
  VotesState,
  SortVotesBy,
} from '@repo/lib/modules/vebal/vote/vote.types'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { VotingPool } from '@repo/lib/modules/pool/pool.types'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { getChainId } from '@repo/lib/config/app.config'

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

export function voteToPool(vote: VotingPoolWithData): VotingPool {
  return {
    id: vote.id,
    type: vote.type,
    chain: vote.chain,
    poolTokens: vote.poolTokens.map(
      token =>
        ({
          ...token,
          // FIXME: API returns null chain for some hardcoded pools (pending API fix)
          // Use the token's chain if it exists, otherwise default to the vote's chain
          chain: token.chain || vote.chain,
          chainId: token.chainId || getChainId(vote.chain),
        }) as ApiToken
    ),
    address: vote.address,
    protocolVersion: vote.protocolVersion,
    symbol: vote.symbol,
    tags: vote.tags,
    // TODO: API is not returning the following fields in GqlVotingPool yet
    hook: undefined,
    hasErc4626: false,
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
  votes: {
    label: 'veBAL votes',
    title:
      'The percentage of votes for each pool for the next period. This is based on voting by veBAL holders based on their collective voting power.',
  },
}
