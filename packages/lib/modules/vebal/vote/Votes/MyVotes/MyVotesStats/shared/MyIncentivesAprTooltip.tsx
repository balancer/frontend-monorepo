import StarsIcon from '@repo/lib/shared/components/icons/StarsIcon'
import { Icon, Stack, useTheme } from '@chakra-ui/react'

import { Popover, PopoverContent, PopoverTrigger, Portal, Text } from '@chakra-ui/react'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { TooltipAprItem } from '@repo/lib/shared/components/tooltips/apr-tooltip/TooltipAprItem'
import {
  lockingIncentivesTooltipText,
  swapFeesTooltipText,
  useAprTooltip,
  votingIncentivesTooltipText,
} from '@repo/lib/shared/hooks/useAprTooltip'
import BigNumber from 'bignumber.js'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

interface Props {
  totalWithVotesOptimized?: number
  totalWithVoteEdits?: number
  totalBeforeVoteEdits?: number
  usePortal?: boolean
}

const defaultDisplayValueFormatter = (value: BigNumber) => fNum('fiat', value.toString())
const defaultNumberFormatter = (value: string) => bn(value)

const basePopoverAprItemProps = {
  bg: 'background.base',
  fontWeight: 700,
}

// fix: (votes) all data is mocked
export function MyIncentivesAprTooltip({
  totalWithVotesOptimized,
  totalWithVoteEdits,
  totalBeforeVoteEdits,
  usePortal,
}: Props) {
  const theme = useTheme()

  const {
    swapFeesDisplayed,
    isSwapFeePresent,
    lockingAprDisplayed,
    votingAprDisplayed,
    isVotingPresent,
    isLockingAprPresent,
  } = useAprTooltip({
    aprItems: [],
    numberFormatter: defaultNumberFormatter,
    chain: GqlChain.Mainnet,
  })

  const usedDisplayValueFormatter = defaultDisplayValueFormatter

  const gain = bn(totalWithVoteEdits ?? 0)
    .minus(totalBeforeVoteEdits ?? 0)
    .toNumber()

  const popoverContent = (
    <PopoverContent bg="background.base" gap="md" minWidth={['100px']} px="0" py="ms" shadow="3xl">
      <Stack px="sm" spacing="sm" w="full">
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={swapFeesDisplayed}
          aprOpacity={isSwapFeePresent ? 1 : 0.5}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Swap fees"
          tooltipText={swapFeesTooltipText}
        />
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={lockingAprDisplayed}
          aprOpacity={isLockingAprPresent ? 1 : 0.5}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Protocol revenue share (max)"
          tooltipText={lockingIncentivesTooltipText}
        />
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={votingAprDisplayed}
          aprOpacity={isVotingPresent ? 1 : 0.5}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Voting incentives (average)"
          tooltipText={votingIncentivesTooltipText}
        />
      </Stack>
      <Stack bg="background.level2" px="sm" py="ms" spacing="sm" w="full">
        {totalWithVotesOptimized && (
          <TooltipAprItem
            {...basePopoverAprItemProps}
            apr={bn(totalWithVotesOptimized)}
            aprOpacity={totalWithVotesOptimized > 0 ? 1 : 0.5}
            bg="background.level2"
            displayValueFormatter={usedDisplayValueFormatter}
            fontColor="font.maxContrast"
            title="Total with votes optimized"
            tooltipText="// fix: (votes) need design"
          />
        )}

        {typeof totalWithVoteEdits === 'number' && (
          <TooltipAprItem
            {...basePopoverAprItemProps}
            apr={bn(totalWithVoteEdits)}
            aprOpacity={totalWithVoteEdits > 0 ? 1 : 0.5}
            bg="background.level2"
            displayValueFormatter={usedDisplayValueFormatter}
            fontColor="font.maxContrast"
            title="Total with vote edits"
            tooltipText="// fix: (votes) need design"
          />
        )}

        {typeof totalBeforeVoteEdits === 'number' && (
          <TooltipAprItem
            {...basePopoverAprItemProps}
            apr={bn(totalBeforeVoteEdits)}
            aprOpacity={totalBeforeVoteEdits > 0 ? 1 : 0.5}
            bg="background.level2"
            displayValueFormatter={usedDisplayValueFormatter}
            fontColor="font.secondary"
            title="Total before vote edits"
            tooltipText="// fix: (votes) need design"
          />
        )}

        {typeof totalWithVoteEdits === 'number' && typeof totalBeforeVoteEdits === 'number' && (
          <TooltipAprItem
            {...basePopoverAprItemProps}
            apr={bn(gain)}
            aprOpacity={gain > 0 ? 1 : 0.5}
            bg="background.level2"
            displayValueFormatter={usedDisplayValueFormatter}
            fontColor="font.secondary"
            title="Gain"
            tooltipText="// fix: (votes) need design"
            valueFontColor={gain === 0 ? undefined : gain > 0 ? 'green.400' : 'red.400'}
          />
        )}
      </Stack>
      <Stack px="sm" spacing="sm" w="full">
        <Text color="font.secondary" fontSize="sm">
          Note: In addition, veBAL holders earn extra BAL incentives whey they LP in eligible pools
          (based on veBAL boost).
        </Text>
      </Stack>
    </PopoverContent>
  )

  return (
    <Popover trigger="hover">
      <>
        <PopoverTrigger>
          <Icon
            as={StarsIcon}
            gradFrom={theme.colors['red.400']}
            gradTo={theme.colors['red.400']}
          />
        </PopoverTrigger>

        {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
      </>
    </Popover>
  )
}
