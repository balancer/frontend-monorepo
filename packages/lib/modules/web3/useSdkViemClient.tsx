import { Client, publicActions, SignableMessage } from 'viem'
import { useWalletClient } from 'wagmi'
import { PublicWalletClient } from '@balancer/sdk'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { privateKeyToAccount } from 'viem/accounts'

const TEST_PRIVATE_KEY = '0xd30650ad825c0bde8ac3895b2294e151af2c2722bf0af3d94c011df930d8f483'

export function useSdkWalletClient() {
  const { data, isLoading } = useWalletClient()

  let sdkClient = data

  if (sdkClient && shouldUseAnvilFork) {
    sdkClient = sdkClient.extend(client => ({
      async signTypedData(args: { account: `0x${string}`; [key: string]: any }) {
        return mockSignature(client, args.account)
      },
      async signMessage(args: { account: `0x${string}`; message: SignableMessage }) {
        const signature = await client.signMessage({
          account: privateKeyToAccount(TEST_PRIVATE_KEY),
          message: args.message,
        })

        await client.request({
          method: 'anvil_impersonateSignature' as any, // Method not available in viem
          params: [[signature, args.account]] as any,
        })

        return signature
      },
    }))
  }

  return {
    sdkClient: sdkClient ? (sdkClient.extend(publicActions) as PublicWalletClient) : undefined,
    isLoading,
  }
}

async function mockSignature(client: Client, account: `0x${string}`) {
  console.log(`
        Mocking ${account} signature for testing. For errors related
        to how the signature is made this may not be the best option.`)

  const signature = '0x' + 'b'.repeat(130) // 65-byte dummy

  await client.request({
    method: 'anvil_impersonateSignature' as any, // Method not available in viem
    params: [[signature, account]] as any,
  })

  return signature
}
