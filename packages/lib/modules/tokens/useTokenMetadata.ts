import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMemo } from 'react'
import { Address, erc20Abi, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

export type TokenMetadata = {
  name: string | undefined
  symbol: string | undefined
  totalSupply: number | undefined
  decimals: number | undefined
  isLoading: boolean
}

/**
 * Hook to fetch ERC20 token metadata from a contract
 * @param address The token contract address
 * @param chain The chain the token is deployed on
 * @returns Token metadata including name, symbol, decimals and total supply
 */
export function useTokenMetadata(maybeAddress: string, chain: GqlChain): TokenMetadata {
  const publicClient = usePublicClient()

  const address = useMemo(() => {
    return isAddress(maybeAddress) ? (maybeAddress as Address) : undefined
  }, [maybeAddress])

  const formatTotalSupply = (
    totalSupply: bigint | undefined,
    decimals: number | undefined
  ): number | undefined => {
    return totalSupply && decimals ? bn(totalSupply).shiftedBy(-decimals).toNumber() : undefined
  }

  const { data: tokenData, isLoading } = useReadContracts({
    query: {
      enabled: !!address,
    },
    contracts: [
      {
        address,
        chainId: getChainId(chain),
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address,
        chainId: getChainId(chain),
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address,
        chainId: getChainId(chain),
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address,
        chainId: getChainId(chain),
        abi: erc20Abi,
        functionName: 'totalSupply',
      },
    ],
  })

  const [name, symbol, decimals, totalSupply] = tokenData ?? []

  const tokenMetadata = {
    name: name?.result,
    symbol: symbol?.result,
    decimals: decimals?.result,
    totalSupply: formatTotalSupply(totalSupply?.result, decimals?.result),
    isLoading,
  }

  const isHyperEvm = chain === GqlChain.Hyperevm

  /**
   * NOTES:
   * - publicClient.multicall still fucked even tho confirmed that publicClient.chain is hyperEVM and multicall3 contract is correct / exists
   * - seems like viem / wagmi somehow not compatible with multicall3 on hyperEvm
   * - maybe view / wagmi chain / transport is defaulting to wanchan testnet that viem has as cannonical chainId 999 instead of our custom chain override for hype
   */
  const { data: hyperEvmTokenData, isLoading: isHypeTokenDataLoading } = useQuery({
    queryKey: ['hyperEvmTokenData', address, chain],
    enabled: !!address && isHyperEvm,
    queryFn: async () => {
      if (!publicClient || !address)
        throw new Error('Missing requirements for fetch hyperEvmTokenData')

      return await Promise.all([
        publicClient.readContract({
          address,
          abi: erc20Abi,
          functionName: 'name',
        }),
        publicClient.readContract({
          address,
          abi: erc20Abi,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address,
          abi: erc20Abi,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          address,
          abi: erc20Abi,
          functionName: 'totalSupply',
        }),
      ])
    },
  })

  const [hypeName, hypeSymbol, hypeDecimals, hypeTotalSupply] = hyperEvmTokenData ?? []

  const hyperEvmTokenMetadata = {
    name: hypeName,
    symbol: hypeSymbol,
    decimals: hypeDecimals,
    totalSupply: formatTotalSupply(hypeTotalSupply, hypeDecimals),
    isLoading: isHypeTokenDataLoading,
  }

  return isHyperEvm ? hyperEvmTokenMetadata : tokenMetadata
}
