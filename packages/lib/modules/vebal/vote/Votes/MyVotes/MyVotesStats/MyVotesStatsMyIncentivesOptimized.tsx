import { Button, HStack, Skeleton, Text, Stack } from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { MagicStickIcon } from '@repo/lib/shared/components/icons/MagicStickIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from './shared/MyVotesStatsCard'
import { useVeBALIncentives } from './useVeBALIncentives'
import { useVebalUserData } from '@repo/lib/modules/vebal/useVebalUserData'
import { fNum } from '@repo/lib/shared/utils/numbers'
import NextLink from 'next/link'

export function MyVotesStatsMyIncentivesOptimized() {
  const { toCurrency } = useCurrency()
  const { isConnected, userAddress } = useUserAccount()
  const { isLoading: vebalUserDataLoading, noVeBALBalance } = useVebalUserData()

  // fix: (votes) add new state when we are able to calculate optimized votes
  // const isApplied = false
  // if (isApplied) {
  //   return {
  //     variant: 'outline',
  //     isDisabled: true,
  //     children: 'Applied',
  //   }
  // }

  const { incentives, incentivesAreLoading } = useVeBALIncentives(userAddress)

  const isLoading = incentivesAreLoading || vebalUserDataLoading

  const optimizedRewardValue: number | undefined = undefined // fix: (votes) provide real value
  // const totalWithVotesOptimized = 154.25 // fix: (votes) provide real value

  const headerText =
    !isConnected || noVeBALBalance
      ? 'Voting incentives APR (average)'
      : 'My incentives with optimized votes (1w)'

  return (
    <MyVotesStatsCard
      headerText={headerText}
      leftContent={
        isLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : !isConnected || noVeBALBalance ? (
          <Text fontSize="lg" fontWeight={700} variant="special">
            {incentives.voting ? fNum('feePercent', incentives.voting) : <>&mdash;</>}
          </Text>
        ) : (
          <HStack spacing="xs">
            <Text fontSize="lg" fontWeight={700} variant="special">
              {optimizedRewardValue ? (
                toCurrency(optimizedRewardValue, { abbreviated: false })
              ) : (
                <>&mdash;</>
              )}
            </Text>
            {/* TODO: (votes) show when algorithm in place <MyIncentivesAprTooltip totalWithVotesOptimized={totalWithVotesOptimized} /> */}
          </HStack>
        )
      }
      rightContent={
        isLoading ? (
          <Skeleton height="28px" w="100px" />
        ) : isConnected && noVeBALBalance ? (
          <Button as={NextLink} href="/vebal/manage/lock" size="sm" variant="primary">
            Get veBAL
          </Button>
        ) : isConnected ? (
          <Button size="sm" variant="primary">
            <HStack spacing="xs">
              <MagicStickIcon />
              <Text color="font.dark" fontSize="sm" fontWeight="700">
                Coming soon
              </Text>
            </HStack>
          </Button>
        ) : (
          <Stack>
            <ConnectWallet size="sm" variant="primary" />
          </Stack>
        )
      }
      variant="special"
    />
  )
}
