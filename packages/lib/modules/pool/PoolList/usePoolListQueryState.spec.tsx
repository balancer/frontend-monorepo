import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing'
import { usePoolListQueryState } from './usePoolListQueryState'

describe('Pool list state query', () => {
  it('calculates pagination based on first and skip', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?first=50&skip=150' }),
    })

    expect(result.current.pagination).toMatchInlineSnapshot(`
      {
        "pageIndex": 3,
        "pageSize": 50,
      }
    `)
  })

  it('returns zero totalFilterCount with no filters', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: withNuqsTestingAdapter(),
    })

    expect(result.current.totalFilterCount).toBe(0)
  })
})
