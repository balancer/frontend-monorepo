import { useQuery } from '@tanstack/react-query'
import { GqlChain } from '../services/api/generated/graphql'
import { getViemClient } from '../services/viem/viem.client'
import { formatUnits } from 'viem'
import { bn, fNum } from '../utils/numbers'
import { secs } from '../utils/time'
import { Box, HStack, Text } from '@chakra-ui/react'
import { GasIcon } from '../components/icons/GasIcon'
import { onlyExplicitRefetch } from '../utils/queries'

function getGasPrice(chain: GqlChain) {
  const client = getViemClient(chain)
  return client.getGasPrice()
}

function formatGasPrice(gasPrice: bigint): string {
  return fNum('integer', formatUnits(gasPrice, 9))
}

function highGasPriceFor(chain: GqlChain) {
  if (chain === GqlChain.Mainnet) return 50
  return 500
}

export function GasPriceCard({ chain }: { chain: GqlChain }) {
  const { gasPrice, isHighGasPrice } = useGasPriceQuery(chain)

  const gasPriceColor = isHighGasPrice ? 'red.500' : 'grayText'

  return (
    <Box p="xs" shadow="sm" background="background.level3" rounded="sm" color={gasPriceColor}>
      <HStack spacing="xs">
        <GasIcon size={16} />
        <Text color={gasPriceColor} fontWeight="bold" fontSize="xs">
          {gasPrice ? gasPrice.toString() : '-'}
        </Text>
      </HStack>
    </Box>
  )
}

export function useGasPriceQuery(chain: GqlChain) {
  const query = useQuery({
    queryKey: ['gasPrice', chain],
    queryFn: () => getGasPrice(chain),
    refetchInterval: secs(30).toMs(),
    gcTime: secs(30).toMs(),
    ...onlyExplicitRefetch,
  })

  const gasPrice = query.data ? formatGasPrice(query.data) : undefined

  const isHighGasPrice = gasPrice ? bn(gasPrice).gte(highGasPriceFor(chain)) : false

  return { ...query, gasPrice, isHighGasPrice }
}
