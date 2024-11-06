import { ArrowUpIcon } from '@repo/lib/shared/components/icons/ArrowUpIcon'
import { ArrowDownIcon } from '@repo/lib/shared/components/icons/ArrowDownIcon'
import {
  HStack,
  Text,
  Center,
  useToken,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  VStack,
  StackProps,
} from '@chakra-ui/react'
import { useMemo, ReactNode } from 'react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import tinycolor from 'tinycolor2'
import { VotesState } from '@repo/lib/modules/vebal/vote/vote.types'

function VoteUpIcon() {
  const [color, _bgColor] = useToken('colors', ['green.500', 'green.600'])

  const bgColor = tinycolor(_bgColor).setAlpha(0.15).toString()

  return (
    <Center bg={bgColor} borderRadius="full" color={color} h="16px" w="16px">
      <ArrowUpIcon height="10px" width="10px" />
    </Center>
  )
}

function VoteDownIcon() {
  const [color] = useToken('colors', ['red.400'])

  const bgColor = tinycolor(color).setAlpha(0.15).toString()

  return (
    <Center bg={bgColor} borderRadius="full" color={color} h="16px" w="16px">
      <ArrowDownIcon height="10px" width="10px" />
    </Center>
  )
}

interface TooltipItemProps extends StackProps {
  label: string
  value: ReactNode
  valueColor?: string
}

function TooltipItem({ label, value, valueColor, ...props }: TooltipItemProps) {
  return (
    <HStack justifyContent="space-between" {...props}>
      <Text color="font.primary" fontSize="sm">
        {label}
      </Text>
      <Text color={valueColor ?? 'font.primary'} fontSize="sm">
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
    const text = formatVotesAsPercent(voteDifference ? voteDifference : 0)
    const prefix = !voteDifference ? '' : voteDifference > 0 ? '+' : '-'
    return `${prefix}${text}`
  }, [voteDifference])

  const voteDifferenceColor = !voteDifference
    ? undefined
    : voteDifference > 0
      ? 'green.500'
      : 'red.400'

  const differenceIcon = !voteDifference ? undefined : voteDifference > 0 ? (
    <VoteUpIcon />
  ) : (
    <VoteDownIcon />
  )

  /* fix: where is data? */
  const voteState = useMemo(() => {
    return {
      currentPeriodVebal: Math.random() * 20000,
      nextPeriodVebal: Math.random() * 20000,
    }
  }, [])

  const votesColor =
    votesState === 'normal' ? undefined : votesState === 'close' ? 'font.warning' : 'red.400'

  const popoverContent = (
    <PopoverContent bg="background.base" minWidth={['100px', '300px']} p="sm" shadow="3xl">
      <VStack alignItems="stretch" spacing="sm" width="full">
        <TooltipItem
          label="Current period veBAL votes"
          value={fNum('boost', voteState.currentPeriodVebal)}
        />
        <TooltipItem
          label="Next period veBAL votes"
          value={fNum('boost', voteState.nextPeriodVebal)}
        />
        <TooltipItem
          label="Current period share of votes"
          mt="sm"
          value={votesThisPeriodText ?? <>&mdash;</>}
        />
        <TooltipItem
          label="Next period share of votes"
          value={votesNextPeriodText ?? <>&mdash;</>}
        />
        <TooltipItem
          label="Change"
          mt="sm"
          value={voteDifferenceText}
          valueColor={voteDifferenceColor}
        />
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
