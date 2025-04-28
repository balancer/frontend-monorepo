import { getChainId } from 'config/app.config'
import { usePool } from '../pool/PoolProvider'
import { reClammPoolAbi } from '../web3/contracts/abi/generated'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { useGetPoolTokenInfo } from './useGetPoolTokenInfo'

export function useComputeInvariant() {
  const { pool, chain } = usePool()
  const { balances } = useGetPoolTokenInfo()

  const chainId = getChainId(chain)

  const query = useReadContract({
    chainId,
    abi: reClammPoolAbi,
    address: pool.address as Address,
    functionName: 'computeInvariant',
    args: [balances || [], 1], // ROUND_DOWN
    query: { enabled: !!balances && balances.length === 2 },
  })

  return {
    ...query,
    invariant: query.data,
  }
}
