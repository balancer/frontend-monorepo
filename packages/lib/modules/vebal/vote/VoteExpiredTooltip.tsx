import {
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react'

interface Props {
  usePortal?: boolean
}

export function VoteExpiredTooltip({ usePortal }: Props) {
  const popoverContent = (
    <PopoverContent bg="background.level3" minWidth={['100px', '170px']} p="sm" shadow="3xl">
      <VStack alignItems="start" spacing="sm" width="full">
        <Text color={'font.secondary'} fontSize="md" fontWeight={700}>
          Expired pool gauge
        </Text>
        <Text color="font.secondary" fontSize="sm">
          This pool gauge that collects votes from veBAL holders to distribute BAL liquidity
          incentives is no longer active. If you have active votes to this pool, reallocate them to
          active pool gauges to avoid wasting your vote.
        </Text>
      </VStack>
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      <>
        <PopoverTrigger>
          <Badge background="red.400" color="font.dark" textTransform="unset">
            Expired
          </Badge>
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
