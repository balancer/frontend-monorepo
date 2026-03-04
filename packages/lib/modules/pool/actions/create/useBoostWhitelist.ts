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
const BOOSTED_FILTER = ['boosted_aave', 'boosted_morpho']

export const useBoostWhitelist = (tokenAddress: Address | undefined) => {
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

  const filteredBoostWhitelist = boostWhitelist
    ?.filter(list => BOOSTED_FILTER.includes(list.id))
    .map(list => {
      return {
        ...list,
        addresses: list.addresses[chainId] || [],
      }
    })

  const boostWhitelistMetadta = filteredBoostWhitelist?.map(protocol => {
    return {
      name: protocol.name,
      tokens: protocol.addresses.map(address => getToken(address, network)),
    }
  })

  const boostTokenOptions =
    boostWhitelistMetadta
      ?.map(protocol => {
        return {
          protocol: protocol.name,
          token: protocol.tokens.find(boostedToken =>
            isSameAddress(boostedToken?.underlyingTokenAddress || '', tokenAddress)
          ),
        }
      })
      .filter(({ token }) => !!token) || []

  return boostTokenOptions.length > 0 ? boostTokenOptions : undefined
}
