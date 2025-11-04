import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useQuery } from '@tanstack/react-query'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { Address } from 'viem'
import { getChainId } from '@repo/lib/config/app.config'

type CoingeckoAssetPlatform = {
  id: string
  chain_identifier: number
}

type Props = {
  token: Address | undefined
  network: GqlChain
}

export function useCoingeckoTokenPrice({ token, network }: Props) {
  const chainId = getChainId(network)
  const { priceFor } = useTokens()
  const apiPriceForToken = token ? priceFor(token, network) : undefined

  const { data: assetPlatforms } = useQuery({
    queryKey: ['coingecko-asset-platforms'],
    queryFn: async () => {
      const res = await fetch('/api/coingecko/chains')
      const data: CoingeckoAssetPlatform[] = await res.json()
      return data
    },
    staleTime: 86400000, // 24 hours
  })

  const assetPlatform = assetPlatforms?.find(platform => platform.chain_identifier === chainId)

  const shouldFetchPrice = !apiPriceForToken && !!token && !!network && !!assetPlatform

  const { data: cgPriceForToken } = useQuery({
    queryKey: ['unlisted-token-price', token, network],
    queryFn: async () => {
      const url = `https://api.coingecko.com/api/v3/simple/token_price/${assetPlatform?.id}?vs_currencies=usd&contract_addresses=${token}`
      const res = await fetch(url)
      const data: { [key: string]: { usd: number } } = await res.json()

      if (!res.ok) {
        throw new Error(`Failed to fetch CoinGecko price for ${token} on ${network}`)
      }

      return token ? data[token.toLowerCase()].usd : undefined
    },
    enabled: shouldFetchPrice,
    retry: false, // avoids rate limit if coingecko doesnt have price and returns 404?
  })

  return { cgPriceForToken }
}
