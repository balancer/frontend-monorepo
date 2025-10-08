import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ApiToken } from '../token.types'
import { HumanTokenAmount } from '../token.types'
import { useTotalUsdValue } from '../useTotalUsdValue'
import TokenRow from './TokenRow'
import { ReactNode, useMemo } from 'react'
import { HumanAmount } from '@balancer/sdk'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import { bn, formatFalsyValueAsDash } from '@repo/lib/shared/utils/numbers'

type HumanTokenAmountWithSymbol = HumanTokenAmount & { symbol?: string }

export function TokenRowGroup({
  label,
  rightElement,
  amounts,
  chain,
  tokens = [],
  totalUSDValue,
  isLoading = false,
  pool,
}: {
  label: string
  rightElement?: ReactNode
  amounts: HumanTokenAmountWithSymbol[]
  chain: GqlChain
  totalUSDValue?: string
  tokens?: ApiToken[]
  isLoading?: boolean
  pool?: Pool
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

      const symbol = pool?.poolTokens.find(token => token.address === amount.tokenAddress)?.symbol

      const key = amount.tokenAddress

      if (amountMap[key]) {
        amountMap[key] = {
          ...amountMap[key],
          humanAmount: bn(amountMap[key].humanAmount)
            .plus(bn(amount.humanAmount))
            .toString() as HumanAmount,
          symbol: symbol || amount.symbol,
        }
      } else {
        amountMap[key] = { ...amount }
      }
    })

    return Object.values(amountMap)
  }, [amounts, pool?.poolTokens])

  const hasMultipleAmounts = aggregatedAmounts.length > 1

  return (
    <VStack align="start" spacing="md">
      <HStack justify="space-between" w="full">
        <Text fontSize="sm" fontWeight="bold" pb="xxs">
          {label}
        </Text>
        {isLoading ? (
          <Skeleton h="5" w="12" />
        ) : (
          hasMultipleAmounts && (
            <Text fontSize="sm" fontWeight="bold">
              {formatFalsyValueAsDash(usdValue, toCurrency, { abbreviated: false })}
            </Text>
          )
        )}
        {rightElement}
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
            pool={pool}
            showZeroAmountAsDash
            symbol={amount?.symbol}
            value={amount.humanAmount}
          />
        )
      })}
    </VStack>
  )
}
