import { Circle, HStack, Image, Spacer, Text, VStack } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'

export function TokenInfo({
  iconURL,
  symbol,
  name,
  amount,
  value,
}: {
  iconURL: string
  symbol: string
  name: string
  amount: number
  value?: number
}) {
  return (
    <HStack w="full" spacing="5">
      <Circle bg="background.level4" color="font.secondary" shadow="lg" size={16}>
        <VStack>
          <Image src={iconURL || undefined} borderRadius="full" />
        </VStack>
      </Circle>
      <VStack w="full">
        <HStack alignItems="start" w="full">
          <Text fontWeight="bold">{symbol}</Text>
          <Spacer />
          <Text fontWeight="bold">{amount}</Text>
        </HStack>

        <HStack alignItems="start" w="full">
          <Text variant="secondary">{name}</Text>
          <Spacer />
          <Text variant="secondary">{value ? `$${fNum('fiat', value)}` : 'Value TBD'}</Text>
        </HStack>
      </VStack>
    </HStack>
  )
}
