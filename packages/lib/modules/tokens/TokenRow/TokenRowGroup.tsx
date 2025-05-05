import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ApiToken } from '../token.types'
import { HumanTokenAmount } from '../token.types'
import { useTotalUsdValue } from '../useTotalUsdValue'
import TokenRow from './TokenRow'
import { useMemo } from 'react'
import { bn } from '@repo/lib/shared/utils/numbers'
import { HumanAmount } from '@balancer/sdk'

type HumanTokenAmountWithSymbol = HumanTokenAmount & { symbol?: string }

export function TokenRowGroup({
  label,
  amounts,
  chain,
  tokens = [],
  totalUSDValue,
  isLoading = false,
}: {
  label: string
  amounts: HumanTokenAmountWithSymbol[]
  chain: GqlChain
  totalUSDValue?: string
  tokens?: ApiToken[]
  isLoading?: boolean
}) {
  const { toCurrency } = useCurrency()
  const { usdValueFor } = useTotalUsdValue(tokens)

  const _totalUSDValue = usdValueFor(amounts)
  const usdValue = totalUSDValue || _totalUSDValue

  // Aggregate amounts by tokenAddress
  const aggregatedAmounts = useMemo(() => {
    const amountMap: Record<string, HumanTokenAmountWithSymbol> = {}

    amounts.forEach(amount => {
      if (!amount.tokenAddress) return

      const key = amount.tokenAddress

      if (amountMap[key]) {
        amountMap[key] = {
          ...amountMap[key],
          humanAmount: bn(amountMap[key].humanAmount)
            .plus(bn(amount.humanAmount))
            .toString() as HumanAmount,
        }
      } else {
        amountMap[key] = { ...amount }
      }
    })

    return Object.values(amountMap)
  }, [amounts])

  const hasMultipleAmounts = aggregatedAmounts.length > 1

  return (
    <VStack align="start" spacing="md">
      <HStack justify="space-between" w="full">
        <Text color="grayText">{label}</Text>
        {isLoading ? (
          <Skeleton h="5" w="12" />
        ) : (
          hasMultipleAmounts && <Text>{toCurrency(usdValue, { abbreviated: false })}</Text>
        )}
      </HStack>
      {aggregatedAmounts.map(amount => {
        if (!amount.tokenAddress) return <div key={JSON.stringify(amount)}>Missing token</div>

        return (
          <TokenRow
            abbreviated={false}
            address={amount.tokenAddress}
            chain={chain}
            isLoading={isLoading}
            key={amount.tokenAddress}
            symbol={amount?.symbol}
            value={amount.humanAmount}
          />
        )
      })}
    </VStack>
  )
}
