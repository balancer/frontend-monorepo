/**
 * Latest 5 Balancer governance proposals (BIPs) from the `balancer.eth`
 * Snapshot space, cached server-side. Single shared fetch via the route
 * cache (`revalidate = 600`) keeps Snapshot's public GraphQL endpoint out
 * of the per-visitor hot path.
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import type { GovernancePayload, ProposalState } from '@analytics/lib/governance/types'

export const runtime = 'nodejs'
export const revalidate = 600

const SNAPSHOT_URL = 'https://hub.snapshot.org/graphql'
const SPACE = 'balancer.eth'
const LIMIT = 5

const QUERY = /* GraphQL */ `
  query LatestProposals($space: String!, $first: Int!) {
    proposals(
      first: $first
      skip: 0
      where: { space: $space }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      state
      author
      start
      end
      choices
      scores
      scores_total
      link
    }
  }
`

type RawProposal = {
  id: string
  title: string
  state: string
  author: string
  start: number
  end: number
  choices: string[]
  scores: number[] | null
  scores_total: number | null
  link: string | null
}

function normalizeState(state: string): ProposalState {
  if (state === 'active' || state === 'closed' || state === 'pending') return state
  return 'closed'
}

function snapshotLink(id: string, link: string | null): string {
  if (link && link.startsWith('http')) return link
  return `https://snapshot.box/#/s:${SPACE}/proposal/${id}`
}

async function buildPayload(): Promise<GovernancePayload> {
  const res = await fetch(SNAPSHOT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: QUERY,
      variables: { space: SPACE, first: LIMIT },
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`snapshot HTTP ${res.status}`)
  const json = (await res.json()) as {
    data?: { proposals: RawProposal[] }
    errors?: unknown
  }
  if (json.errors) throw new Error(`snapshot errors: ${JSON.stringify(json.errors)}`)
  const proposals = json.data?.proposals ?? []
  return {
    items: proposals.map(p => ({
      id: p.id,
      title: p.title,
      state: normalizeState(p.state),
      author: p.author,
      start: p.start,
      end: p.end,
      choices: p.choices ?? [],
      scores: p.scores ?? [],
      scoresTotal: p.scores_total ?? 0,
      link: snapshotLink(p.id, p.link),
    })),
    generatedAt: Math.floor(Date.now() / 1000),
    space: SPACE,
  }
}

// Fixed cache key — no params, so this is at most one Snapshot.org call per
// revalidate window across all visitors, regardless of what the URL string
// contains. Errors are caught outside the cached function so failure
// responses aren't cached (next call will retry the upstream).
const getGovernancePayload = unstable_cache(
  buildPayload,
  ['governance'],
  { revalidate: 600, tags: ['governance'] }
)

export async function GET() {
  try {
    return Response.json(await getGovernancePayload())
  } catch (err) {
    const now = Math.floor(Date.now() / 1000)
    const empty: GovernancePayload = { items: [], generatedAt: now, space: SPACE }
    return Response.json({ ...empty, error: String(err) }, { status: 502 })
  }
}
