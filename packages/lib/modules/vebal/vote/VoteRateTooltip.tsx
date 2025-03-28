import { ArrowUpIcon } from '@repo/lib/shared/components/icons/ArrowUpIcon'
import { ArrowDownIcon } from '@repo/lib/shared/components/icons/ArrowDownIcon'
import {
  HStack,
  Text,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  VStack,
  StackProps,
  Badge,
  Box,
} from '@chakra-ui/react'
import { useMemo, ReactNode } from 'react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { VotesState } from '@repo/lib/modules/vebal/vote/vote.types'

interface TooltipItemProps extends StackProps {
  label: ReactNode
  value: ReactNode
}

function TooltipItem({ label, value, color, ...props }: TooltipItemProps) {
  return (
    <HStack justifyContent="space-between" {...props}>
      <Text color={color ?? 'font.primary'} fontSize="sm">
        {label}
      </Text>
      <Text color={color ?? 'font.primary'} fontSize="sm">
        {value}
      </Text>
    </HStack>
  )
}

function formatVotesAsPercent(votes: number): string {
  const normalizedVotes = Math.abs(votes)
  return fNum('apr', normalizedVotes)
}

interface Props {
  votes?: number
  votesNextPeriod?: number
  votesState?: VotesState
  usePortal?: boolean
}

export function VoteRateTooltip({ votes, votesState, votesNextPeriod, usePortal = true }: Props) {
  const votesThisPeriodText = votes ? formatVotesAsPercent(votes) : undefined
  const votesNextPeriodText = votesNextPeriod ? formatVotesAsPercent(votesNextPeriod) : undefined

  const voteDifference = votes && votesNextPeriod ? votesNextPeriod - votes : undefined

  const voteDifferenceText = useMemo(() => {
    return formatVotesAsPercent(voteDifference ? voteDifference : 0)
  }, [voteDifference])

  const differenceIcon = !voteDifference ? undefined : voteDifference > 0 ? (
    <ArrowUpIcon />
  ) : (
    <ArrowDownIcon />
  )

  const badgeColor =
    !voteDifference || voteDifference === 0 ? 'white' : voteDifference > 0 ? 'green' : 'red'

  const votesColor =
    votesState === 'normal' ? undefined : votesState === 'close' ? 'font.warning' : 'red.400'

  // const voteState = {
  //   currentPeriodVebal: '-',
  //   nextPeriodVebal: '-',
  // }

  const popoverContent = (
    <PopoverContent bg="background.base" minWidth={['100px', '300px']} p="sm" shadow="3xl">
      <VStack alignItems="stretch" spacing="sm" width="full">
        <TooltipItem
          label={
            <Text as="b" fontSize="lg">
              veBAL votes
            </Text>
          }
          mt="sm"
          value={
            <Badge colorScheme={badgeColor} variant="solid">
              <HStack>
                <Box color="font.dark" fontSize="xs" ml="1">
                  {differenceIcon}
                </Box>
                <Text color="font.dark" fontSize="sm">
                  {voteDifferenceText}
                </Text>
              </HStack>
            </Badge>
          }
        />

        <hr />

        <TooltipItem label="Current period" mt="sm" value={votesThisPeriodText ?? <>&mdash;</>} />
        <TooltipItem color="grey" label="veBAL votes" value="???" />

        <TooltipItem label="Next period" mt="md" value={votesNextPeriodText ?? <>&mdash;</>} />
        <TooltipItem color="grey" label="veBAL votes" value="???" />
      </VStack>
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      <>
        <PopoverTrigger>
          <HStack>
            <Text
              color={votesColor}
              fontWeight="medium"
              textAlign="right"
              textDecoration="underline"
              textDecorationStyle="dotted"
            >
              {votesNextPeriodText ?? <>&mdash;</>}
            </Text>
            {differenceIcon}
          </HStack>
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
