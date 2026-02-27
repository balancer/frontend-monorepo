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
  useToken,
  Center,
  Divider,
} from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { VotesState } from '@repo/lib/modules/vebal/vote/vote.types'
import tinycolor from 'tinycolor2'
import { useVeBALTotal } from './useVeBALTotal'
import { oneWeekInMs } from '@repo/lib/shared/utils/time'
import { useTotalVotes } from './useTotalVotes'
import { formatUnits } from 'viem'

interface TooltipItemProps extends StackProps {
  label: ReactNode
  value: ReactNode
}

function TooltipItem({ label, value, color, ...props }: TooltipItemProps) {
  return (
    <HStack justifyContent="space-between" {...props}>
      <Text as="span" color={color ?? 'font.primary'} fontSize="sm">
        {label}
      </Text>
      <Text as="span" color={color ?? 'font.primary'} fontSize="sm">
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
  votesShare?: number
  votesShareNextWeek?: number
  votesState?: VotesState
  usePortal?: boolean
}

function TrendUpIcon() {
  const [color, _bgColor] = useToken('colors', ['green.500', 'green.600'])
  const bgColor = tinycolor(_bgColor).setAlpha(0.15).toString()
  return (
    <Center bg={bgColor} borderRadius="full" color={color} h="16px" w="16px">
      <ArrowUpIcon height="10px" width="10px" />
    </Center>
  )
}

function TrendDownIcon() {
  const [color] = useToken('colors', ['red.400'])
  const bgColor = tinycolor(color).setAlpha(0.15).toString()
  return (
    <Center bg={bgColor} borderRadius="full" color={color} h="16px" w="16px">
      <ArrowDownIcon height="10px" width="10px" />
    </Center>
  )
}

export function VoteRateTooltip({ votesState, votesShare, votesShareNextWeek }: Props) {
  const votesShareText = votesShare ? formatVotesAsPercent(votesShare) : undefined
  const votesShareNextWeekText = votesShareNextWeek
    ? formatVotesAsPercent(votesShareNextWeek)
    : undefined

  const voteDiff = votesShare && votesShareNextWeek ? votesShareNextWeek - votesShare : undefined
  const voteDiffText = formatVotesAsPercent(voteDiff ? voteDiff : 0)
  const diffIcon = !voteDiff ? (
    <ArrowUpIcon height="14px" width="14px" />
  ) : voteDiff > 0 ? (
    <ArrowUpIcon />
  ) : (
    <ArrowDownIcon />
  )
  const badgeColorScheme =
    !voteDiff || voteDiff === 0
      ? { variant: 'outline', bg: 'font.secondary' }
      : voteDiff > 0
        ? { bg: 'font.highlight', variant: 'solid', color: 'white' }
        : { colorScheme: 'red', variant: 'solid' }

  const votesColor =
    votesState === 'normal' ? undefined : votesState === 'close' ? 'font.warning' : 'red.400'

  const trendIcon = !voteDiff ? undefined : voteDiff > 0 ? <TrendUpIcon /> : <TrendDownIcon />

  const [thisWeek] = useState(() => Math.floor(Date.now() / oneWeekInMs) * oneWeekInMs)

  const { totalVotes: totalVotesRaw } = useTotalVotes()
  const totalVotes = Number(formatUnits(totalVotesRaw, 18))
  const votesThisWeek = totalVotes && votesShare ? (votesShare * totalVotes).toFixed(2) : undefined

  const nextWeek = thisWeek + oneWeekInMs
  const { totalAmount: totalVeBALNextWeek } = useVeBALTotal(nextWeek)
  const votesNextWeek =
    totalVeBALNextWeek && votesShareNextWeek
      ? (votesShareNextWeek * totalVeBALNextWeek).toFixed(2)
      : undefined

  const popoverContent = (
    <PopoverContent bg="background.base" minWidth={['100px', '300px']} p="ms" shadow="3xl">
      <VStack alignItems="stretch" spacing="xs" width="full">
        <TooltipItem
          label={
            <Text as="b" fontWeight="bold">
              veBAL votes
            </Text>
          }
          mb="xs"
          value={
            <Badge {...badgeColorScheme} rounded="full">
              <HStack gap="xxs" p="xxs" pl="0">
                <Box color="font.dark" fontSize="xs">
                  {diffIcon}
                </Box>
                <Text color="font.dark" fontSize="sm" fontWeight="bold">
                  {voteDiffText}
                </Text>
              </HStack>
            </Badge>
          }
        />

        <Divider />

        <TooltipItem label="Current period" mt="sm" value={votesShareText ?? <>&mdash;</>} />
        <TooltipItem
          color="font.secondary"
          label="veBAL votes"
          value={votesThisWeek ?? <>&mdash;</>}
        />

        <TooltipItem
          label="For next period"
          mt="sm"
          value={votesShareNextWeekText ?? <>&mdash;</>}
        />
        <TooltipItem
          color="font.secondary"
          label="veBAL votes"
          value={votesNextWeek ?? <>&mdash;</>}
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
              textDecorationThickness="1px"
              textUnderlineOffset="4px"
            >
              {votesShareNextWeekText ?? <>&mdash;</>}
            </Text>
            {trendIcon}
          </HStack>
        </PopoverTrigger>

        <Portal>{popoverContent}</Portal>
      </>
    </Popover>
  )
}
