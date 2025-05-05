import { Badge, HStack } from '@chakra-ui/react'
import { ArrowDownIcon } from '@repo/lib/shared/components/icons/ArrowDownIcon'
import { ArrowUpIcon } from '@repo/lib/shared/components/icons/ArrowUpIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

interface Props {
  gain: BigNumber
}

export function GainBadge({ gain }: Props) {
  const { toCurrency } = useCurrency()

  return (
    <Badge
      background={
        gain ? (gain.gt(0) ? 'green.500' : gain.lt(0) ? 'red.400' : 'font.secondary') : undefined
      }
      borderRadius="full"
      color="font.dark"
      pr="sm"
      userSelect="none"
    >
      <HStack spacing="0">
        {gain.lt(0) ? (
          <ArrowDownIcon height="12" width="12" />
        ) : gain.gt(0) ? (
          <ArrowUpIcon height="12" width="12" />
        ) : (
          ''
        )}
        <>{toCurrency(gain.abs(), { abbreviated: false })}</>
      </HStack>
    </Badge>
  )
}
