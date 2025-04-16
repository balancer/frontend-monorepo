'use client'

import { Heading, HStack, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import { PRETTY_DATE_FORMAT } from '@repo/lib/modules/vebal/lock/duration/lock-duration.constants'
import { AlertIcon } from '@repo/lib/shared/components/icons/AlertIcon'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { differenceInDays, format } from 'date-fns'
import { formatUserVebal, useVebalUserStats } from './useVeBalUserStats'

export function UserVebalStatsValues() {
  const { lockedInfoIsLoading, userDataIsLoading, userStats } = useVebalUserStats()

  const userVebal = formatUserVebal(userStats)

  return (
    <>
      <VStack align="flex-start" spacing="0" w="full">
        <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
          My veBAL
        </Text>
        {userDataIsLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <Heading size="h4">{userVebal}</Heading>
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
