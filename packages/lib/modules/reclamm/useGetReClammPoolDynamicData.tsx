import { getChainId } from 'config/app.config'
import { usePool } from '../pool/PoolProvider'
import { reClammPoolAbi } from '../web3/contracts/abi/generated'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export function useGetReClammPoolDynamicData() {
  const { pool, chain } = usePool()
  const chainId = getChainId(chain)

  const query = useReadContract({
    chainId,
    abi: reClammPoolAbi,
    address: pool.address as Address,
    functionName: 'getReClammPoolDynamicData',
  })

  return {
    ...query,
    dynamicData: query.data,
  }
}
