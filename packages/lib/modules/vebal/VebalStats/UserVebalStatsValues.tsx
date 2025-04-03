'use client'

import { useMemo } from 'react'
import { Heading, HStack, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
import { differenceInDays, format } from 'date-fns'
import BigNumber from 'bignumber.js'
import { useVebalLockData } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'
import { PRETTY_DATE_FORMAT } from '@repo/lib/modules/vebal/lock/duration/lock-duration.constants'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'
import { useUserAccount } from '../../web3/UserAccountProvider'

export type VebalUserStatsValues = {
  balance: string
  rank: number
  percentOfAllSupply: BigNumber | undefined
  lockedUntil: string | undefined
  lockExpired: boolean | undefined
}

export function UserVebalStatsValues() {
  const { isConnected } = useUserAccount()
  const lockData = useVebalLockData()
  const vebalUserData = useVebalUserData()

  const userStats: VebalUserStatsValues | undefined = useMemo(() => {
    if (isConnected) {
      const balance = vebalUserData.data ? vebalUserData.data.veBalGetUser.balance : '0'
      const rank = vebalUserData.data?.veBalGetUser.rank ? vebalUserData.data.veBalGetUser.rank : 0
      const percentOfAllSupply = vebalUserData.data
        ? bn(vebalUserData.data.veBalGetUser.balance || 0).div(
            lockData.mainnetLockedInfo.totalSupply || 0
          )
        : undefined
      const lockedUntil = lockData.mainnetLockedInfo.lockedEndDate
        ? format(lockData.mainnetLockedInfo.lockedEndDate, 'yyyy-MM-dd')
        : undefined

      const lockExpired =
        lockData.mainnetLockedInfo.isExpired === undefined ||
        lockData.mainnetLockedInfo.isExpired === true

      return {
        balance,
        rank,
        percentOfAllSupply,
        lockedUntil,
        lockExpired,
      }
    }
  }, [lockData.mainnetLockedInfo, isConnected, vebalUserData.data])

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
            {userStats && !userStats.lockExpired ? fNum('token', userStats.balance) : 0}
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
            {userStats && !userStats.lockExpired ? fNum('integer', userStats.rank) : <>&mdash;</>}
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
            {userStats && !userStats.lockExpired && userStats.percentOfAllSupply ? (
              fNum('feePercent', userStats.percentOfAllSupply)
            ) : (
              <>0%</>
            )}
          </Heading>
        )}
      </VStack>
      <VStack align="flex-start" spacing="0" w="full">
        <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
          {userStats && !userStats.lockExpired ? <>Expiry date</> : <>Expired on</>}
        </Text>
        {lockData.isLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Tooltip
            label={
              userStats?.lockExpired
                ? 'You are no longer receiving veBAL benefits like voting incentives and a share of protocol revenue.'
                : userStats?.lockedUntil
                  ? `Expires ${format(new Date(userStats.lockedUntil), PRETTY_DATE_FORMAT)}`
                  : undefined
            }
          >
            <Heading color={userStats?.lockExpired ? 'font.error' : undefined} size="h4">
              {!userStats?.lockedUntil ? (
                <>&mdash;</>
              ) : userStats.lockExpired ? (
                <HStack>
                  <>{format(new Date(userStats.lockedUntil), PRETTY_DATE_FORMAT)}</>
                  <AlertIcon />
                </HStack>
              ) : (
                `${differenceInDays(new Date(userStats.lockedUntil), new Date())} days`
              )}
            </Heading>
          </Tooltip>
        )}
      </VStack>
    </>
  )
}
