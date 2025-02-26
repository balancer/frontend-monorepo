/* eslint-disable max-len */
import { GqlChain, GqlPoolAprItem, GqlPoolAprItemType } from '../services/api/generated/graphql'
import { useThemeColorMode } from '../services/chakra/useThemeColorMode'
import { bn } from '../utils/numbers'
import BigNumber from 'bignumber.js'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export const swapFeesTooltipText = `LPs earn fees when swaps are routed through this pool. The displayed APR is net earnings for LPs (with all protocol fees already deducted). Fees automatically compound into positions—no claiming needed.`

export const inherentTokenYieldTooltipText = `LPs earn the inherent yield from yield bearing tokens. The displayed APR is net earnings for LPs, accounting for the token’s share of the pool (with all protocol fees already deducted). Fees automatically compound into positions—no claiming needed.`

export const merklIncentivesTooltipText = `Merkl is a platform that allows 3rd party Incentive Providers
 to offer campaigns with additional yield for Liquidity Providers.`

export const surplusIncentivesTooltipText = `In a traditional AMM, LPs lose money to arbitrageurs. CoW AMM
prevents this loss (also called LVR), thereby increasing LP returns.`

export const extraBalTooltipText = `veBAL holders can get an extra boost of up to 2.5x on their staking yield.
The more veBAL held, the higher the boost.`

export const lockingIncentivesTooltipText = `The protocol revenue share for Liquidity Providers 
                                            with 1-year locked Balancer ve8020 tokens.`

export const votingIncentivesTooltipText = `Vote incentives are offered to veBAL holders who 
                        participate in weekly gauge voting by third parties on platforms like Hidden Hand. 
                        Your incentives are determined by your veBAL voting power compared to other voters. 
                        The listed APR represents an average rather than a guaranteed return for active participants.`

const stakingBalTooltipText = `LPs who stake earn extra ‘BAL’ liquidity mining incentives. The displayed APR is the base amount that all Stakers in this pool get (determined by weekly gauge voting). In addition, veBAL holders can get an extra boost of up to 2.5x.`

export const mevCaptureFeesTooltipText =
  'The MEV captured and shared to all LPs proportionately by the ‘MEV Capture’ hook used in this pool.'

const maBeetsVotingRewardsTooltipText =
  'To receive Voting APR you must vote for incentivized pools in the bi-weekly gauge vote. APR is dependent on your vote distribution.'

const maBeetsRewardTooltipText = 'This is the APR you will receive when a relic is fully matured.'

// Types that must be added to the total base
const TOTAL_BASE_APR_TYPES = [
  GqlPoolAprItemType.SwapFee_24H,
  GqlPoolAprItemType.IbYield,
  GqlPoolAprItemType.Staking,
  GqlPoolAprItemType.Merkl,
  GqlPoolAprItemType.Surplus_24H,
  GqlPoolAprItemType.VebalEmissions,
  GqlPoolAprItemType.MabeetsEmissions,
]

// Types that must be added to the total APR
export const TOTAL_APR_TYPES = [
  ...TOTAL_BASE_APR_TYPES,
  GqlPoolAprItemType.Voting,
  GqlPoolAprItemType.Locking,
  GqlPoolAprItemType.StakingBoost,
]

