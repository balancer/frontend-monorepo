'use client'

export type ChangelogTag = 'v3' | 'v2' | 'gov' | 'infra'

export type ChangelogItem = {
  id: string
  title: string
  tag: ChangelogTag
  /** Days ago, used to derive `relativeTime`. */
  daysAgo: number
  relativeTime: string
}

// Hardcoded for now. Real source is TBD — candidates are a CMS, a JSON file
// in this repo updated alongside releases, or a small Notion / Sanity feed.
// The shape is shared with the future loader so the UI doesn't change.
const ITEMS: Omit<ChangelogItem, 'relativeTime'>[] = [
  {
    id: 'stable-surge-mainnet',
    title: 'StableSurge hook activated on 12 mainnet pools',
    tag: 'v3',
    daysAgo: 1,
  },
  {
    id: 'plasma-vault',
    title: 'Plasma vault deployment confirmed (analytics live)',
    tag: 'infra',
    daysAgo: 3,
  },
  {
    id: 'boosted-rollout',
    title: 'Boosted pool program rolled out across Aave + Morpho',
    tag: 'v3',
    daysAgo: 8,
  },
  {
    id: 'dao-revenue',
    title: 'Governance proposal: 100% revenue to DAO ratified',
    tag: 'gov',
    daysAgo: 14,
  },
  {
    id: 'reclamm-launch',
    title: 'reCLAMM pools live on Balancer v3',
    tag: 'v3',
    daysAgo: 21,
  },
]

function relativeDays(days: number): string {
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function useProtocolChangelog({ limit = 4 }: { limit?: number } = {}) {
  const items: ChangelogItem[] = ITEMS.slice(0, limit).map(it => ({
    ...it,
    relativeTime: relativeDays(it.daysAgo),
  }))
  return { items }
}
