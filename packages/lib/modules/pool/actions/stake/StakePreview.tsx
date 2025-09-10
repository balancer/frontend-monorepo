import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { WalletIcon } from '@repo/lib/shared/components/icons/WalletIcon'
import { VStack, Card, HStack, Text } from '@chakra-ui/react'
import { Address } from 'viem'
import { usePool } from '../../PoolProvider'
import { useStake } from './StakeProvider'
import StakeAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/StakeAprTooltip'
import { useGetPoolRewards } from '../../useGetPoolRewards'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'

export function StakePreview() {
  const { pool } = usePool()
  const { stakeTxHash, quoteAmountIn, quoteAmountInUsd, transactionSteps } = useStake()
  const { weeklyRewards } = useGetPoolRewards(pool)

  return (
    <VStack spacing="sm" w="full">
      <Card variant="subSection">
        <TokenRow
          address={pool.address as Address}
          chain={pool.chain}
          isBpt
          label={
            <HStack color="grayText">
              <WalletIcon />
              <Text color="grayText">
                {stakeTxHash ? 'Staked LP tokens' : 'Stakeable LP tokens'}
              </Text>
            </HStack>
          }
          pool={pool}
          value={quoteAmountIn}
        />
      </Card>

      <StakeAprTooltip pool={pool} totalUsdValue={quoteAmountInUsd} weeklyRewards={weeklyRewards} />
      {stakeTxHash && (
        <GasCostSummaryCard chain={pool.chain} transactionSteps={transactionSteps.steps} />
      )}
    </VStack>
  )
}
