import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'

export function voteToPool(vote: VotingPoolWithData) {
  return {
    displayTokens: vote.tokens.map(token => ({ ...token, name: token.symbol })), // fix: (votes) no name
    type: vote.type,
    chain: vote.chain,
    poolTokens: [],
    address: vote.address,
    protocolVersion: 3, // fix: (votes) no data
    hasAnyAllowedBuffer: false, // fix: (votes) no data
    hasErc4626: false, // fix: (votes) no data
  }
}
