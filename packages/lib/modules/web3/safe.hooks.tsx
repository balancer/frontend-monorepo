import { useBlockNumber } from 'wagmi'
import { useUserAccount } from './UserAccountProvider'
import { useSafeAppLogs } from '../transactions/transaction-steps/useSafeAppTransaction'
import { Hex } from 'viem'

// Returns true if the user is connected with a Safe Account
export function useIsSafeApp(): boolean {
  const { connector } = useUserAccount()

  return connector?.id === 'safe'
}

type Props = {
  chainId: number
  wagmiTxHash: Hex | undefined
}

/*
  If the app is running as a Safe App (connected with a Safe Account) it will return the Safe App transaction hash from the logs
  instead of the wagmi tx hash
  Eventually this will be supported by viem/wagmi natively so we will be able to remove this hook
  More info: https://github.com/wevm/wagmi/issues/2461
 */
export function useTxHash({ chainId, wagmiTxHash }: Props) {
  // Maybe we need to cache the first block number
  const { data: blockNumber } = useBlockNumber({ chainId })

  const isSafeApp = useIsSafeApp()

  const { safeTxHash } = useSafeAppLogs({
    hash: wagmiTxHash,
    chainId,
    blockNumber: blockNumber,
  })

  const txHash = isSafeApp ? safeTxHash : wagmiTxHash

  return { txHash, isSafeTxLoading: isSafeApp && !!wagmiTxHash && !safeTxHash }
}
