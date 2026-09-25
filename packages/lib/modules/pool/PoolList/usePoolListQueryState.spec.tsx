import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { act } from '@testing-library/react'
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing'
import { usePoolListQueryState } from './usePoolListQueryState'

const testAddress = '0x000000000000000000000000000000000000dEaD'

describe('Pool list state query', () => {
  it('toggles joinablePools and updates total filter count', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?first=20&skip=0' }),
    })

    expect(result.current.joinablePools).toBe(false)
    expect(result.current.totalFilterCount).toBe(0)
    expect(result.current.pagination.pageSize).toBe(20)
    expect(result.current.pagination.pageIndex).toBe(0)

    act(() => {
      result.current.toggleJoinablePools(true)
    })

    expect(result.current.joinablePools).toBe(true)
    expect(result.current.totalFilterCount).toBe(1)
    expect(result.current.pagination.pageSize).toBe(100)
    expect(result.current.pagination.pageIndex).toBe(0)

    act(() => {
      result.current.toggleJoinablePools(false)
    })

    expect(result.current.joinablePools).toBe(false)
    expect(result.current.pagination.pageSize).toBe(20)
    expect(result.current.pagination.pageIndex).toBe(0)
  })

  it('allows My positions and Joinable pools to be selected together', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: withNuqsTestingAdapter(),
    })

    act(() => {
      result.current.toggleUserAddress(true, testAddress)
    })

    expect(result.current.userAddress).toBe(testAddress)
    expect(result.current.joinablePools).toBe(false)

    act(() => {
      result.current.toggleJoinablePools(true)
    })

    expect(result.current.joinablePools).toBe(true)
    expect(result.current.userAddress).toBe(testAddress)

    act(() => {
      result.current.toggleUserAddress(true, testAddress)
    })

    expect(result.current.userAddress).toBe(testAddress)
    expect(result.current.joinablePools).toBe(true)
  })

  it('resetFilters clears joinablePools', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: withNuqsTestingAdapter(),
    })

    act(() => {
      result.current.toggleJoinablePools(true)
    })

    expect(result.current.joinablePools).toBe(true)

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.joinablePools).toBe(false)
  })

  it('returns zero totalFilterCount with no filters', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: withNuqsTestingAdapter(),
    })

    expect(result.current.totalFilterCount).toBe(0)
  })

  it('relaxes browse filters when searching by pool address', () => {
    const poolAddress = '0xAE4f5c7767db2931a7e82200C14EdCFf4A5fa1fE'

    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: withNuqsTestingAdapter({ searchParams: `?textSearch=${poolAddress}` }),
    })

    expect(result.current.queryVariables.where.poolTypeNotIn).toBeUndefined()
    expect(result.current.queryVariables.where.poolTypeIn).toBeUndefined()
    expect(result.current.queryVariables.where.reviewedOnly).toBe(false)
    expect(result.current.queryVariables.where.minTvl).toBeUndefined()
    expect(result.current.queryVariables.textSearch).toBe(poolAddress)
  })

  it('keeps LBP exclusion and reviewedOnly for non-address search', () => {
    const { result } = testHook(() => usePoolListQueryState(), {
      wrapper: withNuqsTestingAdapter({ searchParams: '?textSearch=wstETH' }),
    })

    expect(result.current.queryVariables.where.poolTypeNotIn).toEqual(['LIQUIDITY_BOOTSTRAPPING'])
    expect(result.current.queryVariables.where.reviewedOnly).toBe(true)
    expect(result.current.queryVariables.where.poolTypeIn).toBeDefined()
  })
})
