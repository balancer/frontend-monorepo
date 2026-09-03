import { Hex } from 'viem'
import { useUserAccount } from './UserAccountProvider'
import { useSafeTxQuery } from '../transactions/transaction-steps/safe/useSafeTxQuery'
import { useWalletConnectMetadata } from './wallet-connect/useWalletConnectMetadata'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

// Returns true when using a Safe Smart account:
// - app running as a Safe App
// - user connected via WalletConnect to a Safe Account
export function useIsSafeAccount(): boolean {
  const isSafeApp = useIsSafeApp()
  const { isSafeAccountViaWalletConnect } = useWalletConnectMetadata()
  return isSafeApp || isSafeAccountViaWalletConnect
}

// Returns true when app is running as a Safe App (it excludes Safe accounts connected via WalletConnect)
export function useIsSafeApp(): boolean {
  const { connector } = useUserAccount()
  return connector?.id === 'safe'
}

/*
  If the app is running as a Safe App (connected with a Safe Account) it will return the Safe App transaction hash from the logs
  instead of the wagmi tx hash
  Eventually this will be supported by viem/wagmi natively so we will be able to remove this hook
  More info: https://github.com/wevm/wagmi/issues/2461
 */
type Props = {
  chainId: number
  wagmiTxHash: Hex | undefined
}

export function useTxHash({ wagmiTxHash }: Props) {
  /*
  Only Safe Apps use Safe Tx Hash
  Safe Accounts connected via WalletConnect use wagmiTxHash like a regular account
  */
  const isSafeApp = useIsSafeApp()

  const { isLoading: isSafeTxLoading, data: safeTxHash } = useSafeTxQuery({
    enabled: isSafeApp,
    wagmiTxHash,
  })

  const txHash = isSafeApp ? safeTxHash : wagmiTxHash

  return { txHash, isSafeTxLoading }
}

export function useSafeAppLink() {
  const { chain } = useNetworkConfig()

  if (chain === GqlChainValues.Hyperevm) {
    return `https://safe.onchainden.com/share/safe-app?appUrl=https%3A%2F%2F${PROJECT_CONFIG.projectId}.fi%2Fpools&chain=hyperevm`
  }

  return `https://app.safe.global/share/safe-app?appUrl=https://${PROJECT_CONFIG.projectId}.fi/pools`
}
