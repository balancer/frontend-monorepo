import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { useWatch } from 'react-hook-form'
import { usePoolCreationForm } from './PoolCreationFormProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'

type BoostWhitelistResponse = {
  id: string
  name: string
  description: string
  icon: string
  addresses: {
    [key: string]: Address[]
  }
}[]

const WHITELIST_URL = 'https://raw.githubusercontent.com/balancer/metadata/main/erc4626/index.json'
const PROTOCOL_FILTER = ['boosted_aave', 'boosted_morpho', 'boosted_fluid']

export const useBoostedTokenOptions = (tokenAddress: string | undefined) => {
  const { getToken } = useTokens()
  const { poolCreationForm } = usePoolCreationForm()
  const [network] = useWatch({ control: poolCreationForm.control, name: ['network'] })
  const chainId = getChainId(network)

  const { data: boostWhitelist } = useQuery<BoostWhitelistResponse>({
    queryKey: ['boostWhitelist'],
    queryFn: async () => {
      const response = await fetch(WHITELIST_URL)
      return response.json()
    },
  })

  if (!boostWhitelist) return undefined

  const filteredWhitelist = boostWhitelist
    .filter(protocol => PROTOCOL_FILTER.includes(protocol.id))
    .map(protocol => {
      return {
        name: protocol.name,
        tokens: protocol.addresses[chainId].map(address => getToken(address, network)),
      }
    })

  const boostedTokenOptions = filteredWhitelist.flatMap(protocol => {
    const token = protocol.tokens.find(boostedToken =>
      isSameAddress(boostedToken?.underlyingTokenAddress || '', tokenAddress)
    )
    return token ? [{ protocol: protocol.name, token }] : []
  })

  return boostedTokenOptions.length > 0 ? boostedTokenOptions : undefined
}
