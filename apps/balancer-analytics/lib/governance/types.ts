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
}

export type GovernancePayload = {
  items: GovernanceProposal[]
  generatedAt: number
  space: string
}
