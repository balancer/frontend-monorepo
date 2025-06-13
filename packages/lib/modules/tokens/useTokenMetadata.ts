import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMemo } from 'react'
import { Address, erc20Abi, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import { bn } from '@repo/lib/shared/utils/numbers'

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
  const address = useMemo(() => {
    return isAddress(maybeAddress) ? (maybeAddress as Address) : undefined
  }, [maybeAddress])

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

  return {
    name: name?.result,
    symbol: symbol?.result,
    decimals: decimals?.result,
    totalSupply:
      totalSupply?.result && decimals?.result
        ? bn(totalSupply.result).shiftedBy(-decimals.result).toNumber()
        : undefined,
    isLoading,
  }
}
