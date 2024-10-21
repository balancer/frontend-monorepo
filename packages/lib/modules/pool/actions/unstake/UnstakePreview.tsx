import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { VStack, Card } from '@chakra-ui/react'
import { Address } from 'viem'
import { usePool } from '../../PoolProvider'
import { useUnstake } from './UnstakeProvider'

export function UnstakePreview() {
  const { pool } = usePool()
  const { unstakeTxHash, quoteAmountOut, rewardAmounts, totalClaimableUsd } = useUnstake()

  return (
    <VStack spacing="sm" w="full">
      <Card variant="subSection">
        <TokenRow
          address={pool.address as Address}
          chain={pool.chain}
          isBpt
          label={unstakeTxHash ? 'Unstaked LP tokens' : 'Staked LP tokens'}
          pool={pool}
          value={quoteAmountOut}
        />
      </Card>
      <Card variant="subSection">
        <TokenRowGroup
          amounts={rewardAmounts}
          chain={pool.chain}
          label={unstakeTxHash ? 'Claimed rewards' : 'Claimable rewards'}
          totalUSDValue={totalClaimableUsd}
        />
      </Card>
    </VStack>
  )
}
