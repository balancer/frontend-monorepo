import { getNetworkConfig } from '@/lib/config/app.config'
import { SupportedChainId } from '@/lib/config/config.types'
import { ensureError } from '@/lib/shared/utils/errors'
import { PublicWalletClient, Relayer } from '@balancer/sdk'
import { Address } from 'viem'

export async function signRelayerApproval(
  userAddress: Address,
  chainId: SupportedChainId,
  client?: PublicWalletClient
): Promise<Address | undefined> {
  if (!client) return undefined

  const relayerV6Address = getNetworkConfig(chainId).contracts.balancer.relayerV6

  try {
    const signature = await Relayer.signRelayerApproval(relayerV6Address, userAddress, client)
    return signature
  } catch (e: unknown) {
    const error = ensureError(e)
    // When the user explicitly rejects in the wallet we return undefined to ignore the error and do nothing
    if (error.name === 'UserRejectedRequestError') return
    throw error
  }
}
