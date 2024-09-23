import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { useMemo } from 'react'
import { bn } from '@/lib/shared/utils/numbers'
import { isUndefined } from 'lodash'
import { useGaugesSupplyAndBalance } from './useGaugesSupplyAndBalance'
import { useGaugeTotalSupplyAndUserBalance } from './useGaugeTotalSupplyAndUserBalance'
import { useVebalLockInfo } from './useVebalLockInfo'
import { getChainId } from '@/lib/config/app.config'
import { Pool } from '../pool/PoolProvider'

export type VeBalLockInfo = {
  lockedEndDate: number
  lockedAmount: string
  totalSupply: string
  epoch: string
  hasExistingLock: boolean
  isExpired: boolean
}

export interface GaugeArg {
  chain: GqlChain
  gaugeAddress: string
  poolId: string
}

type OnchainVebalBalance = { result: bigint; status: string }

function calcUserBoost({
  userGaugeBalance,
  gaugeTotalSupply,
  userVeBALBalance,
  veBALTotalSupply,
}: {
  userGaugeBalance: string
  gaugeTotalSupply: string
  userVeBALBalance: string
  veBALTotalSupply: string
}): string {
  const _userGaugeBalance = bn(userGaugeBalance)
  const _gaugeTotalSupply = bn(gaugeTotalSupply)
  const _userVeBALBalance = bn(userVeBALBalance)
  const _veBALTotalSupply = bn(veBALTotalSupply)

  const boost = bn(_userGaugeBalance).gt(0)
    ? bn(1).plus(
        bn(1.5)
          .times(_userVeBALBalance)
          .div(_veBALTotalSupply)
          .times(_gaugeTotalSupply)
          .div(_userGaugeBalance)
      )
    : bn(1)

  const minBoost = bn(2.5).lt(boost) ? 2.5 : boost

  return minBoost.toString()
}

export function useVebalBoost(pools: Pool[]) {
  const { mainnetLockedInfo } = useVebalLockInfo()

  const gauges = useMemo(() => {
    if (!pools) return []

    const gauges = pools.map(p => {
      if (p.staking?.gauge?.status === 'KILLED') return []

      const gaugeAddress = p.staking?.gauge?.gaugeAddress

      if (!gaugeAddress) return []

      return {
        chain: p.chain,
        gaugeAddress,
        poolId: p.id,
      }
    })

    return gauges.flat()
  }, [pools])

  const { veBalTotalSupplyL2, userVeBALBalances } = useGaugeTotalSupplyAndUserBalance(gauges)

  const { gaugeDataByPoolMap } = useGaugesSupplyAndBalance(gauges)

  const veBalBoostMap = useMemo(() => {
    return Object.entries(gaugeDataByPoolMap).reduce(
      (acc, [poolId, { totalSupply, userBalance, gauge }]) => {
        const gaugeChainId = getChainId(gauge.chain)

        const userVeBALChainBalance = userVeBALBalances?.[gaugeChainId]?.data as
          | Record<GqlChain, OnchainVebalBalance>
          | undefined
        const veBALChainTotalSupply = veBalTotalSupplyL2?.[gaugeChainId]?.data as
          | Record<GqlChain, OnchainVebalBalance>
          | undefined

        const userVeBALBalance = userVeBALChainBalance?.[gauge.chain]?.result

        const veBALTotalSupply =
          gauge.chain === GqlChain.Mainnet
            ? mainnetLockedInfo.totalSupply
            : veBALChainTotalSupply?.[gauge.chain]?.result || 0

        if (
          isUndefined(userVeBALBalance) ||
          isUndefined(veBALTotalSupply) ||
          isUndefined(totalSupply) ||
          isUndefined(userBalance)
        ) {
          return acc
        }

        const userBoost = calcUserBoost({
          userGaugeBalance: userBalance,
          gaugeTotalSupply: totalSupply,
          userVeBALBalance: userVeBALBalance.toString(),
          veBALTotalSupply: veBALTotalSupply.toString(),
        })

        acc[poolId] = userBoost

        return acc
      },
      {} as Record<string, string>
    )
  }, [gaugeDataByPoolMap, veBalTotalSupplyL2, userVeBALBalances, mainnetLockedInfo])

  return { veBalBoostMap }
}
