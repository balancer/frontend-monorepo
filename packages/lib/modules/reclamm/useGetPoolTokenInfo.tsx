import { getChainId } from '@repo/lib/config/app.config'
import { usePool } from '../pool/PoolProvider'
import { vaultExtensionAbi_V3 } from '@balancer/sdk'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { getVaultConfig } from '../pool/pool.helpers'

export function useGetPoolTokenInfo() {
  const { pool, chain } = usePool()

  const chainId = getChainId(chain)
  const { vaultAddress } = getVaultConfig(pool)

  const query = useReadContract({
    chainId,
    abi: vaultExtensionAbi_V3,
    address: vaultAddress,
    functionName: 'getPoolTokenInfo',
    args: [pool.address as Address],
  })

  return {
    ...query,
    balances: query.data?.[3],
  }
}
