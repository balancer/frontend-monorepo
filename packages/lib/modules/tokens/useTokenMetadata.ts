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

export type TokenMetadataByChain = {
  chain: GqlChain
  metadata: TokenMetadata
}

type TokenMetadataResult = {
  result?: string | number | bigint
}

type TokenMetadataContracts = {
  address: Address
  chainId: number
  abi: typeof erc20Abi
  functionName: 'name' | 'symbol' | 'decimals' | 'totalSupply'
}

function buildTokenMetadataContracts(address: Address, chain: GqlChain): TokenMetadataContracts[] {
  const chainId = getChainId(chain)
  return [
    {
      address,
      chainId,
      abi: erc20Abi,
      functionName: 'name',
    },
    {
      address,
      chainId,
      abi: erc20Abi,
      functionName: 'symbol',
    },
    {
      address,
      chainId,
      abi: erc20Abi,
      functionName: 'decimals',
    },
    {
      address,
      chainId,
      abi: erc20Abi,
      functionName: 'totalSupply',
    },
  ]
}

function parseTokenMetadata(
  name?: TokenMetadataResult,
  symbol?: TokenMetadataResult,
  decimals?: TokenMetadataResult,
  totalSupply?: TokenMetadataResult,
  isLoading?: boolean
): TokenMetadata {
  const nameResult = typeof name?.result === 'string' ? name.result : undefined
  const symbolResult = typeof symbol?.result === 'string' ? symbol.result : undefined
  const decimalsResultRaw = decimals?.result
  const decimalsResult =
    typeof decimalsResultRaw === 'number'
      ? decimalsResultRaw
      : typeof decimalsResultRaw === 'bigint'
        ? Number(decimalsResultRaw)
        : undefined
  const totalSupplyResultRaw = totalSupply?.result
  const totalSupplyResult =
    typeof totalSupplyResultRaw === 'number' || typeof totalSupplyResultRaw === 'bigint'
      ? totalSupplyResultRaw
      : undefined

  return {
    name: nameResult,
    symbol: symbolResult,
    decimals: decimalsResult,
    totalSupply:
      totalSupplyResult && decimalsResult !== undefined
        ? bn(totalSupplyResult).shiftedBy(-decimalsResult).toNumber()
        : undefined,
    isLoading: !!isLoading,
  }
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
    contracts: address ? buildTokenMetadataContracts(address, chain) : [],
  })

  const [name, symbol, decimals, totalSupply] = tokenData ?? []

  return parseTokenMetadata(name, symbol, decimals, totalSupply, isLoading)
}

export function useTokenMetadataAcrossChains(
  maybeAddress: string,
  chains: GqlChain[]
): { match?: TokenMetadataByChain; isLoading: boolean } {
  const address = useMemo(() => {
    return isAddress(maybeAddress) ? (maybeAddress as Address) : undefined
  }, [maybeAddress])

  const contracts = useMemo(() => {
    if (!address) return []
    return chains.flatMap(chain => buildTokenMetadataContracts(address, chain))
  }, [address, chains])

  const { data: tokenData, isLoading } = useReadContracts({
    query: {
      enabled: !!address,
    },
    contracts,
  })

  let match: TokenMetadataByChain | undefined
  if (tokenData && chains.length) {
    for (let index = 0; index < chains.length; index += 1) {
      const offset = index * 4
      const [name, symbol, decimals, totalSupply] = tokenData.slice(offset, offset + 4)
      const metadata = parseTokenMetadata(name, symbol, decimals, totalSupply, isLoading)
      if (metadata.symbol) {
        match = { chain: chains[index], metadata }
        break
      }
    }
  }

  return { match, isLoading }
}
