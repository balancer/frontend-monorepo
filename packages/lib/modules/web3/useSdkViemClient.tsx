import { publicActions, walletActions } from 'viem'
import { useWalletClient } from 'wagmi'
import { PublicWalletClient } from '@balancer/sdk'

export function useSdkWalletClient(): PublicWalletClient | undefined {
  const { data: walletClient } = useWalletClient()
  if (!walletClient) return
  return walletClient.extend(publicActions).extend(walletActions) as PublicWalletClient
}
