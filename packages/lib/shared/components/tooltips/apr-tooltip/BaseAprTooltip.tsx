import {
  GqlChain,
  GqlHookType,
  GqlPoolAprItem,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
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
  SupportedHookType,
  //mevCaptureFeesTooltipText,
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
  chain: GqlChain
  hookType?: GqlHookType
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

function getDynamicSwapFeesLabel(hookType: GqlHookType) {
  switch (hookType) {
    case GqlHookType.MevTax:
      return 'MEV Capture hook'
    case GqlHookType.StableSurge:
      return 'Stable Surge hook'
    default:
      return 'Dynamic Swap Fees '
  }
}

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
  chain,
  usePortal = true,
  hookType,
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
    isMaBeetsPresent,
    maBeetsRewardsDisplayed,
    maxMaBeetsRewardDisplayed,
    maxMaBeetsVotingRewardDisplayed,
    maBeetsVotingRewardsTooltipText,
    maBeetsTotalAprDisplayed,
    maBeetsRewardTooltipText,
    dynamicSwapFeesDisplayed,
    dynamicSwapFeesTooltipText,
  } = useAprTooltip({
    aprItems,
    vebalBoost: Number(vebalBoost),
    numberFormatter: usedNumberFormatter,
    chain,
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
      >
        {hookType ? (
          <>
            <TooltipAprItem
              {...subitemPopoverAprItemProps}
              apr={bn(swapFeesDisplayed).minus(dynamicSwapFeesDisplayed)}
              displayValueFormatter={usedDisplayValueFormatter}
              title="Regular swap fees"
            />
            <TooltipAprItem
              {...subitemPopoverAprItemProps}
              apr={dynamicSwapFeesDisplayed}
              displayValueFormatter={usedDisplayValueFormatter}
              title={getDynamicSwapFeesLabel(hookType)}
              tooltipText={dynamicSwapFeesTooltipText[hookType as SupportedHookType]}
            />
          </>
        ) : null}
      </TooltipAprItem>

      {isMaBeetsPresent && (
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={maBeetsRewardsDisplayed}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Min maBEETS APR"
        />
      )}
      <TooltipAprItem
        {...basePopoverAprItemProps}
        apr={stakingIncentivesAprDisplayed}
        aprOpacity={isStakingPresent ? 1 : 0.5}
        displayValueFormatter={usedDisplayValueFormatter}
        title="Staking incentives"
      >
        {stakingIncentivesDisplayed.map(item => {
          return (
            <TooltipAprItem
              {...subitemPopoverAprItemProps}
              apr={item.apr}
              displayValueFormatter={usedDisplayValueFormatter}
              key={`staking-${item.title}-${item.apr}`}
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
        {yieldBearingTokensDisplayed.map(item => {
          return (
            <TooltipAprItem
              {...subitemPopoverAprItemProps}
              apr={item.apr}
              displayValueFormatter={usedDisplayValueFormatter}
              key={`yield-bearing-${item.title}-${item.apr}`}
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
      {isCowAmmPool(poolType) && (
        <TooltipAprItem
          {...basePopoverAprItemProps}
          apr={surplusIncentivesAprDisplayed}
          displayValueFormatter={usedDisplayValueFormatter}
          title="Prevented LVR"
          tooltipText={surplusIncentivesTooltipText}
        />
      )}
      <Divider />
      <TooltipAprItem
        {...basePopoverAprItemProps}
        apr={totalBaseDisplayed}
        backgroundColor="background.level3"
        displayValueFormatter={usedDisplayValueFormatter}
        fontColor="font.maxContrast"
        pl={2}
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
            <Divider />
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={totalCombinedDisplayed}
              backgroundColor={balRewardGradient}
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor="font.special"
              pt={3}
              px={2}
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
              pl={6}
              pt={3}
              title="Extra BAL (veBAL boost)"
              tooltipText={extraBalTooltipText}
            />
            <Divider />
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={maxVeBalDisplayed}
              backgroundColor="background.level3"
              boxBackground={balRewardGradient}
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor="font.special"
              pl={2}
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
      {isMaBeetsPresent && (
        <>
          <Divider />
          <Stack gap={0} roundedBottom="md">
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={maxMaBeetsRewardDisplayed}
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor={colorMode == 'light' ? 'gray.600' : 'gray.400'}
              fontWeight={500}
              pl={6}
              pt={3}
              title="Extra BEETS (max maturity boost)"
              tooltipText={maBeetsRewardTooltipText}
            />
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={maxMaBeetsVotingRewardDisplayed}
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor={colorMode == 'light' ? 'gray.600' : 'gray.400'}
              fontWeight={500}
              pl={6}
              title="Extra Voting APR"
              tooltipText={maBeetsVotingRewardsTooltipText}
            />
            <Divider />
            <TooltipAprItem
              {...basePopoverAprItemProps}
              apr={maBeetsTotalAprDisplayed}
              backgroundColor="background.level3"
              boxBackground={balRewardGradient}
              displayValueFormatter={usedDisplayValueFormatter}
              fontColor="font.special"
              pl={2}
              pt={3}
              roundedBottom="md"
              textBackground="background.special"
              textBackgroundClip="text"
              title="Max total APR"
            />
          </Stack>
        </>
      )}
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
