import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { usePoolListQueryState } from './usePoolListQueryState'

function updateUrlQueryString(queryString: `?${string}`) {
  window.location.href = 'http://app.balancer.fi/' + queryString
}

// TODO: For some reason the test no longer respects the update of the window.location.href
// This is why we have .skip. It happend in the transition to monorepo.
describe.skip('Pool list state query', () => {
  // Setting window.location.href no longer works in unit tests. Looks like the
  // nuqs package is being actively worked on for the nextjs app router. So may
  // be possible again in the future. https://nuqs.47ng.com/docs/testing
  it.skip('calculates pagination based on first and ', () => {
    updateUrlQueryString('?first=50&skip=150')
    const { result } = testHook(() => usePoolListQueryState())

    expect(result.current.pagination).toMatchInlineSnapshot(`
      {
        "pageIndex": 3,
        "pageSize": 50,
      }
    `)
  })

  it('calculates pagination based on first and ', () => {
    const { result } = testHook(() => usePoolListQueryState())

    expect(result.current.totalFilterCount).toBe(0)
  })
})
