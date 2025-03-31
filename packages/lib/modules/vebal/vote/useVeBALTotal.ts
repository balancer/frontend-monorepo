import { mainnet } from 'viem/chains'
import { useReadContract } from 'wagmi'
import { AbiMap } from '../../web3/contracts/AbiMap'
import { Hex } from 'viem'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { toUnixTimestamp } from '@repo/lib/shared/utils/time'
import { bn } from '@repo/lib/shared/utils/numbers'

export function useVeBALTotal(timestamp: number) {
  const { data, isLoading } = useReadContract({
    chainId: mainnet.id,
    abi: AbiMap['balancer.veBAL'],
    address: mainnetNetworkConfig.contracts.veBAL as Hex,
    functionName: 'totalSupply',
    args: [BigInt(toUnixTimestamp(timestamp))],
    query: { enabled: true },
  })

  const totalAmount = data !== undefined ? Number(bn(data).div(bn(10).pow(18))) : undefined

  return { totalAmount, isLoading }
}
