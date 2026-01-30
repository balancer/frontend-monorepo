import { Circle, HStack, Image, Text, VStack } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { fNum } from '@repo/lib/shared/utils/numbers'

export function TokenInfo({
  iconURL,
  symbol,
  name,
  amount,
  value,
  showValue = true,
  isFixedSale,
}: {
  iconURL: string
  symbol: string
  name: string
  amount: string
  value?: string
  showValue?: boolean
  isFixedSale?: boolean
}) {
  const { toCurrency } = useCurrency()

  return (
    <HStack spacing="md" w="full">
      <Circle bg="background.level4" color="font.secondary" shadow="lg" size={12}>
        <VStack>
          <Image borderRadius="full" src={iconURL || undefined} />
        </VStack>
      </Circle>
      <VStack gap="xxs" w="full">
        <HStack alignItems="start" w="full">
          <Text fontWeight="bold">{symbol}</Text>
          {showValue && (
            <Text fontWeight="bold" ml="auto">
              {fNum('token', amount, { abbreviated: false })}
            </Text>
          )}
        </HStack>
        <HStack alignItems="start" w="full">
          <Text variant="secondary">{name}</Text>
          {showValue && (
            <Text ml="auto" variant="secondary">
              {value
                ? isFixedSale
                  ? `at ~${toCurrency(value)} each`
                  : toCurrency(value)
                : 'Value TBD'}
            </Text>
          )}
        </HStack>
      </VStack>
    </HStack>
  )
}
