import { GqlPoolAprItem, GqlPoolAprItemType } from '../services/api/generated/graphql'
import { useThemeColorMode } from '../services/chakra/useThemeColorMode'
import { bn } from '../utils/numbers'
import BigNumber from 'bignumber.js'

export const swapFeesTooltipText = `LPs get swap fees anytime a swap is routed through this pool.
These fees automatically accumulate into the LP's position, so there is no need to periodically claim.`

export const inherentTokenYieldTooltipText = `Inherent token yield,
 accounting for the token's share of the overall pool,
 minus any protocol fees.`

export const merklIncentivesTooltipText = `Merkl is a platform that allows 3rd party Incentive Providers
 to offer campaigns with additional yield for Liquidity Providers.`

export const surplusIncentivesTooltipText = `In a traditional AMM, LPs lose money to arbitrageurs. CoW AMM
prevents this loss (also called LVR), thereby increasing LP returns.`

export const extraBalTooltipText = `veBAL holders can get an extra boost of up to 2.5x on their staking yield.
The more veBAL held, the higher the boost.`

export const lockingIncentivesTooltipText = `Special incentives for liquidity providers who lock
their Balancer ve8020 pool tokens.`

export const votingIncentivesTooltipText = `To get voting incentives from Hidden Hand,
you must hold veBAL and have active votes for vote-incentivized pools in the weekly gauge vote.
The APR listed is the average. Your incentives will be based on your veBAL voting weight vs other voters.`

const stakingBalTooltipText = `The base APR all stakers in this pool get (determined by weekly gauge voting).
In addition, veBAL holders can get an extra boost of up to 2.5x.`

const stakingTokenTooltipText = '3rd party incentives (outside the veBAL system)'

// Types that must be added to the total base
const TOTAL_BASE_APR_TYPES = [
  GqlPoolAprItemType.SwapFee,
  GqlPoolAprItemType.IbYield,
  GqlPoolAprItemType.Staking,
  GqlPoolAprItemType.Merkl,
  GqlPoolAprItemType.Surplus,
  GqlPoolAprItemType.VebalEmissions,
]

// Types that must be added to the total APR
export const TOTAL_APR_TYPES = [
  ...TOTAL_BASE_APR_TYPES,
  GqlPoolAprItemType.Voting,
  GqlPoolAprItemType.Locking,
  GqlPoolAprItemType.StakingBoost,
]

function absMaxApr(aprItems: GqlPoolAprItem[], boost?: number) {
  return aprItems.reduce((acc, item) => {
    const hasBoost = boost && boost > 1
    if (hasBoost && item.type === GqlPoolAprItemType.Staking) {
      return acc.plus(bn(item.apr).times(boost))
    }

    return acc.plus(bn(item.apr))
  }, bn(0))
}

