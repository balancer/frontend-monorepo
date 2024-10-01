import { Card, VStack } from '@chakra-ui/react'
import { Address } from 'viem'
import { usePool } from '../../PoolProvider'
import { useMigrateStake as useMigrateStake } from './MigrateStakeProvider'
import { useUnstake } from '../unstake/UnstakeProvider'
import StakeAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/StakeAprTooltip'
import TokenRow from '../../../tokens/TokenRow/TokenRow'
import { TokenRowGroup } from '../../../tokens/TokenRow/TokenRowGroup'

export function MigrateStakePreview() {
  const { pool } = usePool()
  const { restakeTxHash, migratedAmount, isClaimable } = useMigrateStake()
  const { rewardAmounts, totalClaimableUsd } = useUnstake()

  return (
    <VStack spacing="sm" w="full">
      <Card variant="subSection">
        <TokenRow
          label={restakeTxHash ? 'Staked LP tokens migrated' : 'Staked LP tokens to migrate'}
          address={pool.address as Address}
          value={migratedAmount}
          chain={pool.chain}
          pool={pool}
          isBpt
        />
      </Card>

      {isClaimable && (
        <Card variant="subSection">
          <TokenRowGroup
            label={restakeTxHash ? 'Claimed rewards' : 'Claimable rewards'}
            amounts={rewardAmounts}
            totalUSDValue={totalClaimableUsd}
            chain={pool.chain}
          />
        </Card>
      )}

      <StakeAprTooltip pool={pool} totalUsdValue={migratedAmount} />
    </VStack>
  )
}
