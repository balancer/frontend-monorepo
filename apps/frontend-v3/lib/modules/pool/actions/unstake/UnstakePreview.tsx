import TokenRow from '@/lib/modules/tokens/TokenRow/TokenRow'
import { TokenRowGroup } from '@/lib/modules/tokens/TokenRow/TokenRowGroup'
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
          label={unstakeTxHash ? 'Unstaked LP tokens' : 'Staked LP tokens'}
          address={pool.address as Address}
          value={quoteAmountOut}
          chain={pool.chain}
          pool={pool}
          isBpt
        />
      </Card>
      <Card variant="subSection">
        <TokenRowGroup
          label={unstakeTxHash ? 'Claimed rewards' : 'Claimable rewards'}
          amounts={rewardAmounts}
          totalUSDValue={totalClaimableUsd}
          chain={pool.chain}
        />
      </Card>
    </VStack>
  )
}
