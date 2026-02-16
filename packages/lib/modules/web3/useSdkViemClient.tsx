import { publicActions, SignableMessage, TypedDataDomain } from 'viem'
import { useWalletClient } from 'wagmi'
import { PublicWalletClient } from '@balancer/sdk'
import { shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { privateKeyToAccount } from 'viem/accounts'
import { defaultAnvilAccount } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

const TEST_PRIVATE_KEY = '0xd30650ad825c0bde8ac3895b2294e151af2c2722bf0af3d94c011df930d8f483'

export function useSdkWalletClient() {
  const { data, isLoading } = useWalletClient()

  let sdkClient = data
  const connectedAccount = data?.account.address
  const shouldImpersonateSignatures = !isSameAddress(connectedAccount, defaultAnvilAccount)

  if (sdkClient && shouldUseAnvilFork && shouldImpersonateSignatures) {
    sdkClient = sdkClient.extend(client => ({
      async signTypedData(args: {
        account: `0x${string}`
        domain: TypedDataDomain
        types: any
        primaryType: string
        message: Record<string, unknown>
      }) {
        console.log(`
        Mocking ${args.account} signature for testing. For errors related
        to how the signature is made this may not be the best option.`)

        const signature = await client.signTypedData({
          account: privateKeyToAccount(TEST_PRIVATE_KEY),
          domain: args.domain,
          types: args.types,
          primaryType: args.primaryType,
          message: args.message,
        })

        await client.request({
          method: 'anvil_impersonateSignature' as any, // Method not available in viem
          params: [[signature, args.account]] as any,
        })

        return signature
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
