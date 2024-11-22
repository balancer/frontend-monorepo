import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { BalAlertButton } from '@repo/lib/shared/components/alerts/BalAlertButton'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'
import { GqlChain, GqlPoolTokenDetail } from '@repo/lib/shared/services/api/generated/graphql'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Pool } from '../PoolProvider'
import { migrateStakeTooltipLabel } from '../actions/stake.helpers'
import {
  hasLegitRateProvider,
  hasReviewedHook,
  hasReviewedRateProvider,
  isV2Pool,
} from '../pool.helpers'
import { shouldMigrateStake } from '../user-balance.helpers'
import { VulnerabilityDataMap } from './pool-issues/PoolIssue.labels'
import { PoolIssue } from './pool-issues/PoolIssue.type'
import { BalAlertProps } from '@repo/lib/shared/components/alerts/BalAlert'
import { useHook } from '../../hooks/useHook'

export type PoolAlert = {
  identifier: string
} & BalAlertProps

export function usePoolAlerts(pool: Pool) {
  const pathname = usePathname()
  const router = useRouter()
  const [poolAlerts, setPoolAlerts] = useState<PoolAlert[]>([])
  const { hooks } = useHook(pool)

  const getNetworkPoolAlerts = (pool: Pool): PoolAlert[] => {
    const networkPoolsIssues = getNetworkConfig(pool.chain).pools?.issues

    if (!networkPoolsIssues) return []

    const poolIssues: string[] = []

    Object.keys(networkPoolsIssues).forEach(issue => {
      const poolIds = networkPoolsIssues[issue as PoolIssue]

      if (!poolIds) return
      if (!poolIds.includes(pool.id)) return

      poolIssues.push(issue)
    })

    return poolIssues.map(issue => {
      const vulnerabilityData = VulnerabilityDataMap[issue as PoolIssue]

      return {
        identifier: issue,
        content: vulnerabilityData.jsxTitle,
        learnMoreLink: vulnerabilityData.learnMoreLink,
        status: 'error',
        isSoftWarning: false,
      }
    })
  }

  const getTokenPoolAlerts = (pool: Pool): PoolAlert[] => {
    // Disable alerts for Sepolia pools
    if (pool.chain === GqlChain.Sepolia) return []

    const poolTokens = pool.poolTokens as GqlPoolTokenDetail[]
    const hook = pool.hook

    const alerts: PoolAlert[] = []

    poolTokens?.forEach(token => {
      if (isV2Pool(pool) && !token.isAllowed) {
        alerts.push({
          identifier: `TokenNotAllowed-${token.symbol}`,
          content: `The token ${token.symbol} is currently not supported.`,
          status: 'error',
          isSoftWarning: false,
        })
      }

      if (hasLegitRateProvider(token)) {
        return
      }

      if (!hasReviewedRateProvider(token)) {
        alerts.push({
          identifier: `PriceProviderNotReviewed-${token.symbol}`,
          // eslint-disable-next-line max-len
          content: `The rate provider for ${token.symbol} has not been reviewed. For your safety, you can’t interact with this pool on this UI.`,
          status: 'error',
          isSoftWarning: true,
        })
      }

      if (token.priceRateProviderData && token.priceRateProviderData?.summary !== 'safe') {
        alerts.push({
          identifier: `UnsafePriceProvider-${token.symbol}`,
          // eslint-disable-next-line max-len
          content: `The rate provider for ${token.symbol} has been reviewed as 'unsafe'. For your safety, you can't interact with this pool on this UI.`,
          status: 'error',
          isSoftWarning: true,
        })
      }
    })

    if (hook) {
      const hookName = hooks.find(
        hook => pool.hook && hook?.addresses[getChainId(pool.chain)]?.includes(pool.hook.address)
      )?.name

      if (!hasReviewedHook(hook)) {
        alerts.push({
          identifier: `PoolHookNotReviewed`,
          // eslint-disable-next-line max-len
          content: `This pool contains a hook called ${hookName} which has not been reviewed. For your safety, you can’t interact with this pool on this UI.`,
          status: 'error',
          isSoftWarning: true,
        })
      }

      if (hook.reviewData?.summary === 'unsafe') {
        alerts.push({
          identifier: `PoolHookReviewedUnsafe`,
          // eslint-disable-next-line max-len
          content: `This pool contains a hook called ${hookName} which has been reviewed as 'unsafe'. For your safety, you can’t interact with this pool on this UI.`,
          status: 'error',
          isSoftWarning: true,
        })
      }

      if (hook.reviewData?.summary === 'safe' && hook.reviewData?.warnings.length > 0) {
        alerts.push({
          identifier: `PoolHookReviewedSafeWithWarnings`,
          // eslint-disable-next-line max-len
          content: `This pool contains a a hook called ${hookName} which has been reviewed as ‘safe’ but with warnings. Please review it in the Pool contracts section.`,
          status: 'error',
          isSoftWarning: true,
        })
      }
    }

    // check alerts for nested pools & tokens
    poolTokens?.forEach(token => {
      if (token.hasNestedPool && token.nestedPool) {
        const nestedPool = token.nestedPool

        if (!nestedPool.hook) {
          return
        }

        if (nestedPool.hook) {
          const hookName = hooks.find(
            hook =>
              nestedPool.hook &&
              hook?.addresses[getChainId(pool.chain)]?.includes(nestedPool.hook.address)
          )?.name

          if (!hasReviewedHook(nestedPool.hook)) {
            alerts.push({
              identifier: `NestedPoolHookNotReviewed`,
              // eslint-disable-next-line max-len
              content: `This pool contains a nested pool with a hook called ${hookName} which has not been reviewed. For your safety, you can’t interact with this pool on this UI.`,
              status: 'error',
              isSoftWarning: true,
            })
          }

          if (nestedPool.hook?.reviewData?.summary === 'unsafe') {
            alerts.push({
              identifier: `NestedPoolHookReviewedUnsafe`,
              // eslint-disable-next-line max-len
              content: `This pool contains a nested pool with a hook called ${hookName} which has been reviewed as 'unsafe'. For your safety, you can’t interact with this pool on this UI.`,
              status: 'error',
              isSoftWarning: true,
            })
          }

          if (
            nestedPool.hook?.reviewData?.summary === 'safe' &&
            nestedPool.hook?.reviewData?.warnings.length > 0
          ) {
            alerts.push({
              identifier: `NestedPoolHookReviewedSafeWithWarnings`,
              // eslint-disable-next-line max-len
              content: `This pool contains a a hook called ${hookName} which has been reviewed as ‘safe’ but with warnings. Please review it in the Pool contracts section.`,
              status: 'error',
              isSoftWarning: true,
            })
          }
        }

        nestedPool.tokens.forEach(nestedToken => {
          if (hasLegitRateProvider(nestedToken)) {
            return
          }

          if (!hasReviewedRateProvider(nestedToken)) {
            alerts.push({
              identifier: `NestedPriceProviderNotReviewed-${nestedToken.symbol}`,
              // eslint-disable-next-line max-len
              content: `The rate provider for ${nestedToken.symbol} in a nested pool has not been reviewed. For your safety, you can’t interact with this pool on this UI.`,
              status: 'error',
              isSoftWarning: true,
            })
          }

          if (
            nestedToken.priceRateProviderData &&
            nestedToken.priceRateProviderData?.summary !== 'safe'
          ) {
            alerts.push({
              identifier: `UnsafeNestedPriceProvider-${nestedToken.symbol}`,
              // eslint-disable-next-line max-len
              content: `The rate provider for ${nestedToken.symbol} in a nested pool has been reviewed as 'unsafe'. For your safety, you can't interact with this pool on this UI.`,
              status: 'error',
              isSoftWarning: true,
            })
          }
        })
      }
    })

    return alerts
  }

  const getUserAlerts = (pool: Pool): PoolAlert[] => {
    const alerts: PoolAlert[] = []

    function MigrateStakeContent() {
      return (
        <BalAlertContent
          title="Migrate to the new veBAL staking gauge for future BAL liquidity incentives"
          tooltipLabel={migrateStakeTooltipLabel}
        >
          <BalAlertButton onClick={() => router.push(`${pathname}/migrate-stake`)}>
            Migrate
          </BalAlertButton>
        </BalAlertContent>
      )
    }

    if (shouldMigrateStake(pool)) {
      alerts.push({
        identifier: 'shouldMigrateStake',
        content: MigrateStakeContent(),
        status: 'warning',
        isSoftWarning: false,
      })
    }

    return alerts
  }

  const getPoolAlerts = (pool: Pool): PoolAlert[] => {
    const alerts: PoolAlert[] = []

    if (pool.dynamicData.isPaused && pool.dynamicData.isInRecoveryMode) {
      alerts.push({
        identifier: 'poolIsPausedAndInRecoveryMode',
        content: 'This pool is paused and in recovery mode',
        status: 'warning',
        isSoftWarning: false,
      })
    } else if (pool.dynamicData.isPaused) {
      alerts.push({
        identifier: 'poolIsPaused',
        content: 'This pool is paused',
        status: 'warning',
        isSoftWarning: false,
      })
    } else if (pool.dynamicData.isInRecoveryMode) {
      alerts.push({
        identifier: 'poolIsInRecoveryMode',
        content: 'This pool is in recovery mode',
        status: 'warning',
        isSoftWarning: false,
      })
    }

    return alerts
  }

  useEffect(() => {
    const networkPoolAlerts = getNetworkPoolAlerts(pool)
    const tokenPoolAlerts = getTokenPoolAlerts(pool)
    const userAlerts = getUserAlerts(pool)
    const poolAlerts = getPoolAlerts(pool)

    setPoolAlerts([...networkPoolAlerts, ...tokenPoolAlerts, ...userAlerts, ...poolAlerts])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool])

  return {
    poolAlerts,
    setPoolAlerts,
  }
}
