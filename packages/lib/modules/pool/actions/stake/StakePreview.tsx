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
  const { stakeTxHash, quoteAmountIn, quoteAmountInUsd, stakedBalance, transactionSteps } =
    useStake()
  const { weeklyRewards } = useGetPoolRewards(pool)
  const isSuccess = !!stakeTxHash

  const amount = isSuccess
    ? { token: stakedBalance.balance, usd: `${stakedBalance.balanceUsd}` }
    : { token: quoteAmountIn, usd: quoteAmountInUsd }

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
              <Text color="grayText">{isSuccess ? 'Staked LP tokens' : 'Stakeable LP tokens'}</Text>
            </HStack>
          }
          pool={pool}
          value={amount.token}
        />
      </Card>

      <StakeAprTooltip pool={pool} totalUsdValue={amount.usd} weeklyRewards={weeklyRewards} />
      {isSuccess && (
        <GasCostSummaryCard chain={pool.chain} transactionSteps={transactionSteps.steps} />
      )}
    </VStack>
  )
}