function absMaxApr(aprItems: GqlPoolAprItem[], boost?: number) {
  return aprItems
    .filter(item => TOTAL_APR_TYPES.includes(item.type))
    .reduce((acc, item) => {
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
  chain,
}: {
  aprItems: GqlPoolAprItem[]
  numberFormatter: (value: string) => BigNumber
  vebalBoost?: number
  chain: GqlChain
}) {
  const colorMode = useThemeColorMode()

  const {
    options: { showVeBal },
  } = PROJECT_CONFIG

  const hasVeBalBoost =
    showVeBal && !!aprItems.find(item => item.type === GqlPoolAprItemType.StakingBoost)

  // Swap fees
  const swapFee = aprItems.find(item => item.type === GqlPoolAprItemType.SwapFee_24H)
  const swapFeesDisplayed = numberFormatter(swapFee ? swapFee.apr.toString() : '0')

  // Dynamic wap fees (MEV Capture, StableSurge)
  const dynamicSwapFee = aprItems.find(item => item.type === GqlPoolAprItemType.DynamicSwapFee_24H)
  const dynamicSwapFeesDisplayed = numberFormatter(
    dynamicSwapFee ? dynamicSwapFee.apr.toString() : '0'
  )

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
    tooltipText: `3rd party incentives for LPs who stake. These token incentives are outside the ${showVeBal || chain === GqlChain.Optimism ? 'veBAL' : 'gauge bounty'} system.`,
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
  const surplusIncentives = filterByType(aprItems, GqlPoolAprItemType.Surplus_24H)
  const surplusIncentivesAprDisplayed = calculateSingleIncentivesAprDisplayed(surplusIncentives)

  // Bal Reward
  const balReward = aprItems.find(item => item.type === GqlPoolAprItemType.VebalEmissions)

  const maxVeBal = hasVeBalBoost ? absMaxApr(aprItems, vebalBoost) : bn(0)
  const maxVeBalDisplayed = numberFormatter(maxVeBal.toString())

  // maBEETS Rewards (Beets)
  const maBeetsReward = aprItems.find(item => item.type === GqlPoolAprItemType.MabeetsEmissions)

  const maBeetsRewardsDisplayed = numberFormatter(
    maBeetsReward ? maBeetsReward.apr.toString() : '0'
  )

  const maxMaBeetsReward = aprItems.find(
    item => item.type === GqlPoolAprItemType.StakingBoost && item.id.match(/beets-apr-boost/) // TODO: or add prop in api to distinguish?
  )

  const maxMaBeetsRewardDisplayed = numberFormatter(
    maxMaBeetsReward ? maxMaBeetsReward.apr.toString() : '0'
  )

  const maxMaBeetsVotingReward = aprItems.find(
    item => item.type === GqlPoolAprItemType.StakingBoost && item.id.match(/voting-apr-boost/) // TODO: or add prop in api to distinguish?
  )

  const maxMaBeetsVotingRewardDisplayed = numberFormatter(
    maxMaBeetsVotingReward ? maxMaBeetsVotingReward.apr.toString() : '0'
  )

  const maBeetsTotalAprDisplayed = bn(swapFeesDisplayed)
    .plus(yieldBearingTokensAprDisplayed)
    .plus(maBeetsRewardsDisplayed)
    .plus(maxMaBeetsRewardDisplayed)
    .plus(maxMaBeetsVotingRewardDisplayed)

  const isMaBeetsPresent = !maBeetsRewardsDisplayed.isZero()

  const totalBase = aprItems
    .filter(item => TOTAL_BASE_APR_TYPES.includes(item.type))
    .reduce((acc, item) => acc.plus(item.apr), bn(0))
  const totalBaseDisplayed = numberFormatter(totalBase.toString())

  const totalCombined = aprItems
    .filter(item => TOTAL_APR_TYPES.includes(item.type))
    .reduce((acc, item) => acc.plus(item.apr), bn(0))
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
  const isDynamicSwapFeePresent = !dynamicSwapFeesDisplayed.isZero()
  const isYieldPresent = !yieldBearingTokensAprDisplayed.isZero()
  const isStakingPresent = !stakingIncentivesAprDisplayed.isZero()

  const isVotingPresent = !votingAprDisplayed.isZero()
  const isLockingAprPresent = !lockingAprDisplayed.isZero()

  const subitemPopoverAprItemProps = {
    pt: 2,
    pl: 'sm',
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
    isMaBeetsPresent,
    maBeetsRewardsDisplayed,
    maxMaBeetsRewardDisplayed,
    maBeetsRewardTooltipText,
    maxMaBeetsVotingRewardDisplayed,
    maBeetsVotingRewardsTooltipText,
    maBeetsTotalAprDisplayed,
    isDynamicSwapFeePresent,
    dynamicSwapFeesDisplayed,
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
