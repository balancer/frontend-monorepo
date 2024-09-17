import { getGqlChain } from '@/lib/config/app.config'
import { getViemClient } from '@/lib/shared/services/viem/viem.client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Hex, parseAbiItem } from 'viem'
import { useUserAccount } from '../../web3/UserAccountProvider'

type Props = {
  hash: Hex | undefined
  chainId: number
  blockNumber?: bigint
}

export function useSafeAppLogs({ hash, chainId, blockNumber }: Props) {
  const [safeTxHash, setSafeTxHash] = useState<Hex | undefined>()
  const { userAddress } = useUserAccount()
  const viemClient = getViemClient(getGqlChain(chainId))

  const safeLogs = useQuery({
    queryKey: ['safeLogs', userAddress, hash],
    queryFn: () =>
      viemClient.getLogs({
        event: parseAbiItem(['event ExecutionSuccess(bytes32 txHash, uint256 payment)']),
        address: userAddress,
        fromBlock: blockNumber,
      }),
    select: data => data.find(log => log.args.txHash === hash),
    refetchInterval: safeTxHash ? 0 : 2000, // Refetch every 2 seconds until the safeTxHash is found
    enabled: !!hash && !!userAddress,
  })

  useEffect(() => {
    const txHash = safeLogs.data?.transactionHash
    if (txHash) {
      setSafeTxHash(txHash)
    }
  }, [safeLogs.data?.transactionHash, safeTxHash])

  return { safeTxHash }
}
