import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { shouldShowNetworkFilters } from './PoolListFilters'

describe('shouldShowNetworkFilters', () => {
  it('hides network filters when only one network is supported', () => {
    expect(shouldShowNetworkFilters([GqlChain.Sonic])).toBe(false)
  })

  it('shows network filters when multiple networks are supported', () => {
    expect(shouldShowNetworkFilters([GqlChain.Sonic, GqlChain.Optimism])).toBe(true)
  })
})
