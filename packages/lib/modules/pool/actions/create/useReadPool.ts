import { balancerV3Contracts, vaultExtensionAbi_V3 } from '@balancer/sdk'
import { useQuery } from '@tanstack/react-query'
import { type Address, erc20Abi, formatUnits, parseAbi } from 'viem'
import { usePublicClient } from 'wagmi'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { useSearchParams } from 'next/navigation'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export const useReadPool = (pool: Address | '', chainId: number) => {
  const client = usePublicClient()
  const vaultAddress = chainId
    ? balancerV3Contracts.Vault[chainId as keyof typeof balancerV3Contracts.Vault]
    : undefined

  const { tokenList } = usePoolCreationForm()
  const searchParams = useSearchParams()
  const network = searchParams.get('network')

  return useQuery({
    queryKey: ['PoolContract', { pool, chainId }],
    queryFn: async () => {
      if (!pool) throw new Error('Pool address is required')
      if (!client) throw new Error('Client is required')
      if (!vaultAddress) throw new Error(`Vault not found for chainId: ${chainId}`)

      const [name, symbol, isRegistered, poolTokenInfo, poolConfig, normalizedWeights] =
        await Promise.all([
          // fetch data about BPT from pool contract
          client.readContract({
            abi: parseAbi(['function name() view returns (string)']),
            address: pool,
            functionName: 'name',
          }) as Promise<string>,
          client.readContract({
            abi: parseAbi(['function symbol() view returns (string)']),
            address: pool,
            functionName: 'symbol',
          }) as Promise<string>,
          // fetch more data about pool from vault contract
          client.readContract({
            abi: parseAbi(['function isPoolRegistered(address) view returns (bool)']),
            address: vaultAddress,
            functionName: 'isPoolRegistered',
            args: [pool],
          }),
          client
            .readContract({
              abi: vaultExtensionAbi_V3,
              address: vaultAddress,
              functionName: 'getPoolTokenInfo',
              args: [pool],
            })
            .catch(() => []),
          client
            .readContract({
              abi: vaultExtensionAbi_V3,
              address: vaultAddress,
              functionName: 'getPoolConfig',
              args: [pool],
            })
            .catch(() => undefined), // return undefined if pool has not been registered
          client
            .readContract({
              abi: parseAbi(['function getNormalizedWeights() view returns (uint256[])']),
              address: pool,
              functionName: 'getNormalizedWeights',
              args: [],
            })
            .catch(() => undefined), // return undefined if pool does not have normalized weights
          // client
          //   .readContract({
          //     abi: vaultExtensionAbi_V3,
          //     address: vaultAddress,
          //     functionName: "getHooksConfig",
          //     args: [pool],
          //   })
          //   .catch(() => undefined), // return undefined if pool has not been registered
        ])

      const tokenConfigs = []

      for (let i = 0; i < poolTokenInfo[0].length; i++) {
        const address = poolTokenInfo[0][i]

        let tokenInfo = tokenList?.find(
          token => token.address.toLowerCase() === address.toLowerCase()
        )

        if (!tokenInfo) {
          const symbol = await client.readContract({
            abi: erc20Abi,
            address,
            functionName: 'symbol',
          })
          const name = await client.readContract({
            abi: erc20Abi,
            address,
            functionName: 'name',
          })
          const decimals = await client.readContract({
            abi: erc20Abi,
            address,
            functionName: 'decimals',
          })

          tokenInfo = {
            address,
            name,
            decimals,
            symbol,
            chainId,
            chain: network as GqlChain, // Convert chainId to GqlChain
          }
        }

        tokenConfigs.push({
          address,
          weight: normalizedWeights ? formatUnits(normalizedWeights[i], 16) : undefined,
          rateProvider: poolTokenInfo[1][i].rateProvider,
          tokenInfo,
        })
      }

      return {
        address: pool,
        symbol,
        name,
        isRegistered,
        poolTokenInfo,
        tokenConfigs,
        poolConfig,
        // hooksConfig,
      }
    },
    enabled: !!pool && !!tokenList,
  })
}
