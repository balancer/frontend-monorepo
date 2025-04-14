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
import { formatUnits } from 'viem'

export type VebalUserStatsValues = {
  balance: bigint
  rank: number
  percentOfAllSupply: BigNumber | undefined
  lockedUntil: string | undefined
  lockExpired: boolean | undefined
}

export function UserVebalStatsValues() {
  const { isConnected } = useUserAccount()
  const { mainnetLockedInfo: lockedInfo, isLoading: lockedInfoIsLoading } = useVebalLockData()
  const { isLoading: userDataIsLoading, veBALBalance, rank } = useVebalUserData()

  const userStats: VebalUserStatsValues | undefined = useMemo(() => {
    if (isConnected) {
      const percentOfAllSupply = bn(formatUnits(veBALBalance, 18)).div(lockedInfo.totalSupply || 0)

      const lockedUntil = lockedInfo.lockedEndDate
        ? format(lockedInfo.lockedEndDate, 'yyyy-MM-dd')
        : undefined

      const lockExpired = lockedInfo.isExpired === undefined || lockedInfo.isExpired === true

      return {
        balance: veBALBalance,
        rank: rank || 0,
        percentOfAllSupply,
        lockedUntil,
        lockExpired,
      }
    }
  }, [lockedInfo, isConnected, veBALBalance, rank])

  return (
    <>
      <VStack align="flex-start" spacing="0" w="full">
        <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
          My veBAL
        </Text>
        {userDataIsLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Heading size="h4">
            {userStats && !userStats.lockExpired
              ? fNum('token', formatUnits(userStats.balance, 18))
              : 0}
          </Heading>
        )}
      </VStack>
      <VStack align="flex-start" spacing="0" w="full">
        <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
          My rank
        </Text>
        {userDataIsLoading ? (
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
        {userDataIsLoading || lockedInfoIsLoading ? (
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
        {lockedInfoIsLoading ? (
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
