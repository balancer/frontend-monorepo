import type { GqlPoolAprItem } from '@repo/lib/shared/services/api/graphql-derived-types'
import { GqlPoolAprItemTypeValues } from '@repo/lib/shared/services/api/graphql-enums'
import { describe, expect, test } from 'vitest'
import { getTotalApr } from './pool.utils'

describe('getTotalApr', () => {
  test('skips API APR values that BigNumber cannot parse', () => {
    const aprItems = [
      { type: GqlPoolAprItemTypeValues.SwapFee24h, apr: ' ' } as unknown as GqlPoolAprItem,
    ]

    const [minTotal, maxTotal] = getTotalApr(aprItems)

    expect(minTotal.toString()).toBe('0')
    expect(maxTotal.toString()).toBe('0')
  })
})
