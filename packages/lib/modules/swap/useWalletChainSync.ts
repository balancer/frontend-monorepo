import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type WalletChainSyncAction = 'reset' | 'sync' | 'init'

export function getWalletChainSyncAction(
  isConnected: boolean,
  hasInitialized: boolean,
  walletChain: GqlChain,
  selectedChain: GqlChain
): WalletChainSyncAction {
  if (!isConnected) return 'reset'
  if (hasInitialized && walletChain !== selectedChain) return 'sync'
  return 'init'
}
