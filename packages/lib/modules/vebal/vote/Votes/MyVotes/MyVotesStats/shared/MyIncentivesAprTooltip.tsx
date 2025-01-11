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

interface Props {
  totalWithEdits?: string
  totalWithOptimized?: string
  usePortal?: boolean
}

const defaultDisplayValueFormatter = (value: BigNumber) => fNum('apr', value.toString())
const defaultNumberFormatter = (value: string) => bn(value)

const basePopoverAprItemProps = {
  bg: 'background.base',
  fontWeight: 700,
}

// fix: (votes) all data is mocked
export function MyIncentivesAprTooltip({ totalWithOptimized, totalWithEdits, usePortal }: Props) {
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
  })

  const usedDisplayValueFormatter = defaultDisplayValueFormatter

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
        {totalWithOptimized && (
          <TooltipAprItem
            {...basePopoverAprItemProps}
            apr={swapFeesDisplayed}
            aprOpacity={isSwapFeePresent ? 1 : 0.5}
            bg="background.level2"
            displayValueFormatter={usedDisplayValueFormatter}
            fontColor="font.maxContrast"
            title="Total with votes optimized"
            tooltipText={swapFeesTooltipText}
          />
        )}

        {totalWithEdits && (
          <>
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={swapFeesDisplayed}
              aprOpacity={isSwapFeePresent ? 1 : 0.5}
              bg="background.level2"
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor="font.maxContrast"
              title="Total with vote edits"
              tooltipText={swapFeesTooltipText}
            />
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={lockingAprDisplayed}
              aprOpacity={isLockingAprPresent ? 1 : 0.5}
              bg="background.level2"
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor="font.secondary"
              title="Total before vote edits"
              tooltipText={lockingIncentivesTooltipText}
            />
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={votingAprDisplayed}
              aprOpacity={isVotingPresent ? 1 : 0.5}
              bg="background.level2"
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor="font.secondary"
              title="Gain"
              tooltipText={votingIncentivesTooltipText}
            />
          </>
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
