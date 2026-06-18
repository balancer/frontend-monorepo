import { describe, expect, it } from 'vitest'
import { GqlChainValues } from '@repo/lib/shared/services/api/generated/graphql-enums'
import { getWalletChainSyncAction } from './useWalletChainSync'

describe('getWalletChainSyncAction', () => {
  it('resets initialization when disconnected', () => {
    const action = getWalletChainSyncAction(false, true, GqlChainValues.Mainnet, GqlChainValues.Polygon)
    expect(action).toBe('reset')
  })

  it('initializes on first connection without syncing chain', () => {
    const action = getWalletChainSyncAction(true, false, GqlChainValues.Mainnet, GqlChainValues.Polygon)
    expect(action).toBe('init')
  })

  it('syncs chain when already initialized and wallet chain differs', () => {
    const action = getWalletChainSyncAction(true, true, GqlChainValues.Mainnet, GqlChainValues.Polygon)
    expect(action).toBe('sync')
  })

  it('does nothing when already initialized and wallet chain matches selected chain', () => {
    const action = getWalletChainSyncAction(true, true, GqlChainValues.Mainnet, GqlChainValues.Mainnet)
    expect(action).toBe('init')
  })
})
