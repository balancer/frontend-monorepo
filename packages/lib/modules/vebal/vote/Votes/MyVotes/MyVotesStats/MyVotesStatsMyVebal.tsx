import { Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { fNum } from '@repo/lib/shared/utils/numbers'
import NextLink from 'next/link'
import { useVebalLockInfo } from '@repo/lib/modules/vebal/useVebalLockInfo'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useLockEndDate } from '@repo/lib/modules/vebal/lock/duration/useLockDuration'
import { expectedTotalVeBal } from '@repo/lib/modules/vebal/lock/VebalLockProvider'
import { MyVotesStatsCard } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVotesStatsCard'
import { MyVebalChargeTooltip } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyVebalChargeTooltip'

interface Props {
  myVebalBalance: number | undefined
  loading: boolean
}

export function MyVotesStatsMyVebal({ myVebalBalance, loading }: Props) {
  const { isConnected } = useUserAccount()

  const { mainnetLockedInfo } = useVebalLockInfo()
  const lockedEndDate = mainnetLockedInfo.lockedEndDate
  const isExpired = mainnetLockedInfo.isExpired

  const lockedAmount = mainnetLockedInfo.hasExistingLock
    ? mainnetLockedInfo.lockedAmount
    : undefined

  function getButtonProps() {
    if (isExpired) {
      return {
        variant: 'primary',
        children: 'Manage',
      }
    }

    if (myVebalBalance) {
      return {
        variant: 'tertiary',
        children: 'Get veBAL',
      }
    }

    return {
      variant: 'primary',
      children: 'Get veBAL',
    }
  }

  const { maxLockEndDate } = useLockEndDate({
    lockedEndDate: lockedEndDate ? new Date(lockedEndDate) : undefined,
  })

  const expectedVeBalAmount = expectedTotalVeBal({
    bpt: lockedAmount ?? '0',
    lockEndDate: maxLockEndDate,
  })

  const balance = !isExpired ? fNum('token', myVebalBalance || 0) : '0'

  return (
    <MyVotesStatsCard
      headerText="My veBAL"
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : myVebalBalance ? (
          <HStack spacing="xs">
            <Text color="font.maxContrast" fontSize="lg" fontWeight={700}>
              {balance}
            </Text>
            {lockedEndDate && (
              <MyVebalChargeTooltip
                expectedVeBalAmount={expectedVeBalAmount.toNumber()}
                isExpired={isExpired}
                lockedEndDate={lockedEndDate}
              />
            )}
          </HStack>
        ) : undefined
      }
      rightContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : isConnected ? (
          <Button as={NextLink} href="/vebal/manage/lock" size="sm" {...getButtonProps()} />
        ) : (
          <VStack>
            <ConnectWallet size="sm" variant="primary" />
          </VStack>
        )
      }
      variant={isExpired ? 'expired' : 'default'}
    />
  )
}
