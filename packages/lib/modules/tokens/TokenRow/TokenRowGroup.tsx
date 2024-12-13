import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ApiToken } from '../../pool/pool.types'
import { HumanTokenAmount } from '../token.types'
import { useTotalUsdValue } from '../useTotalUsdValue'
import TokenRow from './TokenRow'

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

  const hasMultipleAmounts = amounts.length > 1

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
      {amounts.map(amount => {
        if (!amount.tokenAddress) return <div key={JSON.stringify(amount)}>Missing token</div>

        return (
          <TokenRow
            abbreviated={false}
            address={amount.tokenAddress}
            chain={chain}
            isLoading={isLoading}
            key={`${amount.tokenAddress}-${amount.humanAmount}`}
            symbol={amount?.symbol}
            value={amount.humanAmount}
          />
        )
      })}
    </VStack>
  )
}
