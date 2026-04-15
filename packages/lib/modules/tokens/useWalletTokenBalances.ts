import { useQuery } from '@tanstack/react-query'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import {
  getNativeAssetAddress,
  getNetworkConfig,
  getWrappedNativeAssetAddress,
} from '@repo/lib/config/app.config'
import { useTokens } from './TokensProvider'
import { Address, formatUnits } from 'viem'
import { getBalance, multicall } from 'wagmi/actions'
import { useConfig } from 'wagmi'
import { useUserAccount } from '../web3/UserAccountProvider'
import { isAddress } from 'viem'
import { includesAddress } from '@repo/lib/shared/utils/addresses'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useMemo, useCallback } from 'react'
import { captureNonFatalError } from '@repo/lib/shared/utils/query-errors'
import { chunkArray } from '@repo/lib/shared/utils/array'

const MIN_TOKEN_VALUE_USD = 1
const BALANCE_STALE_TIME = 30_000
const PARALLEL_CHAINS = 3

const minimalErc20Abi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export type WalletTokenBalance = {
  address: string
  chain: GqlChain
  balance: bigint
  usdValue: number
}

export function useWalletTokenBalances(chains: GqlChain[], enabled: boolean) {
  const { userAddress, isConnected } = useUserAccount()
  const config = useConfig()
  const { getTokensByChain, priceFor, isLoadingTokens, isLoadingTokenPrices } = useTokens()

  // Fetch balances for a single chain
  const fetchChainBalances = useCallback(
    async (chain: GqlChain) => {
      const networkConfig = getNetworkConfig(chain)
      const chainTokens = getTokensByChain(chain)
      const nativeAddress = getNativeAssetAddress(chain)
      const erc20Tokens = chainTokens.filter(
        token => !includesAddress([nativeAddress], token.address)
      )

      try {
        const [nativeBalance, tokenBalances] = await Promise.all([
          getBalance(config, {
            chainId: networkConfig.chainId,
            address: userAddress as Address,
          }),
          erc20Tokens.length > 0
            ? multicall(config, {
                chainId: networkConfig.chainId,
                contracts: erc20Tokens.map(token => ({
                  abi: minimalErc20Abi,
                  address: token.address as Address,
                  functionName: 'balanceOf',
                  args: [userAddress as Address],
                })),
                allowFailure: true,
              })
            : Promise.resolve([]),
        ])

        return { nativeBalance, tokenBalances, erc20Tokens, chain, success: true as const }
      } catch (error) {
        captureNonFatalError({
          error,
          errorName: 'WalletTokenBalancesError',
          errorMessage: `Error fetching wallet balances for chain ${chain}`,
        })
        return { chain, success: false as const, error }
      }
    },
    [config, userAddress, getTokensByChain]
  )

  // Fetch all balances in batches of PARALLEL_CHAINS
  const balanceQuery = useQuery({
    queryKey: ['wallet-token-balances', chains.join(','), userAddress, PARALLEL_CHAINS],
    queryFn: async () => {
      const chainChunks = chunkArray(chains, PARALLEL_CHAINS)
      const results: Awaited<ReturnType<typeof fetchChainBalances>>[] = []

      for (const chunk of chainChunks) {
        // Process this chunk in parallel
        const chunkResults = await Promise.all(chunk.map(fetchChainBalances))
        results.push(...chunkResults)
      }

      return results
    },
    enabled: enabled && isConnected && isAddress(userAddress) && !isLoadingTokens,
    staleTime: BALANCE_STALE_TIME,
  })

  const tokenBalancesByChain = useMemo(() => {
    const result = new Map<GqlChain, string[]>()

    if (!enabled || !balanceQuery.data) return result

    for (const chainResult of balanceQuery.data) {
      if (!chainResult.success) continue
      const { chain, nativeBalance, tokenBalances, erc20Tokens } = chainResult

      const tokenAddresses: string[] = []
      const nativeAddress = getNativeAssetAddress(chain)
      const wrappedNativeAddress = getWrappedNativeAssetAddress(chain)

      const nativePrice = priceFor(nativeAddress, chain)
      const nativeBalanceUsd = bn(formatUnits(nativeBalance.value, nativeBalance.decimals)).times(
        nativePrice
      )

      if (nativeBalanceUsd.gte(MIN_TOKEN_VALUE_USD)) {
        tokenAddresses.push(nativeAddress, wrappedNativeAddress)
      }

      erc20Tokens.forEach((token, tokenIndex) => {
        const balanceResult = tokenBalances[tokenIndex]
        if (balanceResult?.status !== 'success') return

        const amount = balanceResult.result as bigint
        if (amount <= 0n) return

        const usdValue = bn(formatUnits(amount, token.decimals)).times(
          priceFor(token.address, chain)
        )

        if (usdValue.gte(MIN_TOKEN_VALUE_USD) && !includesAddress(tokenAddresses, token.address)) {
          tokenAddresses.push(token.address)
        }
      })

      if (tokenAddresses.length > 0) {
        result.set(chain, tokenAddresses)
      }
    }

    return result
  }, [enabled, chains, balanceQuery.data, priceFor])

  const isLoading = isLoadingTokens || isLoadingTokenPrices || balanceQuery.isLoading

  const errors = balanceQuery.data
    ? balanceQuery.data
        .filter((r): r is { success: false; error: unknown; chain: GqlChain } => !r.success)
        .map(r => r.error)
    : []

  const hasBalance = (chain: GqlChain, tokenAddress: string): boolean => {
    if (!tokenAddress) return false
    const tokenAddresses = tokenBalancesByChain.get(chain) || []
    return includesAddress(tokenAddresses, tokenAddress)
  }

  return {
    tokenBalancesByChain,
    isLoading,
    errors,
    hasBalance,
  }
}
