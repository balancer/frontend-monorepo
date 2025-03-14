import { getChainId } from '@repo/lib/config/app.config'
import { useReadContract } from 'wagmi'
import { gyroEclpPoolAbi } from '../../web3/contracts/abi/generated'
import { Pool } from '../../pool/pool.types'
import { Address } from 'viem'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetTokenRates(pool: Pool) {
  const chainId = getChainId(pool.chain)

  const query = useReadContract({
    chainId,
    abi: gyroEclpPoolAbi,
    address: pool.address as Address,
    functionName: 'getTokenRates',
    query: { enabled: pool.type === GqlPoolType.Gyroe },
  })

  return {
    ...query,
    data: query.data,
  }
}
