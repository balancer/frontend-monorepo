import { publicActions } from 'viem'
import { useWalletClient } from 'wagmi'
import { PublicWalletClient } from '@balancer/sdk'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'

export function useSdkWalletClient() {
  const { data, isLoading } = useWalletClient()

  let sdkClient = data

  if (sdkClient && shouldUseAnvilFork) {
    sdkClient = sdkClient.extend(client => ({
      async signTypedData(args: { account: `0x${string}`; [key: string]: any }) {
        console.log(`
        Mocking ${args.account} signature for testing. For errors related
        to how the signature is made this may not be the best option.`)

        const mockSignature = '0x' + 'b'.repeat(130) // 65-byte dummy

        await client.request({
          method: 'anvil_impersonateSignature' as any, // Method not available in viem
          params: [[mockSignature, args.account]] as any,
        })

        return mockSignature
      },
    }))
  }

  return {
    sdkClient: sdkClient ? (sdkClient.extend(publicActions) as PublicWalletClient) : undefined,
    isLoading,
  }
}
