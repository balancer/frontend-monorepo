import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { VStack, HStack, Skeleton, Text } from '@chakra-ui/react'
import TokenRow from './TokenRow'
import { useTotalUsdValue } from '../useTotalUsdValue'
import { HumanTokenAmountWithAddress } from '../token.types'

export function TokenRowGroup({
  label,
  amounts,
  chain,
  tokens = [],
  totalUSDValue,
  isLoading = false,
}: {
  label: string
  amounts: HumanTokenAmountWithAddress[]
  chain: GqlChain
  totalUSDValue?: string
  tokens?: GqlToken[]
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
      {amounts.map((amount, index) => {
        if (!amount.tokenAddress) return <div key={JSON.stringify(amount)}>Missing token</div>

        return (
          <TokenRow
            key={`${index}-${amount.tokenAddress}-${amount.humanAmount}`}
            value={amount.humanAmount}
            address={amount.tokenAddress}
            chain={chain}
            abbreviated={false}
            isLoading={isLoading}
          />
        )
      })}
    </VStack>
  )
}
