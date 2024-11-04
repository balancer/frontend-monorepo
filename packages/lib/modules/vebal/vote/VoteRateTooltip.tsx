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
import { VoteListItem } from '@repo/lib/modules/vebal/vote/vote.types'
import { useMemo } from 'react'
import { fNum } from '@repo/lib/shared/utils/numbers'
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
  value: string
  valueColor?: string
}

function TooltipItem({ label, value, valueColor, ...props }: TooltipItemProps) {
  return (
    <HStack justifyContent="space-between" {...props}>
      <Text color="font.primary">{label}</Text>
      <Text color={valueColor ?? 'font.primary'}>{value}</Text>
    </HStack>
  )
}

interface Props {
  vote: VoteListItem
  usePortal?: boolean
}

export function VoteRateTooltip({ vote, usePortal = true }: Props) {
  /* fix: where is data? */
  const voteState = useMemo(() => {
    return {
      currentPeriodVebal: Math.random() * 20000,
      nextPeriodVebal: Math.random() * 20000,
      currentPeriodShare: Math.random(),
      nextPeriodShare: Math.random(),
      change: Math.random() - 0.5,
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
          value={fNum('apr', voteState.currentPeriodShare)}
        />
        <TooltipItem
          label="Next period share of votes"
          value={fNum('apr', voteState.nextPeriodShare)}
        />
        <TooltipItem
          label="Change"
          mt="sm"
          value={fNum('apr', voteState.change)}
          valueColor={
            !voteState.change ? undefined : voteState.change > 0 ? 'green.500' : 'red.400'
          }
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
              {fNum('apr', voteState.change)}
            </Text>
            {!voteState.change ? undefined : voteState.change > 0 ? (
              <VoteUpIcon />
            ) : (
              <VoteDownIcon />
            )}
          </HStack>
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
