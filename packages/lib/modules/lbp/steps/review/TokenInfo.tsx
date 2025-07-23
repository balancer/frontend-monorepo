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
    <HStack spacing="md" w="full">
      <Circle bg="background.level4" color="font.secondary" shadow="lg" size={12}>
        <VStack>
          <Image borderRadius="full" src={iconURL || undefined} />
        </VStack>
      </Circle>
      <VStack gap="xxs" w="full">
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
