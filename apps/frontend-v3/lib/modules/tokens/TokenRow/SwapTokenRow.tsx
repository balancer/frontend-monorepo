import { VStack, HStack, Text } from '@chakra-ui/react'
import { Address } from 'viem'
import TokenRow from './TokenRow'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { HumanAmount } from '@balancer/sdk'
import { useSwap } from '../../swap/SwapProvider'
import { slippageDiffLabel } from '@/lib/shared/utils/slippage'

export function ReceiptTokenOutRow({
  chain,
  actualReceivedTokenAmount,
  tokenAddress,
}: {
  chain: GqlChain
  actualReceivedTokenAmount: HumanAmount
  tokenAddress: string
}) {
  const { simulationQuery } = useSwap()
  const expectedTokenOut = simulationQuery?.data?.returnAmount as HumanAmount
  return (
    <SwapTokenRow
      label="You got"
      rightLabel={slippageDiffLabel(actualReceivedTokenAmount, expectedTokenOut)}
      chain={chain}
      tokenAmount={actualReceivedTokenAmount}
      tokenAddress={tokenAddress}
    />
  )
}

export function SwapTokenRow({
  label,
  rightLabel,
  chain,
  tokenAmount,
  tokenAddress,
}: {
  label: string
  chain: GqlChain
  tokenAmount: string
  tokenAddress: string
  rightLabel?: string
}) {
  return (
    <VStack align="start" spacing="md">
      <HStack justify="space-between" w="full">
        <Text color="font.primary" variant={'primaryGradient'}>
          {label}
        </Text>
        {rightLabel && <Text color="font.primary">{rightLabel}</Text>}
      </HStack>

      <TokenRow
        value={tokenAmount}
        address={tokenAddress as Address}
        chain={chain}
        abbreviated={false}
      />
    </VStack>
  )
}
