import { GqlPoolAprItem } from '@repo/lib/shared/services/api/generated/graphql'

export function formatApr(apr: string): string {
  const numApr = parseFloat(apr)
  if (numApr > 1000) {
    return `${(numApr / 1000).toFixed(1)}K%`
  }
  return `${numApr.toFixed(2)}%`
}

export function getTotalApr(aprItems: GqlPoolAprItem[]): [number, number] {
  const total = aprItems.reduce((sum, item) => sum + item.apr, 0)
  return [total, total]
}

export function getTotalAprLabel(aprItems: GqlPoolAprItem[]): string {
  const [, total] = getTotalApr(aprItems)
  return formatApr(total.toString())
}
