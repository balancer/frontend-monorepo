import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '../../transactions/transaction-steps/step-tracker/MobileStepTracker'
import { Card, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { Pool } from '../pool.types'
import { TokenRowGroup } from '../../tokens/TokenRow/TokenRowGroup'
import { useMigrateLiquidity } from './MigrateLiquidityProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { ApiToken, HumanTokenAmount } from '../../tokens/token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useTotalUsdValue } from '../../tokens/useTotalUsdValue'
import { PoolActionsPriceImpactDetails } from '../actions/PoolActionsPriceImpactDetails'
import { useAddLiquidity } from '../actions/add-liquidity/AddLiquidityProvider'

export function MigrateLiquiditySummary() {
  const { isMobile } = useBreakpoints()

  const { oldPool, newPool, migrationSteps, amounts, hasQuoteContext } = useMigrateLiquidity()

  const { usdValueFor } = useTotalUsdValue((oldPool?.poolTokens || []) as ApiToken[])
  const totalUSDValue = usdValueFor(amounts)

  return (
    <AnimateHeightChange spacing="sm">
      {isMobile && hasQuoteContext && (
        <MobileStepTracker
          chain={oldPool?.chain || GqlChain.Mainnet}
          transactionSteps={migrationSteps}
        />
      )}

      <AmountInfo
        amounts={amounts}
        pool={oldPool}
        title="You're migrating"
        totalAmount={totalUSDValue}
      />
      <PoolCard pool={oldPool} title="From Balancer v2" />
      <PoolCard pool={newPool} title="To Balancer v3" />
      <PriceImpactCard />
    </AnimateHeightChange>
  )
}

type AmountInfoProps = {
  title: string
  pool: Pool | undefined
  amounts: HumanTokenAmount[]
  totalAmount: string
}

function AmountInfo({ title, pool, amounts, totalAmount }: AmountInfoProps) {
  const { toCurrency } = useCurrency()
  const totalAmountFormatted = toCurrency(totalAmount)

  return (
    <Card variant="modalSubSection">
      {pool ? (
        <TokenRowGroup
          amounts={amounts}
          chain={pool.chain}
          label={title}
          pool={pool}
          rightElement={<Text>{totalAmountFormatted}</Text>}
        />
      ) : (
        <Skeleton h="40px" w="full" />
      )}
    </Card>
  )
}

type PoolCardProps = {
  title: string
  pool: Pool | undefined
}

function PoolCard({ title, pool }: PoolCardProps) {
  return (
    <Card variant="modalSubSection">
      <VStack align="start" spacing="sm">
        <HStack height="28px" justify="space-between" w="full">
          <Text fontSize="sm" fontWeight="bold">
            {title}
          </Text>
          <Text color="font.secondary" fontSize="xs">
            APR
          </Text>
        </HStack>

        <HStack justify="space-between" w="full">
          <VStack align="start">
            <Text fontSize="md" fontWeight="bold" lineHeight="24px">
              {pool?.symbol}
            </Text>
            <Text color="font.secondary" fontSize="sm" fontWeight="medium" lineHeight="18px">
              {pool?.name}
            </Text>
          </VStack>
          {pool && pool.dynamicData && (
            <MainAprTooltip
              aprItems={pool.dynamicData.aprItems}
              chain={pool.chain}
              height="28px"
              pool={pool}
              poolId={pool.id}
              textProps={{
                fontSize: ['md', 'md', 'lg'],
                lineHeight: '28px',
              }}
            />
          )}
        </HStack>
      </VStack>
    </Card>
  )
}

function PriceImpactCard() {
  const { totalUSDValue, simulationQuery, slippage } = useAddLiquidity()
  const { migrationSteps } = useMigrateLiquidity()

  const removeLiquidityStep = migrationSteps.steps.find(step => step.stepType === 'removeLiquidity')
  const isComplete = removeLiquidityStep && removeLiquidityStep.isComplete()

  if (!isComplete) return null

  return (
    <Card variant="modalSubSection">
      <VStack align="start" spacing="sm">
        <Text fontSize="sm" fontWeight="bold">
          Add liquidity
        </Text>
        <PoolActionsPriceImpactDetails
          bptAmount={simulationQuery.data?.bptOut.amount}
          slippage={slippage}
          totalUSDValue={totalUSDValue}
        />
      </VStack>
    </Card>
  )
}
