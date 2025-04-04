import { Button, HStack, Skeleton, Text, Stack } from '@chakra-ui/react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { MagicStickIcon } from '@repo/lib/shared/components/icons/MagicStickIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { MyVotesStatsCard } from './shared/MyVotesStatsCard'
import { MyIncentivesAprTooltip } from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesStats/shared/MyIncentivesAprTooltip'

interface Props {
  myVebalBalance: number | undefined
  loading: boolean
}

export function MyVotesStatsMyIncentivesOptimized({ myVebalBalance, loading }: Props) {
  const { toCurrency } = useCurrency()

  const { isConnected } = useUserAccount()

  const isApplied = false // fix: (votes) provide real value

  function getButtonProps() {
    if (isApplied) {
      return {
        variant: 'outline',
        isDisabled: true,
        children: 'Applied',
      }
    }

    if (myVebalBalance) {
      return {
        variant: 'primary',
        children: (
          <HStack spacing="xs">
            <MagicStickIcon />
            <Text color="font.dark" fontSize="sm" fontWeight="700">
              Apply
            </Text>
          </HStack>
        ),
      }
    }

    return {
      variant: 'primary',
      children: 'Get veBAL',
    }
  }

  const optimizedRewardValue = 86.65 // fix: (votes) provide real value
  const totalWithVotesOptimized = 154.25 // fix: (votes) provide real value

  const headerText =
    !isConnected || !myVebalBalance
      ? 'Voting incentives APR (average)'
      : 'My incentives with optimized votes (1w)'

  return (
    <MyVotesStatsCard
      headerText={headerText}
      leftContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : (
          <HStack spacing="xs">
            <Text fontSize="lg" fontWeight={700} variant="special">
              {toCurrency(optimizedRewardValue, { abbreviated: false })}
            </Text>
            <MyIncentivesAprTooltip totalWithVotesOptimized={totalWithVotesOptimized} />
          </HStack>
        )
      }
      rightContent={
        loading ? (
          <Skeleton height="28px" w="100px" />
        ) : isConnected ? (
          <Button onClick={() => alert('@TODO')} size="sm" {...getButtonProps()} />
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
