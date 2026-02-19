import { isProd } from '@repo/lib/config/app.config'
import { Capabilities, WalletClient } from 'viem'
import { mainnet } from 'viem/chains'

export async function has7702Support(wallet: WalletClient) {
  try {
    const capabilities = (await wallet.getCapabilities()) as Record<number, Capabilities>
    const eip7702Status = capabilities[mainnet.id]?.atomic?.status

    return eip7702Status === 'ready' || eip7702Status === 'supported'
  } catch (error) {
    if (!isProd) console.log(error)
    // Some wallets without support does not have the wallet_getCapabilites method (EIP-5792)
    return false
  }
}
