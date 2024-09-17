import { GqlPoolAprItem } from '@/lib/shared/services/api/generated/graphql'
import {
  PlacementWithLogical,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Divider,
  Stack,
  Portal,
} from '@chakra-ui/react'
import { useThemeColorMode } from '@/lib/shared/services/chakra/useThemeColorMode'
import {
  swapFeesTooltipText,
  useAprTooltip,
  inherentTokenYieldTooltipText,
  extraBalTooltipText,
  lockingIncentivesTooltipText,
  votingIncentivesTooltipText,
  merklIncentivesTooltipText,
  surplusIncentivesTooltipText,
} from '@/lib/shared/hooks/useAprTooltip'
import { TooltipAprItem } from './TooltipAprItem'
import BigNumber from 'bignumber.js'
import { bn, fNum } from '@/lib/shared/utils/numbers'
import { isVebalPool } from '@/lib/modules/pool/pool.helpers'

interface Props {
  aprItems: GqlPoolAprItem[]
  numberFormatter?: (value: string) => BigNumber
  displayValueFormatter?: (value: BigNumber) => string
  placement?: PlacementWithLogical
  poolId: string
  vebalBoost?: string
  totalBaseText: string | ((hasVeBalBoost?: boolean) => string)
  totalBaseVeBalText: string
  totalVeBalTitle?: string
  maxVeBalText: string
  customPopoverContent?: React.ReactNode
  shouldDisplayBaseTooltip?: boolean
  shouldDisplayMaxVeBalTooltip?: boolean
  usePortal?: boolean
  children?: React.ReactNode | (({ isOpen }: { isOpen: boolean }) => React.ReactNode)
}

const balRewardGradient =
  // eslint-disable-next-line max-len
  'linear-gradient(90deg, rgba(179, 174, 245, 0.1) 0%, rgba(215, 203, 231, 0.1) 25%, rgba(229, 200, 200, 0.1) 50%, rgba(234, 168, 121, 0.1) 100%)'

const basePopoverAprItemProps = {
  pl: 2,
  pr: 2,
  pb: 3,
  backgroundColor: 'background.level1',
  fontWeight: 700,
}

const defaultDisplayValueFormatter = (value: BigNumber) => fNum('apr', value.toString())
const defaultNumberFormatter = (value: string) => bn(value)

