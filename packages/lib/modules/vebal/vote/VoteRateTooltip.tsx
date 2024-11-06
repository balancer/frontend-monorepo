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
import { VotingPoolWithData } from '@repo/lib/modules/vebal/vote/vote.types'
import React, { useMemo } from 'react'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import tinycolor from 'tinycolor2'

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
  value: React.ReactNode
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

function formatVotesAsPercent(votes: string): string {
  const normalizedVotes = bn(votes).shiftedBy(-18).abs()
  return fNum('apr', normalizedVotes)
}

interface Props {
  vote: VotingPoolWithData
  usePortal?: boolean
}

export function VoteRateTooltip({ vote, usePortal = true }: Props) {
  const votesThisPeriod = vote.gaugeVotes ? formatVotesAsPercent(vote.gaugeVotes.votes) : undefined
  const votesNextPeriod = vote.gaugeVotes
    ? formatVotesAsPercent(vote.gaugeVotes.votesNextPeriod)
    : undefined

  const voteDifference = vote.gaugeVotes
    ? bn(vote.gaugeVotes.votesNextPeriod).minus(vote.gaugeVotes.votes).toNumber()
    : undefined

  const voteDifferenceText = useMemo(() => {
    const text = formatVotesAsPercent(voteDifference ? voteDifference.toString() : '0')
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
          value={votesThisPeriod ?? <>&mdash;</>}
        />
        <TooltipItem label="Next period share of votes" value={votesNextPeriod ?? <>&mdash;</>} />
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
              fontWeight="medium"
              textAlign="right"
              textDecoration="underline"
              textDecorationStyle="dotted"
            >
              {votesNextPeriod ?? <>&mdash;</>}
            </Text>
            {differenceIcon}
          </HStack>
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
