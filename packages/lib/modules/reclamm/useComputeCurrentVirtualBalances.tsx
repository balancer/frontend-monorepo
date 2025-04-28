import { getChainId } from 'config/app.config'
import { usePool } from '../pool/PoolProvider'
import { reClammPoolAbi } from '../web3/contracts/abi/generated'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export function useComputeCurrentVirtualBalances() {
  const { pool, chain } = usePool()
  const chainId = getChainId(chain)

  const query = useReadContract({
    chainId,
    abi: reClammPoolAbi,
    address: pool.address as Address,
    functionName: 'computeCurrentVirtualBalances',
  })

  return {
    ...query,
    virtualBalances: {
      virtualBalanceA: query.data?.[0],
      virtualBalanceB: query.data?.[1],
    },
  }
}
