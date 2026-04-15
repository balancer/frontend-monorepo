import { useQueries } from '@tanstack/react-query'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import {
  getNativeAssetAddress,
  getNetworkConfig,
  getWrappedNativeAssetAddress,
} from '@repo/lib/config/app.config'
import { useTokens } from './TokensProvider'
import { Address, erc20Abi, formatUnits } from 'viem'
import { getBalance, multicall } from 'wagmi/actions'
import { useConfig } from 'wagmi'
import { useUserAccount } from '../web3/UserAccountProvider'
import { isAddress } from 'viem'
import { includesAddress } from '@repo/lib/shared/utils/addresses'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useMemo } from 'react'
import { captureNonFatalError } from '@repo/lib/shared/utils/query-errors'

const MIN_TOKEN_VALUE_USD = 1
const BALANCE_STALE_TIME = 30_000

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

  const balanceQueries = useQueries({
    queries: chains.map(chain => {
      const networkConfig = getNetworkConfig(chain)
      const chainTokens = getTokensByChain(chain)
      const nativeAddress = getNativeAssetAddress(chain)
      const erc20Tokens = chainTokens.filter(
        token => !includesAddress([nativeAddress], token.address)
      )

      return {
        queryKey: ['wallet-token-balances', chain, userAddress, erc20Tokens.length],
        queryFn: async () => {
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
                      chainId: networkConfig.chainId,
                      abi: erc20Abi,
                      address: token.address as Address,
                      functionName: 'balanceOf',
                      args: [userAddress as Address],
                    })),
                    allowFailure: true,
                    batchSize: 0,
                  })
                : Promise.resolve([]),
            ])

            return { nativeBalance, tokenBalances, erc20Tokens, chain }
          } catch (error) {
            captureNonFatalError({
              error,
              errorName: 'WalletTokenBalancesError',
              errorMessage: `Error fetching wallet balances for chain ${chain}`,
            })
            throw error
          }
        },
        enabled: enabled && isConnected && isAddress(userAddress) && !isLoadingTokens,
        staleTime: BALANCE_STALE_TIME,
      }
    }),
  })

  const tokenBalancesByChain = useMemo(() => {
    const result = new Map<GqlChain, string[]>()

    if (!enabled) return result

    chains.forEach((chain, index) => {
      const query = balanceQueries[index]
      if (!query?.data) return

      const tokenAddresses: string[] = []
      const nativeAddress = getNativeAssetAddress(chain)
      const wrappedNativeAddress = getWrappedNativeAssetAddress(chain)
      const { nativeBalance, tokenBalances, erc20Tokens } = query.data

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
    })

    return result
  }, [enabled, chains, balanceQueries, priceFor])

  const isLoading =
    isLoadingTokens || isLoadingTokenPrices || balanceQueries.some(q => q.isLoading || q.isFetching)

  const errors = balanceQueries.map(q => q.error).filter(Boolean)

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