function BaseAprTooltip({
  aprItems,
  poolId,
  numberFormatter,
  displayValueFormatter,
  placement,
  vebalBoost,
  customPopoverContent,
  totalBaseText,
  totalBaseVeBalText,
  totalVeBalTitle,
  maxVeBalText,
  shouldDisplayBaseTooltip,
  shouldDisplayMaxVeBalTooltip,
  children,
  usePortal = true,
}: Props) {
  const colorMode = useThemeColorMode()

  const usedDisplayValueFormatter = displayValueFormatter || defaultDisplayValueFormatter
  const usedNumberFormatter = numberFormatter || defaultNumberFormatter

  const {
    totalBaseDisplayed,
    extraBalAprDisplayed,
    yieldBearingTokensAprDisplayed,
    stakingIncentivesAprDisplayed,
    merklIncentivesAprDisplayed,
    hasMerklIncentives,
    hasSurplusIncentives,
    surplusIncentivesAprDisplayed,
    swapFeesDisplayed,
    isSwapFeePresent,
    isYieldPresent,
    isStakingPresent,
    maxVeBalDisplayed,
    yieldBearingTokensDisplayed,
    stakingIncentivesDisplayed,
    subitemPopoverAprItemProps,
    hasVeBalBoost,
    totalBase,
    maxVeBal,
    lockingAprDisplayed,
    votingAprDisplayed,
    isVotingPresent,
    isLockingAprPresent,
    totalCombinedDisplayed,
  } = useAprTooltip({
    aprItems,
    vebalBoost: Number(vebalBoost),
    numberFormatter: usedNumberFormatter,
  })

  const isVebal = isVebalPool(poolId)

  const totalBaseTitle = isVebal
    ? totalBaseVeBalText
    : typeof totalBaseText === 'function'
    ? totalBaseText(hasVeBalBoost)
    : totalBaseText

  const popoverContent = customPopoverContent || (
    <PopoverContent
      minWidth={['100px', '300px']}
      overflow="hidden"
      p="0"
      shadow="3xl"
      w="fit-content"
    >
      <TooltipAprItem
        {...basePopoverAprItemProps}
        apr={swapFeesDisplayed}
        aprOpacity={isSwapFeePresent ? 1 : 0.5}
        displayValueFormatter={usedDisplayValueFormatter}
        pt={3}
        title="Swap fees"
        tooltipText={swapFeesTooltipText}
      />
      <TooltipAprItem
        {...basePopoverAprItemProps}
        apr={stakingIncentivesAprDisplayed}
        aprOpacity={isStakingPresent ? 1 : 0.5}
        displayValueFormatter={usedDisplayValueFormatter}
        title="Staking incentives"
      >
        {stakingIncentivesDisplayed.map((item, index) => {
          return (
            <TooltipAprItem
              {...subitemPopoverAprItemProps}
              apr={item.apr}
              displayValueFormatter={usedDisplayValueFormatter}
              key={index}
              title={item.title}
              tooltipText={item.tooltipText}
            />
          )
        })}
      </TooltipAprItem>
      <TooltipAprItem
        {...basePopoverAprItemProps}
        apr={yieldBearingTokensAprDisplayed}
        aprOpacity={isYieldPresent ? 1 : 0.5}
        displayValueFormatter={usedDisplayValueFormatter}
        title="Yield bearing tokens"
      >
        {yieldBearingTokensDisplayed.map((item, index) => {
          return (
            <TooltipAprItem
              {...subitemPopoverAprItemProps}
              apr={item.apr}
              displayValueFormatter={usedDisplayValueFormatter}
              key={index}
              title={item.title}
              tooltipText={inherentTokenYieldTooltipText}
            />
          )
        })}
      </TooltipAprItem>
      {hasMerklIncentives ? (
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={merklIncentivesAprDisplayed}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Merkl.xyz incentives"
          tooltipText={merklIncentivesTooltipText}
        />
      ) : null}
      {hasSurplusIncentives ? (
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={surplusIncentivesAprDisplayed}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Prevented LVR"
          tooltipText={surplusIncentivesTooltipText}
        />
      ) : null}
      <Divider />
      <TooltipAprItem
        {...basePopoverAprItemProps}
        apr={totalBaseDisplayed}
        backgroundColor="background.level4"
        displayValueFormatter={usedDisplayValueFormatter}
        fontColor="font.maxContrast"
        pt={3}
        title={totalBaseTitle}
        tooltipText={
          shouldDisplayBaseTooltip
            ? `${defaultDisplayValueFormatter(defaultNumberFormatter(totalBase.toString()))} APR`
            : ''
        }
      />
      {isVebal ? (
        <>
          <Divider />
          <Stack gap={0} roundedBottom="md">
            <TooltipAprItem
              pt={3}
              {...basePopoverAprItemProps}
              apr={lockingAprDisplayed}
              aprOpacity={isLockingAprPresent ? 1 : 0.5}
              displayValueFormatter={usedDisplayValueFormatter}
              title="Max locking incentives"
              tooltipText={lockingIncentivesTooltipText}
            />
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={votingAprDisplayed}
              aprOpacity={isVotingPresent ? 1 : 0.5}
              displayValueFormatter={usedDisplayValueFormatter}
              title="Average voting incentives"
              tooltipText={votingIncentivesTooltipText}
            />
            <Divider />

            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={totalCombinedDisplayed}
              boxBackground={balRewardGradient}
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor="font.special"
              pt={3}
              roundedBottom="md"
              textBackground="background.special"
              textBackgroundClip="text"
              title={totalVeBalTitle || 'Total APR'}
            />
          </Stack>
        </>
      ) : null}
      {hasVeBalBoost ? (
        <>
          <Divider />
          <Stack gap={0} roundedBottom="md">
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={extraBalAprDisplayed}
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor={colorMode == 'light' ? 'gray.600' : 'gray.400'}
              fontWeight={500}
              pt={3}
              title="Extra BAL (veBAL boost)"
              tooltipText={extraBalTooltipText}
            />
            <Divider />

            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={maxVeBalDisplayed}
              boxBackground={balRewardGradient}
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor="font.special"
              pt={3}
              roundedBottom="md"
              textBackground="background.special"
              textBackgroundClip="text"
              title={maxVeBalText || 'Max veBAL APR'}
              tooltipText={
                shouldDisplayMaxVeBalTooltip
                  ? `${defaultDisplayValueFormatter(
                      defaultNumberFormatter(maxVeBal.toString())
                    )} APR`
                  : ''
              }
            />
          </Stack>
        </>
      ) : null}
    </PopoverContent>
  )

  return (
    <Popover placement={placement} trigger="hover">
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            {typeof children === 'function' ? children({ isOpen }) : children}
          </PopoverTrigger>

          {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
        </>
      )}
    </Popover>
  )
}

export type { Props as BaseAprTooltipProps }
export default BaseAprTooltip
