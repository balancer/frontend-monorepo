import { Card, HStack, Text } from '@chakra-ui/react'
import { TransactionStep } from './lib'
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { GasIcon } from '@repo/lib/shared/components/icons/GasIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

interface GasCostSummaryCardProps {
  chain: GqlChain
  transactionSteps: TransactionStep[]
}

export function GasCostSummaryCard({ chain, transactionSteps }: GasCostSummaryCardProps) {
  const { usdValueForTokenAddress } = useTokens()
  const { toCurrency } = useCurrency()

  const networkConfig = chain ? getNetworkConfig(chain) : undefined

  const totalGasCost = useMemo(() => {
    let totalGasCost = 0n

    transactionSteps.forEach(step => {
      if (
        step.transaction &&
        step.isComplete() &&
        step.transaction.result?.data?.gasUsed &&
        step.transaction.result?.data?.effectiveGasPrice
      ) {
        const gasUsed = step.transaction.result.data.gasUsed
        const effectiveGasPrice = step.transaction.result.data.effectiveGasPrice
        const l1Fee = (step.transaction.result.data as any).l1Fee || 0n

        totalGasCost += gasUsed * effectiveGasPrice + l1Fee
      }
    })

    const formattedCost = formatUnits(totalGasCost, 18)

    const totalCostUsd = usdValueForTokenAddress(
      networkConfig?.tokens?.nativeAsset?.address as Address,
      chain,
      formattedCost
    )

    return totalCostUsd
  }, [transactionSteps, usdValueForTokenAddress, networkConfig])

  return (
    <Card px="md" variant="modalSubSection">
      <HStack color="font.secondary" w="full">
        <GasIcon size={18} />
        <Text color="font.secondary" fontSize="sm">
          Total final gas cost
        </Text>
        <Text color="font.secondary" fontSize="sm" ml="auto">
          {toCurrency(totalGasCost)}
        </Text>
      </HStack>
    </Card>
  )
}
