import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@tanstack/react-query'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { Address } from 'viem'
import { getCoingeckoNetworkName } from '../../helpers'

type Props = {
  token: Address | undefined
  network: GqlChain
}

export function useUnlistedTokenPrice({ token, network }: Props) {
  const { priceFor } = useTokens()
  const apiPriceForToken = token ? priceFor(token, network) : undefined
  const shouldFetchPrice = !apiPriceForToken && !!token && !!network

  const { data: cgPriceForToken } = useQuery({
    queryKey: ['unlisted-token-price', token, network],
    queryFn: async () => {
      const networkName = getCoingeckoNetworkName(network)
      const url = `https://api.coingecko.com/api/v3/simple/token_price/${networkName}?vs_currencies=usd&contract_addresses=${token}`
      const res = await fetch(url)
      const data: { [key: string]: { usd: number } } = await res.json()

      if (!res.ok) {
        throw new Error(`Failed to fetch CoinGecko price for ${token} on ${network}`)
      }

      return token ? data[token.toLowerCase()].usd : undefined
    },
    enabled: shouldFetchPrice,
  })

  return { cgPriceForToken }
}