export function useAprTooltip({
  aprItems,
  numberFormatter,
  vebalBoost,
}: {
  aprItems: GqlPoolAprItem[]
  numberFormatter: (value: string) => BigNumber
  vebalBoost?: number
}) {
  const colorMode = useThemeColorMode()

  const hasVeBalBoost = !!aprItems.find(item => item.type === GqlPoolAprItemType.StakingBoost)

  // Swap fees
  const swapFee = aprItems.find(item => item.type === GqlPoolAprItemType.SwapFee)
  const swapFeesDisplayed = numberFormatter(swapFee ? swapFee.apr.toString() : '0')

  // Yield bearing tokens
  const yieldBearingTokens = aprItems.filter(item => {
    return item.type === GqlPoolAprItemType.IbYield
  })

  const yieldBearingTokensDisplayed = yieldBearingTokens.map(item => ({
    title: item.rewardTokenSymbol || '',
    apr: numberFormatter(item.apr.toString()),
  }))

  const yieldBearingTokensAprDisplayed = yieldBearingTokensDisplayed.reduce(
    (acc, item) => acc.plus(item.apr),
    bn(0)
  )

  // Staking incentives
  const stakingIncentives = aprItems.filter(item => {
    return item.type === GqlPoolAprItemType.Staking
  })

  const stakingIncentivesDisplayed = stakingIncentives.map(item => ({
    title: item.rewardTokenSymbol || '',
    apr: numberFormatter(item.apr.toString()),
    tooltipText: stakingTokenTooltipText,
  }))

  const votingApr = aprItems.find(item => item.type === GqlPoolAprItemType.Voting)
  const votingAprDisplayed = numberFormatter(votingApr ? votingApr.apr.toString() : '0')

  const lockingApr = aprItems.find(item => item.type === GqlPoolAprItemType.Locking)
  const lockingAprDisplayed = numberFormatter(lockingApr ? lockingApr.apr.toString() : '0')

  // Merkl incentives
  const merklIncentives = filterByType(aprItems, GqlPoolAprItemType.Merkl)
  const hasMerklIncentives = merklIncentives.length > 0
  const merklIncentivesAprDisplayed = calculateSingleIncentivesAprDisplayed(merklIncentives)

  // Surplus incentives
  const surplusIncentives = filterByType(aprItems, GqlPoolAprItemType.Surplus)
  const hasSurplusIncentives = surplusIncentives.length > 0
  const surplusIncentivesAprDisplayed = calculateSingleIncentivesAprDisplayed(surplusIncentives)

  // Bal Reward
  const balReward = aprItems.find(item => item.type === GqlPoolAprItemType.VebalEmissions)

  const maxVeBal = hasVeBalBoost ? absMaxApr(aprItems, vebalBoost) : bn(0)
  const maxVeBalDisplayed = numberFormatter(maxVeBal.toString())

  const totalBase = aprItems
    .filter(item => TOTAL_BASE_APR_TYPES.includes(item.type))
    .reduce((acc, item) => acc.plus(item.apr), bn(0))
  const totalBaseDisplayed = numberFormatter(totalBase.toString())

  const totalCombined = aprItems.reduce((acc, item) => acc.plus(item.apr), bn(0))
  const totalCombinedDisplayed = numberFormatter(totalCombined.toString())

  const extraBalAprDisplayed = hasVeBalBoost ? maxVeBalDisplayed.minus(totalBaseDisplayed) : bn(0)

  if (balReward) {
    stakingIncentivesDisplayed.push({
      title: balReward.rewardTokenSymbol || '',
      apr: numberFormatter(balReward.apr.toString()),
      tooltipText: stakingBalTooltipText,
    })
  }

  const stakingIncentivesAprDisplayed = stakingIncentivesDisplayed.reduce(
    (acc, item) => acc.plus(item.apr),
    bn(0)
  )

  const isSwapFeePresent = !swapFeesDisplayed.isZero()
  const isYieldPresent = !yieldBearingTokensAprDisplayed.isZero()
  const isStakingPresent = !stakingIncentivesAprDisplayed.isZero()

  const isVotingPresent = !votingAprDisplayed.isZero()
  const isLockingAprPresent = !lockingAprDisplayed.isZero()

  const subitemPopoverAprItemProps = {
    pt: 2,
    backgroundColor: 'background.level1',
    fontWeight: 500,
    fontColor: colorMode == 'light' ? 'gray.600' : 'gray.400',
  }

  return {
    totalBaseDisplayed,
    extraBalAprDisplayed,
    yieldBearingTokensAprDisplayed,
    stakingIncentivesAprDisplayed,
    swapFeesDisplayed,
    isSwapFeePresent,
    isYieldPresent,
    isStakingPresent,
    maxVeBalDisplayed,
    yieldBearingTokensDisplayed,
    stakingIncentivesDisplayed,
    merklIncentivesAprDisplayed,
    hasMerklIncentives,
    surplusIncentivesAprDisplayed,
    hasSurplusIncentives,
    votingAprDisplayed,
    lockingAprDisplayed,
    isVotingPresent,
    isLockingAprPresent,
    subitemPopoverAprItemProps,
    hasVeBalBoost,
    maxVeBal,
    totalBase,
    totalCombined,
    totalCombinedDisplayed,
  }
}

function filterByType(aprItems: GqlPoolAprItem[], type: GqlPoolAprItemType) {
  return aprItems.filter(item => {
    return item.type === type
  })
}

function calculateSingleIncentivesAprDisplayed(aprItems: GqlPoolAprItem[]) {
  return aprItems.reduce((acc, item) => acc.plus(item.apr), bn(0))
}
