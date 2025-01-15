import { VotesState } from '@repo/lib/modules/vebal/vote/vote.types'

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
