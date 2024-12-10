import { publicActions, walletActions } from 'viem'
import { useWalletClient } from 'wagmi'
import { PublicWalletClient } from '@balancer/sdk'

export function useSdkWalletClient() {
  const { data: sdkClient, isLoading } = useWalletClient()

  return {
    sdkClient: sdkClient
      ? (sdkClient.extend(publicActions).extend(walletActions) as PublicWalletClient)
      : undefined,
    isLoading,
  }
}
