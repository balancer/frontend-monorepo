import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { VStack, Card } from '@chakra-ui/react'
import { Address } from 'viem'
import { usePool } from '../../PoolProvider'
import { useUnstake } from './UnstakeProvider'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'

export function UnstakePreview() {
  const { pool } = usePool()
  const { unstakeTxHash, quoteAmountOut, rewardAmounts, totalClaimableUsd, transactionSteps } =
    useUnstake()

  return (
    <VStack gap="sm" w="full">
      <Card.Root variant="subSection">
        <TokenRow
          address={pool.address as Address}
          chain={pool.chain}
          isBpt
          label={unstakeTxHash ? 'Unstaked LP tokens' : 'Staked LP tokens'}
          pool={pool}
          value={quoteAmountOut}
        />
      </Card.Root>
      <Card.Root variant="subSection">
        <TokenRowGroup
          amounts={rewardAmounts}
          chain={pool.chain}
          label={unstakeTxHash ? 'Claimed rewards' : 'Claimable rewards'}
          totalUSDValue={totalClaimableUsd}
        />
      </Card.Root>
      {unstakeTxHash && (
        <GasCostSummaryCard chain={pool.chain} transactionSteps={transactionSteps.steps} />
      )}
    </VStack>
  )
}
