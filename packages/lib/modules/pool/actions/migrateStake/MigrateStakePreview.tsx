import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { Card, VStack } from '@chakra-ui/react'
import { Address } from 'viem'
import { usePool } from '../../PoolProvider'
import { useMigrateStake as useMigrateStake } from './MigrateStakeProvider'
import StakeAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/StakeAprTooltip'
import { useUnstake } from '../unstake/UnstakeProvider'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'

export function MigrateStakePreview() {
  const { pool } = usePool()
  const { restakeTxHash, migratedAmount, isClaimable } = useMigrateStake()
  const { rewardAmounts, totalClaimableUsd } = useUnstake()

  return (
    <VStack spacing="sm" w="full">
      <Card variant="subSection">
        <TokenRow
          address={pool.address as Address}
          chain={pool.chain}
          isBpt
          label={restakeTxHash ? 'Staked LP tokens migrated' : 'Staked LP tokens to migrate'}
          pool={pool}
          value={migratedAmount}
        />
      </Card>

      {isClaimable && (
        <Card variant="subSection">
          <TokenRowGroup
            amounts={rewardAmounts}
            chain={pool.chain}
            label={restakeTxHash ? 'Claimed rewards' : 'Claimable rewards'}
            totalUSDValue={totalClaimableUsd}
          />
        </Card>
      )}

      <StakeAprTooltip pool={pool} totalUsdValue={migratedAmount} />
    </VStack>
  )
}
