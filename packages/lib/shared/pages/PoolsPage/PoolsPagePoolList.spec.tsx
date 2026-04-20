import { render, screen } from '@testing-library/react'
import { aGqlPoolMinimalMock } from '@repo/lib/test/msw/builders/gqlPoolMinimal.builders'
import { getDefaultPoolListQueryVariables } from '@repo/lib/modules/pool/PoolList/defaultPoolListQuery'
import { PoolsPagePoolList } from './PoolsPagePoolList'

vi.mock('@repo/lib/modules/pool/PoolList/PoolList', () => ({
  PoolList: ({
    initialCount,
    initialPools,
    fixedChains,
    fixedPoolTypes,
  }: {
    initialCount?: number
    initialPools?: Array<{ name: string }>
    fixedChains?: string[]
    fixedPoolTypes?: string[]
  }) => (
    <div>
      <div data-testid="pool-list-count">{initialCount}</div>
      <div data-testid="pool-list-first-row">{initialPools?.[0]?.name}</div>
      <div data-testid="pool-list-fixed-chains">{fixedChains?.join(',')}</div>
      <div data-testid="pool-list-fixed-pool-types">{fixedPoolTypes?.join(',')}</div>
    </div>
  ),
}))

test('passes seeded pool-list props through to PoolList', () => {
  render(
    <PoolsPagePoolList
      initialCount={1}
      initialPools={[aGqlPoolMinimalMock({ name: 'SEEDED BAL' })]}
      initialQueryVariables={getDefaultPoolListQueryVariables()}
    />
  )

  expect(screen.getByTestId('pool-list-count')).toHaveTextContent('1')
  expect(screen.getByTestId('pool-list-first-row')).toHaveTextContent('SEEDED BAL')
})

test('passes through fixed route filters to PoolList', () => {
  render(
    <PoolsPagePoolList fixedChains={['SONIC' as never]} fixedPoolTypes={['COW_AMM' as never]} />
  )

  expect(screen.getByTestId('pool-list-fixed-chains')).toHaveTextContent('SONIC')
  expect(screen.getByTestId('pool-list-fixed-pool-types')).toHaveTextContent('COW_AMM')
})
