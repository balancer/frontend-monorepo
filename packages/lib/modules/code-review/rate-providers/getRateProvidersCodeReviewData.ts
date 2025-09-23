import { mins } from '@repo/lib/shared/utils/time'
import { Address } from 'viem'

const RATE_PROVIDERS_CODE_REVIEW_DATA_URL =
  'https://raw.githubusercontent.com/balancer/code-review/refs/heads/main/rate-providers/registry.json'

type RateProvidersUpgradeableComponent = {
  entrypoint: Address
  implementationReviewed: Address
}

export type RateProvidersCodeReviewData = {
  chain: string
  address: Address
  asset: Address
  name: string
  summary: string
  review: string
  warnings: string[]
  factory: Address | ''
  upgradeableComponents: RateProvidersUpgradeableComponent[]
}

export async function getRateProvidersCodeReviewData(): Promise<
  RateProvidersCodeReviewData[] | undefined
> {
  try {
    const res = await fetch(RATE_PROVIDERS_CODE_REVIEW_DATA_URL, {
      next: { revalidate: mins(15).toSecs() },
    })

    const raw = (await res.json()) as Record<
      string,
      Record<string, Omit<RateProvidersCodeReviewData, 'chain' | 'address'>>
    >

    const flattened: RateProvidersCodeReviewData[] = []
    for (const [chain, providers] of Object.entries(raw)) {
      for (const [address, data] of Object.entries(providers)) {
        flattened.push({
          chain,
          address: address as Address,
          asset: data.asset,
          name: data.name,
          summary: data.summary,
          review: data.review,
          warnings: data.warnings ?? [],
          factory: (data as any).factory ?? '',
          upgradeableComponents: data.upgradeableComponents ?? [],
        })
      }
    }

    return flattened
  } catch (error) {
    console.error('Unable to fetch rate providers code review data', error)
    return undefined
  }
}
