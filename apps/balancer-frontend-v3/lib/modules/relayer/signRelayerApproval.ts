import { getNetworkConfig } from '@/lib/config/app.config'
import { SupportedChainId } from '@/lib/config/config.types'
import { ensureError } from '@/lib/shared/utils/errors'
import { Relayer } from '@balancer/sdk'
import { Address, publicActions, walletActions } from 'viem'
import { GetWalletClientReturnType } from 'wagmi/actions'

// TODO: replace this type with the one exposed by the SDK (WIP)
type SignRelayerApprovalParams = Parameters<typeof Relayer.signRelayerApproval>
type SdkClient = SignRelayerApprovalParams[2]

export async function signRelayerApproval(
  userAddress: Address,
  chainId: SupportedChainId,
  client?: GetWalletClientReturnType
): Promise<Address | undefined> {
  if (!client) return undefined

  const publicClient = client.extend(publicActions).extend(walletActions) as SdkClient

  const relayerV6Address = getNetworkConfig(chainId).contracts.balancer.relayerV6

  try {
    const signature = await Relayer.signRelayerApproval(relayerV6Address, userAddress, publicClient)
    return signature
  } catch (e: unknown) {
    const error = ensureError(e)
    // When the user explicitly rejects in the wallet we return undefined to ignore the error and do nothing
    if (error.name === 'UserRejectedRequestError') return
    throw error
  }
}
