import { render, screen } from '@testing-library/react'
import { aGqlPoolMinimalMock } from '@repo/lib/test/msw/builders/gqlPoolMinimal.builders'
import { getDefaultPoolListQueryVariables } from '@repo/lib/modules/pool/PoolList/defaultPoolListQuery'
import { PoolsPagePoolList } from './PoolsPagePoolList'
import React from 'react'

vi.mock('nuqs/adapters/next/app', () => ({
  NuqsAdapter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="nuqs-adapter">{children}</div>
  ),
}))

vi.mock('@repo/lib/modules/pool/PoolList/PoolList', () => ({
  PoolList: ({
    initialCount,
    initialPools,
  }: {
    initialCount?: number
    initialPools?: Array<{ name: string }>
  }) => (
    <div>
      <div data-testid="pool-list-count">{initialCount}</div>
      <div data-testid="pool-list-first-row">{initialPools?.[0]?.name}</div>
    </div>
  ),
}))

test('wraps the pool list in a route-local NuqsAdapter', () => {
  render(
    <PoolsPagePoolList
      initialCount={1}
      initialPools={[aGqlPoolMinimalMock({ name: 'SEEDED BAL' })]}
      initialQueryVariables={getDefaultPoolListQueryVariables()}
    />
  )

  expect(screen.getByTestId('nuqs-adapter')).toBeInTheDocument()
  expect(screen.getByTestId('pool-list-count')).toHaveTextContent('1')
  expect(screen.getByTestId('pool-list-first-row')).toHaveTextContent('SEEDED BAL')
})
