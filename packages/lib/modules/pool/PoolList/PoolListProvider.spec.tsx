import { PoolList as PoolListType } from '@repo/lib/modules/pool/pool.types'
import { defaultPoolListMock, mockPoolList } from '@repo/lib/test/msw/handlers/PoolList.handlers'
import { aGqlPoolMinimalMock } from '@repo/lib/test/msw/builders/gqlPoolMinimal.builders'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { usePoolListLogic } from './PoolListProvider'
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing'
import { getDefaultPoolListQueryVariables } from './defaultPoolListQuery'

async function renderUsePoolsList({
  wrapper = withNuqsTestingAdapter(),
  hookProps,
}: {
  wrapper?: ReturnType<typeof withNuqsTestingAdapter>
  hookProps?: Parameters<typeof usePoolListLogic>[0]
} = {}) {
  const { result, waitForLoadedUseQuery } = testHook(() => usePoolListLogic(hookProps), {
    wrapper,
  })
  await waitForLoadedUseQuery(result)
  return result
}

test('Returns pool list', async () => {
  const result = await renderUsePoolsList()

  expect(result.current.pools).toEqual(defaultPoolListMock)
})

test('Returns pool list with a custom mocked GQL pool', async () => {
  const mockedList: PoolListType = [aGqlPoolMinimalMock({ name: 'FOO BAL' })]

  mockPoolList(mockedList)

  const result = await renderUsePoolsList()

  expect(result.current.pools[0].name).toEqual('FOO BAL')
})

test('Uses seeded initial pool list data for the default query before the network resolves', async () => {
  const seededList: PoolListType = [aGqlPoolMinimalMock({ name: 'SEEDED BAL' })]
  const networkList: PoolListType = [aGqlPoolMinimalMock({ name: 'NETWORK BAL' })]

  mockPoolList(networkList)

  const { result, waitForLoadedUseQuery } = testHook(
    () =>
      usePoolListLogic({
        initialCount: seededList.length,
        initialPools: seededList,
        initialQueryVariables: getDefaultPoolListQueryVariables(),
      }),
    {
      wrapper: withNuqsTestingAdapter(),
    }
  )

  expect(result.current.loading).toBe(false)
  expect(result.current.pools[0].name).toBe('SEEDED BAL')

  await waitForLoadedUseQuery(result)

  expect(result.current.pools[0].name).toBe('NETWORK BAL')
})

test('Does not use seeded initial pool list data when the query state differs from the default view', async () => {
  const seededList: PoolListType = [aGqlPoolMinimalMock({ name: 'SEEDED BAL' })]
  const networkList: PoolListType = [aGqlPoolMinimalMock({ name: 'FILTERED BAL' })]

  mockPoolList(networkList)

  const { result, waitForLoadedUseQuery } = testHook(
    () =>
      usePoolListLogic({
        initialCount: seededList.length,
        initialPools: seededList,
        initialQueryVariables: getDefaultPoolListQueryVariables(),
      }),
    {
      wrapper: withNuqsTestingAdapter({ searchParams: '?textSearch=stable' }),
    }
  )

  expect(result.current.loading).toBe(true)
  expect(result.current.pools).toEqual([])

  await waitForLoadedUseQuery(result)

  expect(result.current.pools[0].name).toBe('FILTERED BAL')
})

test('Returns count as 0 while the non-seeded query is still unresolved', () => {
  const { result } = testHook(() => usePoolListLogic(), {
    wrapper: withNuqsTestingAdapter({ searchParams: '?textSearch=stable' }),
  })

  expect(result.current.pools).toEqual([])
  expect(result.current.count).toBe(0)
})
