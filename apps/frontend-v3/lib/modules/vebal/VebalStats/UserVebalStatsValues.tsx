'use client'

import React, { useMemo } from 'react'
import { Heading, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import { bn, fNum } from '@/lib/shared/utils/numbers'
import { useVebalUserData } from '@/lib/modules/vebal/useVebalUserData'
import { useVebalLockInfo } from '@/lib/modules/vebal/useVebalLockInfo'
import { differenceInDays, format } from 'date-fns'
import BigNumber from 'bignumber.js'

export type VebalUserStatsValues = {
  balance: string | undefined
  rank: number | undefined
  percentOfAllSupply: BigNumber | undefined
  lockedUntil: string | undefined
}

export function UserVebalStatsValues() {
  const lockInfo = useVebalLockInfo()
  const vebalUserData = useVebalUserData()

  const vebalUserStatsValues: VebalUserStatsValues | undefined = useMemo(() => {
    if (vebalUserData.isConnected) {
      const balance = vebalUserData.data?.veBalGetUser.balance
      const rank = vebalUserData.data?.veBalGetUser.rank ?? undefined
      const percentOfAllSupply = vebalUserData.data
        ? bn(vebalUserData.data.veBalGetUser.balance || 0).div(
            lockInfo.mainnetLockedInfo.totalSupply || 0
          )
        : undefined
      const lockedUntil =
        !lockInfo.mainnetLockedInfo.lockedEndDate || lockInfo.mainnetLockedInfo.isExpired
          ? undefined
          : format(lockInfo.mainnetLockedInfo.lockedEndDate, 'yyyy-MM-dd')

      return {
        balance,
        rank,
        percentOfAllSupply,
        lockedUntil,
      }
    }
  }, [lockInfo.mainnetLockedInfo, vebalUserData.isConnected, vebalUserData.data])

  return (
    <>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          My veBAL
        </Text>
        {vebalUserData.loading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Heading size="h4">
            {typeof vebalUserStatsValues?.balance === 'string' ? (
              fNum('token', vebalUserStatsValues.balance)
            ) : (
              <>&mdash;</>
            )}
          </Heading>
        )}
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          My rank
        </Text>
        {vebalUserData.loading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Heading size="h4">{vebalUserStatsValues?.rank ?? <>&mdash;</>}</Heading>
        )}
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          My share of veBAL
        </Text>
        {vebalUserData.loading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Heading size="h4">
            {vebalUserStatsValues?.percentOfAllSupply ? (
              fNum('feePercent', vebalUserStatsValues.percentOfAllSupply)
            ) : (
              <>&mdash;</>
            )}
          </Heading>
        )}
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          Expiry date
        </Text>
        {lockInfo.isLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Tooltip
            label={
              vebalUserStatsValues?.lockedUntil
                ? `Expires ${format(new Date(vebalUserStatsValues.lockedUntil), 'dd MMM yyyy')}`
                : undefined
            }
          >
            <Heading size="h4">
              {vebalUserStatsValues?.lockedUntil ? (
                `${differenceInDays(new Date(vebalUserStatsValues.lockedUntil), new Date())} days`
              ) : (
                <>&mdash;</>
              )}
            </Heading>
          </Tooltip>
        )}
      </VStack>
    </>
  )
}
