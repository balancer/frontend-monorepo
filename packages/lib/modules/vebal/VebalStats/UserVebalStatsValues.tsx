'use client'

import { useMemo } from 'react'
import { Heading, HStack, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import { bn, fNum, isSuperSmallAmount } from '@repo/lib/shared/utils/numbers'
import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
import { differenceInDays, format } from 'date-fns'
import BigNumber from 'bignumber.js'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { PRETTY_DATE_FORMAT } from '@repo/lib/modules/vebal/lock/duration/lock-duration.constants'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'

export type VebalUserStatsValues = {
  balance: string | undefined
  rank: number | undefined
  percentOfAllSupply: BigNumber | undefined
  lockedUntil: string | undefined
  lockExpired: boolean | undefined
}

export function UserVebalStatsValues() {
  const lockData = useVebalLockData()
  const vebalUserData = useVebalUserData()

  const vebalUserStatsValues: VebalUserStatsValues | undefined = useMemo(() => {
    if (vebalUserData.isConnected) {
      const balance = vebalUserData.data?.veBalGetUser.balance
      const rank = vebalUserData.data?.veBalGetUser.rank ?? undefined
      const percentOfAllSupply = vebalUserData.data
        ? bn(vebalUserData.data.veBalGetUser.balance || 0).div(
            lockData.mainnetLockedInfo.totalSupply || 0
          )
        : undefined
      const lockedUntil = lockData.mainnetLockedInfo.lockedEndDate
        ? format(lockData.mainnetLockedInfo.lockedEndDate, 'yyyy-MM-dd')
        : undefined

      return {
        balance,
        rank,
        percentOfAllSupply,
        lockedUntil,
        lockExpired: lockData.mainnetLockedInfo.isExpired,
      }
    }
  }, [lockData.mainnetLockedInfo, vebalUserData.isConnected, vebalUserData.data])

  const tooSmall =
    typeof vebalUserStatsValues?.balance === 'string'
      ? isSuperSmallAmount(vebalUserStatsValues.balance)
      : false

  return (
    <>
      <VStack align="flex-start" spacing="0" w="full">
        <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
          My veBAL
        </Text>
        {vebalUserData.loading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Heading size="h4">
            {typeof vebalUserStatsValues?.balance === 'string' && !tooSmall ? (
              fNum('token', vebalUserStatsValues.balance)
            ) : (
              <>&mdash;</>
            )}
          </Heading>
        )}
      </VStack>
      <VStack align="flex-start" spacing="0" w="full">
        <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
          My rank
        </Text>
        {vebalUserData.loading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Heading size="h4">
            {vebalUserStatsValues && vebalUserStatsValues.rank && !tooSmall ? (
              fNum('integer', vebalUserStatsValues.rank)
            ) : (
              <>&mdash;</>
            )}
          </Heading>
        )}
      </VStack>
      <VStack align="flex-start" spacing="0" w="full">
        <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
          My share of veBAL
        </Text>
        {vebalUserData.loading || lockData.isLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Heading size="h4">
            {vebalUserStatsValues?.percentOfAllSupply ? (
              fNum('feePercent', tooSmall ? 0 : vebalUserStatsValues.percentOfAllSupply)
            ) : (
              <>&mdash;</>
            )}
          </Heading>
        )}
      </VStack>
      <VStack align="flex-start" spacing="0" w="full">
        <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
          Expiry date
        </Text>
        {lockData.isLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Tooltip
            label={
              vebalUserStatsValues?.lockExpired
                ? 'You are no longer receiving veBAL benefits like voting incentives and a share of protocol revenue.'
                : vebalUserStatsValues?.lockedUntil
                  ? `Expires ${format(new Date(vebalUserStatsValues.lockedUntil), PRETTY_DATE_FORMAT)}`
                  : undefined
            }
          >
            <Heading color={vebalUserStatsValues?.lockExpired ? 'font.error' : undefined} size="h4">
              {!vebalUserStatsValues?.lockedUntil ? (
                <>&mdash;</>
              ) : vebalUserStatsValues.lockExpired ? (
                <HStack>
                  <>{format(new Date(vebalUserStatsValues.lockedUntil), PRETTY_DATE_FORMAT)}</>
                  <AlertIcon />
                </HStack>
              ) : (
                `${differenceInDays(new Date(vebalUserStatsValues.lockedUntil), new Date())} days`
              )}
            </Heading>
          </Tooltip>
        )}
      </VStack>
    </>
  )
}
