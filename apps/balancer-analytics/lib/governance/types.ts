export type ProposalState = 'active' | 'closed' | 'pending'

export type GovernanceProposal = {
  id: string
  title: string
  state: ProposalState
  author: string
  start: number
  end: number
  scoresTotal: number
  choices: string[]
  scores: number[]
  link: string
  /** Snapshot `votes` count — number of unique voters that have signed for
   *  this proposal so far. `0` for pending proposals. */
  votesCount: number
  /** Quorum target in voting-power units (matches `scoresTotal` units).
   *  `0` when the space hasn't configured a quorum strategy. */
  quorum: number
  /** Forum / discussion URL set by the proposer when submitting on
   *  Snapshot. Falls back to a forum.balancer.fi BIP search using the
   *  parsed `bipNumber` when Snapshot's field is empty. `null` only when
   *  neither source could resolve a URL (rare). */
  discussion: string | null
  /** Parsed BIP number from `BIP-XXX:` / `BIP-XXX:` style title prefixes.
   *  `null` when the title doesn't follow the convention (one-off
   *  proposals, retro framework votes). */
  bipNumber: number | null
}

export type GovernancePayload = {
  items: GovernanceProposal[]
  generatedAt: number
  space: string
}
