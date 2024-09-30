import { VStack, Card, HStack, Text } from '@chakra-ui/react'
import { Address } from 'viem'
import { usePool } from '../../PoolProvider'
import { useStake } from './StakeProvider'
import { WalletIcon } from '../../../../shared/components/icons/WalletIcon'
import StakeAprTooltip from '../../../../shared/components/tooltips/apr-tooltip/StakeAprTooltip'
import TokenRow from '../../../tokens/TokenRow/TokenRow'

export function StakePreview() {
  const { pool } = usePool()
  const { stakeTxHash, quoteAmountIn, quoteAmountInUsd } = useStake()

  return (
    <VStack spacing="sm" w="full">
      <Card variant="subSection">
        <TokenRow
          label={
            <HStack color="grayText">
              <WalletIcon />
              <Text color="grayText">
                {stakeTxHash ? 'Staked LP tokens' : 'Stakeable LP tokens'}
              </Text>
            </HStack>
          }
          address={pool.address as Address}
          value={quoteAmountIn}
          chain={pool.chain}
          pool={pool}
          isBpt
        />
      </Card>

      <StakeAprTooltip totalUsdValue={quoteAmountInUsd} pool={pool} />
    </VStack>
  )
}
