import { Card, Text, HStack, VStack } from '@chakra-ui/react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { PoolTokenWeightsCard } from '../steps/fund/PoolTokenWeightsCard'
import { validatePoolType } from '../validatePoolCreationForm'

export function PoolSummary() {
  const { poolType } = usePoolCreationForm()
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)

  return (
    <VStack spacing="md">
      <PoolTitleCard />
      <PoolTokenAmountsCard />
      {isWeightedPool && <PoolTokenWeightsCard variant="modalSubSection" />}
      <PoolDetailsCard />
    </VStack>
  )
}

function PoolTitleCard() {
  const { poolTokens, symbol, network } = usePoolCreationForm()

  return (
    <Card variant="modalSubSection">
      <VStack align="start" spacing="md">
        <Text color="font.secondary">{symbol}</Text>
        <HStack>
          <NetworkIcon bg="background.level4" chain={network} shadow="lg" size={8} />
          {poolTokens.map((token, idx) => (
            <Card
              bg="background.level4"
              key={idx}
              paddingY="sm"
              rounded="full"
              variant="subSection"
            >
              <HStack key={token.address}>
                <TokenIcon
                  address={token.address}
                  alt={token.address || ''}
                  chain={network}
                  size={20}
                />
                <Text>{token.data?.symbol}</Text>
              </HStack>
            </Card>
          ))}
        </HStack>
      </VStack>
    </Card>
  )
}

function PoolTokenAmountsCard() {
  const { poolTokens, network } = usePoolCreationForm()
  const { usdValueForTokenAddress } = useTokens()
  const { toCurrency } = useCurrency()

  const poolTokenAmounts = poolTokens
    .map(token => {
      const { data, address } = token
      if (!data || !address) return null

      const { chain, symbol, name } = data

      const usdValue = usdValueForTokenAddress(address, chain, token.amount)
      return { address, symbol, name, amount: token.amount, usdValue }
    })
    .filter(token => token !== null)

  return (
    <Card variant="modalSubSection">
      <VStack align="start" spacing="md">
        <Text>You’re seeding the pool with</Text>
        {poolTokenAmounts.map(({ address, symbol, amount, usdValue, name }) => (
          <HStack justify="space-between" key={address} w="full">
            <HStack align="center" spacing="sm">
              <TokenIcon address={address} alt={address || ''} chain={network} size={40} />
              <VStack align="start" spacing="xxs">
                <Text fontWeight="bold">{symbol}</Text>
                <Text color="font.secondary" fontSize="sm">
                  {name}
                </Text>
              </VStack>
            </HStack>
            <VStack align="end">
              <Text fontWeight="bold">{amount}</Text>
              <Text color="font.secondary" fontSize="sm">
                {toCurrency(usdValue)}
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Card>
  )
}

function PoolDetailsCard() {
  const { swapFeePercentage } = usePoolCreationForm()

  return (
    <Card variant="modalSubSection">
      <VStack align="start" spacing="md">
        <HStack justify="space-between" w="full">
          <Text color="font.secondary">Swap fee percentage: {swapFeePercentage}%</Text>
          <Text color="font.secondary">Details</Text>
        </HStack>
      </VStack>
    </Card>
  )
}
