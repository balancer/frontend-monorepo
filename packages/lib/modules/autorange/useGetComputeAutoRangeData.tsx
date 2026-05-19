import { getChainId } from '@repo/lib/config/app.config'
import { usePool } from '../pool/PoolProvider'
import { reClammPoolAbi } from '../web3/contracts/abi/generated'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export function useGetComputeAutoRangeData() {
  const { pool, chain } = usePool()
  const chainId = getChainId(chain)

  const autoRangePoolContract = {
    address: pool.address as Address,
    abi: reClammPoolAbi,
    chainId,
  } as const

  const results = useReadContracts({
    contracts: [
      {
        ...autoRangePoolContract,
        functionName: 'computeCurrentPriceRange',
      },
      {
        ...autoRangePoolContract,
        functionName: 'computeCurrentVirtualBalances',
      },
      {
        ...autoRangePoolContract,
        functionName: 'getCurrentLiveBalances',
      },
      {
        ...autoRangePoolContract,
        functionName: 'getCenterednessMargin',
      },
      {
        ...autoRangePoolContract,
        functionName: 'isPoolWithinTargetRange',
      },
    ],
  })

  return {
    ...results,
    priceRange: results.data?.[0]?.result,
    virtualBalances: {
      virtualBalanceA: results.data?.[1]?.result?.[0],
      virtualBalanceB: results.data?.[1]?.result?.[1],
    },
    liveBalances: {
      liveBalanceA: results.data?.[2]?.result?.[0],
      liveBalanceB: results.data?.[2]?.result?.[1],
    },
    centerednessMargin: results.data?.[3]?.result,
    isPoolWithinTargetRange: results.data?.[4]?.result,
    tokenA: pool.poolTokens[0],
    tokenB: pool.poolTokens[1],
  }
}
