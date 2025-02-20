import { getChainId } from '@repo/lib/config/app.config'
import { useReadContract } from 'wagmi'
import { gyroEclpPoolAbi } from '../web3/contracts/abi/generated'
import { Pool } from '../pool/pool.types'
import { Address } from 'viem'

export function useGetTokenRates(pool: Pool) {
  const chainId = getChainId(pool.chain)

  const query = useReadContract({
    chainId,
    abi: gyroEclpPoolAbi,
    address: pool.address as Address,
    functionName: 'getTokenRates',
  })

  return {
    ...query,
    data: query.data,
  }
}
