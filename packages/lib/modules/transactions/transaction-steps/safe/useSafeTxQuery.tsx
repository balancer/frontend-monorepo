import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import SafeAppsSDK, { TransactionStatus } from '@safe-global/safe-apps-sdk'
import { useQuery } from '@tanstack/react-query'
import { Address, Hex } from 'viem'
import { useUserAccount } from '../../../web3/UserAccountProvider'

type Props = {
  enabled: boolean
  wagmiTxHash: Hex | undefined
}

/*
  Given a wagmiTxHash, uses the SafeAppsSDK to poll the status of a Safe transaction
  and return the matching safeTxHash
*/
export function useSafeTxQuery({ enabled, wagmiTxHash }: Props) {
  const { userAddress } = useUserAccount()

  async function queryFn(): Promise<Address | undefined> {
    if (wagmiTxHash) {
      const safeAppsSdk = new SafeAppsSDK()
      return await pollSafeTxStatus(safeAppsSdk, wagmiTxHash)
    }
  }

  return useQuery({
    queryKey: ['safeHash', userAddress, wagmiTxHash],
    queryFn,
    enabled: enabled && !!wagmiTxHash && !!userAddress,
    ...onlyExplicitRefetch,
  })
}

export async function pollSafeTxStatus(sdk: SafeAppsSDK, txHash: Address): Promise<Address> {
  while (true) {
    console.log('Polling safe transaction status...')
    const safeTxDetails = await sdk.txs.getBySafeTxHash(txHash)

    // if safe tx is successful, return the on chain tx hash
    if (safeTxDetails?.txStatus === TransactionStatus.SUCCESS && safeTxDetails.txHash) {
      return safeTxDetails.txHash as `0x${string}`
    }

    if (safeTxDetails?.txStatus === TransactionStatus.FAILED) {
      throw new Error('Error polling Safe tx: Safe transaction failed')
    }

    if (safeTxDetails?.txStatus === TransactionStatus.CANCELLED) {
      throw new Error('Error polling Safe tx: Safe transaction was cancelled')
    }

    await new Promise(resolve => setTimeout(resolve, 3000)) // poll every 3 seconds
  }
}
