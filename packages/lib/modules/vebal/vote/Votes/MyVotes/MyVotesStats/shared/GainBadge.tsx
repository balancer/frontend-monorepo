import { Badge, HStack } from '@chakra-ui/react'
import { ArrowDownIcon } from '@repo/lib/shared/components/icons/ArrowDownIcon'
import { ArrowUpIcon } from '@repo/lib/shared/components/icons/ArrowUpIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

interface Props {
  gain: number
}

export function GainBadge({ gain }: Props) {
  const { toCurrency } = useCurrency()

  return (
    <Badge
      background={gain ? (gain > 0 ? 'green.500' : 'red.400') : undefined}
      borderRadius="full"
      color="font.dark"
      pr="sm"
      userSelect="none"
    >
      <HStack spacing="0">
        {gain ? (
          gain < 0 ? (
            <ArrowDownIcon height="12" width="12" />
          ) : (
            <ArrowUpIcon height="12" width="12" />
          )
        ) : undefined}
        <>{toCurrency(Math.abs(gain), { abbreviated: false })}</>
      </HStack>
    </Badge>
  )
}
