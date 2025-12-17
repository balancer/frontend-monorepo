import { getNetworkConfig } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useBalance, useConfig } from 'wagmi'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { getBalance } from 'wagmi/actions'
import { useTokens } from '../tokens/TokensProvider'
import { useQueries } from '@tanstack/react-query'

export function useHasNativeBalance(chain: GqlChain) {
  const { userAddress, isConnected } = useUserAccount()
  const networkConfig = getNetworkConfig(chain)

  const { data: balance } = useBalance({
    chainId: networkConfig.chainId,
    address: userAddress,
    query: {
      enabled: isConnected,
      staleTime: 30_000,
    },
  })

  if (!isConnected) {
    return true // Default to true when not connected (neutral state)
  }

  return balance && !bn(balance.value).isZero()
}

export function useNativeTokenBalances(chains: GqlChain[]) {
  const config = useConfig()
  const { userAddress, isConnected } = useUserAccount()

  const balanceQueries = useQueries({
    queries: chains.map(chain => {
      const networkConfig = getNetworkConfig(chain)
      return {
        queryKey: ['native-balance', chain, userAddress],
        queryFn: async () =>
          getBalance(config, {
            chainId: networkConfig.chainId,
            address: userAddress,
          }),
        enabled: isConnected && !!userAddress,
        staleTime: 30_000,
      }
    }),
  })

  return useNativeTokenBalancesValues(balanceQueries, chains, isConnected)
}

export function useNativeTokenBalancesValues(
  balanceQueries: Array<{ data?: { value: bigint; decimals: number } }>,
  chains: GqlChain[],
  isConnected: boolean
) {
  const { priceFor } = useTokens()

  return !isConnected
    ? {}
    : Object.fromEntries(
        balanceQueries.map(({ data }, index) => {
          const chain = chains[index]
          const networkConfig = getNetworkConfig(chain)
          const tokenPrice = priceFor(networkConfig.tokens.nativeAsset.address, chain) ?? 0
          const value =
            data && data.value
              ? bn(data.value).shiftedBy(-data.decimals).times(tokenPrice).toNumber()
              : 0
          return [chain, value]
        })
      )
}
