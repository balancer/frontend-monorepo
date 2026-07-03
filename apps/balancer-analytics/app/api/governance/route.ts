/**
 * Latest 5 Balancer governance proposals (BIPs) from the `balancer.eth`
 * Snapshot space, cached server-side. Single shared fetch via the route
 * cache (`revalidate = 600`) keeps Snapshot's public GraphQL endpoint out
 * of the per-visitor hot path.
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import {
  UpstreamError,
  gqlFetch,
  upstreamErrorToResponse,
} from '@analytics/lib/upstream/gql'
import type { GovernancePayload, ProposalState } from '@analytics/lib/governance/types'

export const runtime = 'nodejs'
export const revalidate = 600

const SNAPSHOT_URL = 'https://hub.snapshot.org/graphql'
const SPACE = 'balancer.eth'
const LIMIT = 10

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
      votes
      quorum
      discussion
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
  votes: number | null
  quorum: number | null
  discussion: string | null
}

function normalizeState(state: string): ProposalState {
  if (state === 'active' || state === 'closed' || state === 'pending') return state
  return 'closed'
}

function snapshotLink(id: string, link: string | null): string {
  if (link && link.startsWith('http')) return link
  return `https://snapshot.box/#/s:${SPACE}/proposal/${id}`
}

// "BIP-123: Enable X" / "[BIP-123] …" / "BIP - 123 …". Pulls the integer.
// Returns `null` for one-off proposals that don't follow the convention.
const BIP_RX = /\bBIP[\s-]*0*(\d+)\b/i

function parseBipNumber(title: string): number | null {
  const m = BIP_RX.exec(title)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) && n > 0 ? n : null
}

// forum.balancer.fi is a Discourse instance. Topic slugs include the BIP
// number so a search-style URL lands on the discussion thread reliably
// even when the proposer didn't fill Snapshot's `discussion` field.
function discussionFallback(bipNumber: number | null): string | null {
  if (bipNumber === null) return null
  return `https://forum.balancer.fi/search?q=BIP-${bipNumber}`
}

function resolveDiscussion(raw: string | null, bipNumber: number | null): string | null {
  if (raw && raw.startsWith('http')) return raw
  return discussionFallback(bipNumber)
}

async function buildPayload(): Promise<GovernancePayload> {
  const data = await gqlFetch<{ proposals: RawProposal[] }>(
    SNAPSHOT_URL,
    QUERY,
    { space: SPACE, first: LIMIT },
    { upstream: 'snapshot', label: 'latest-proposals', cache: 'no-store' }
  )
  const proposals = data?.proposals ?? []
  return {
    items: proposals.map(p => {
      const bipNumber = parseBipNumber(p.title)
      return {
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
        votesCount: p.votes ?? 0,
        quorum: p.quorum ?? 0,
        discussion: resolveDiscussion(p.discussion, bipNumber),
        bipNumber,
      }
    }),
    generatedAt: Math.floor(Date.now() / 1000),
    space: SPACE,
  }
}

// Fixed cache key — no params, so this is at most one Snapshot.org call per
// revalidate window across all visitors, regardless of what the URL string
// contains. Errors are caught outside the cached function so failure
// responses aren't cached (next call will retry the upstream).
// Cache key bumped to `-v2` after raising the proposal limit from 5 → 10.
// Old cached payloads carried only 5 rows; bumping the key forces the
// next hit to refetch and serve the wider set immediately instead of
// waiting for the 10-min revalidate window to expire.
const getGovernancePayload = unstable_cache(
  buildPayload,
  ['governance-v2'],
  { revalidate: 600, tags: ['governance-v2'] }
)

export async function GET() {
  try {
    // Browser/CDN cache aligned with the server-side `revalidate: 600` —
    // governance proposals tick slowly; 10-min freshness is generous.
    return Response.json(await getGovernancePayload(), {
      headers: {
        // Short browser cache + long server-side stale-allowed window.
        // The browser re-asks every 30s so a newly-passed proposal shows
        // up within ~minute, while `unstable_cache` (10-min revalidate)
        // still spares Snapshot from per-visit traffic.
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    const now = Math.floor(Date.now() / 1000)
    const empty: GovernancePayload = { items: [], generatedAt: now, space: SPACE }
    // Same typed upstream-error mapping as /api/biggest-swaps and
    // /api/pool/[chain]/[id]/order-flow — a Snapshot.org rate limit now
    // surfaces as HTTP 429 with `error: 'rate_limited'` so the client UI
    // can render the same "wait and retry" message it does for api-v3.
    if (err instanceof UpstreamError) {
      const mapped = upstreamErrorToResponse(err, {
        includeDevDetail: process.env.NODE_ENV !== 'production',
      })
      return Response.json(
        { ...empty, ...mapped.body },
        { status: mapped.status, headers: mapped.headers }
      )
    }
    return Response.json(
      { ...empty, error: String(err) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
