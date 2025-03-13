import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useMemo } from 'react'
import { Address, erc20Abi, formatUnits, isAddress } from 'viem'
import { useReadContracts } from 'wagmi'

/**
 * Hook to fetch ERC20 token metadata from a contract
 * @param address The token contract address
 * @param chain The chain the token is deployed on
 * @returns Token metadata including name, symbol, decimals and total supply
 */
export function useTokenMetadata(maybeAddress: string, chain: GqlChain) {
  const address = useMemo(() => {
    return isAddress(maybeAddress) ? (maybeAddress as Address) : undefined
  }, [maybeAddress])

  const { data: tokenData } = useReadContracts({
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

  const [name, symbol, decimals, totalSupplyInt] = tokenData ?? []

  const totalSupply = useMemo(() => {
    return totalSupplyInt?.result && decimals?.result
      ? formatUnits(totalSupplyInt.result, decimals.result)
      : undefined
  }, [totalSupplyInt, decimals])

  return useMemo(() => {
    return {
      name: name?.result,
      symbol: symbol?.result,
      decimals: decimals?.result,
      totalSupply: totalSupply,
    }
  }, [name, symbol, decimals, totalSupply])
}
