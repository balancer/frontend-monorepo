import { GqlPoolAprItem, GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import {
  PlacementWithLogical,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Divider,
  Stack,
  Portal,
} from '@chakra-ui/react'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import {
  swapFeesTooltipText,
  useAprTooltip,
  inherentTokenYieldTooltipText,
  extraBalTooltipText,
  lockingIncentivesTooltipText,
  votingIncentivesTooltipText,
  merklIncentivesTooltipText,
  surplusIncentivesTooltipText,
} from '@repo/lib/shared/hooks/useAprTooltip'
import { TooltipAprItem } from './TooltipAprItem'
import BigNumber from 'bignumber.js'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { isCowAmmPool, isVebalPool } from '@repo/lib/modules/pool/pool.helpers'
import { ReactNode } from 'react'

interface Props {
  aprItems: GqlPoolAprItem[]
  numberFormatter?: (value: string) => BigNumber
  displayValueFormatter?: (value: BigNumber) => string
  placement?: PlacementWithLogical
  poolId: string
  poolType: GqlPoolType
  vebalBoost?: string
  totalBaseText: string | ((hasVeBalBoost?: boolean) => string)
  totalBaseVeBalText: string
  totalVeBalTitle?: string
  maxVeBalText: string
  customPopoverContent?: ReactNode
  shouldDisplayBaseTooltip?: boolean
  shouldDisplayMaxVeBalTooltip?: boolean
  usePortal?: boolean
  children?: ReactNode | (({ isOpen }: { isOpen: boolean }) => ReactNode)
}

const balRewardGradient =
  // eslint-disable-next-line max-len
  'linear-gradient(90deg, rgba(179, 174, 245, 0.5) 0%, rgba(215, 203, 231, 0.5) 25%, rgba(229, 200, 200, 0.5) 50%, rgba(234, 168, 121, 0.5) 100%)'

const basePopoverAprItemProps = {
  pl: 4,
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
  poolType,
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
      w="fit-content"
      shadow="3xl"
      overflow="hidden"
      minWidth={['100px', '300px']}
      p="0"
    >
      <TooltipAprItem
        {...basePopoverAprItemProps}
        displayValueFormatter={usedDisplayValueFormatter}
        pt={3}
        title="Swap fees"
        apr={swapFeesDisplayed}
        aprOpacity={isSwapFeePresent ? 1 : 0.5}
        tooltipText={swapFeesTooltipText}
      />
      <TooltipAprItem
        {...basePopoverAprItemProps}
        displayValueFormatter={usedDisplayValueFormatter}
        title="Staking incentives"
        apr={stakingIncentivesAprDisplayed}
        aprOpacity={isStakingPresent ? 1 : 0.5}
      >
        {stakingIncentivesDisplayed.map((item, index) => {
          return (
            <TooltipAprItem
              {...subitemPopoverAprItemProps}
              displayValueFormatter={usedDisplayValueFormatter}
              key={index}
              title={item.title}
              apr={item.apr}
              tooltipText={item.tooltipText}
            />
          )
        })}
      </TooltipAprItem>
      <TooltipAprItem
        {...basePopoverAprItemProps}
        displayValueFormatter={usedDisplayValueFormatter}
        title="Yield bearing tokens"
        apr={yieldBearingTokensAprDisplayed}
        aprOpacity={isYieldPresent ? 1 : 0.5}
      >
        {yieldBearingTokensDisplayed.map((item, index) => {
          return (
            <TooltipAprItem
              {...subitemPopoverAprItemProps}
              displayValueFormatter={usedDisplayValueFormatter}
              key={index}
              title={item.title}
              apr={item.apr}
              tooltipText={inherentTokenYieldTooltipText}
            />
          )
        })}
      </TooltipAprItem>
      {hasMerklIncentives && (
        <TooltipAprItem
          {...basePopoverAprItemProps}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Merkl.xyz incentives"
          apr={merklIncentivesAprDisplayed}
          tooltipText={merklIncentivesTooltipText}
        />
      )}
      {isCowAmmPool(poolType) && (
        <TooltipAprItem
          {...basePopoverAprItemProps}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Prevented LVR"
          apr={surplusIncentivesAprDisplayed}
          tooltipText={surplusIncentivesTooltipText}
        />
      )}
      <Divider />
      <TooltipAprItem
        {...basePopoverAprItemProps}
        displayValueFormatter={usedDisplayValueFormatter}
        pt={3}
        pl={2}
        backgroundColor="background.level3"
        fontColor="font.maxContrast"
        tooltipText={
          shouldDisplayBaseTooltip
            ? `${defaultDisplayValueFormatter(defaultNumberFormatter(totalBase.toString()))} APR`
            : ''
        }
        title={totalBaseTitle}
        apr={totalBaseDisplayed}
      />
      {isVebal && (
        <>
          <Divider />
          <Stack roundedBottom="md" gap={0}>
            <TooltipAprItem
              pt={3}
              {...basePopoverAprItemProps}
              displayValueFormatter={usedDisplayValueFormatter}
              title="Protocol revenue share (max)"
              tooltipText={lockingIncentivesTooltipText}
              apr={lockingAprDisplayed}
              aprOpacity={isLockingAprPresent ? 1 : 0.5}
            />
            <TooltipAprItem
              {...basePopoverAprItemProps}
              displayValueFormatter={usedDisplayValueFormatter}
              title="Voting incentives (average)"
              tooltipText={votingIncentivesTooltipText}
              apr={votingAprDisplayed}
              aprOpacity={isVotingPresent ? 1 : 0.5}
            />
            <Divider />

            <TooltipAprItem
              {...basePopoverAprItemProps}
              displayValueFormatter={usedDisplayValueFormatter}
              pt={3}
              px={2}
              fontColor="font.special"
              title={totalVeBalTitle || 'Total APR'}
              apr={totalCombinedDisplayed}
              backgroundColor={balRewardGradient}
              textBackground="background.special"
              textBackgroundClip="text"
              roundedBottom="md"
            />
          </Stack>
        </>
      )}
      {hasVeBalBoost && (
        <>
          <Divider />
          <Stack roundedBottom="md" gap={0}>
            <TooltipAprItem
              {...basePopoverAprItemProps}
              displayValueFormatter={usedDisplayValueFormatter}
              pt={3}
              pl={6}
              fontWeight={500}
              fontColor={colorMode == 'light' ? 'gray.600' : 'gray.400'}
              title="Extra BAL (veBAL boost)"
              apr={extraBalAprDisplayed}
              tooltipText={extraBalTooltipText}
            />
            <Divider />

            <TooltipAprItem
              {...basePopoverAprItemProps}
              displayValueFormatter={usedDisplayValueFormatter}
              pt={3}
              pl={2}
              fontColor="font.special"
              title={maxVeBalText || 'Max veBAL APR'}
              tooltipText={
                shouldDisplayMaxVeBalTooltip
                  ? `${defaultDisplayValueFormatter(
                      defaultNumberFormatter(maxVeBal.toString())
                    )} APR`
                  : ''
              }
              apr={maxVeBalDisplayed}
              boxBackground={balRewardGradient}
              textBackground="background.special"
              textBackgroundClip="text"
              backgroundColor="background.level3"
              roundedBottom="md"
            />
          </Stack>
        </>
      )}
    </PopoverContent>
  )

  return (
    <Popover trigger="hover" placement={placement}>
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
