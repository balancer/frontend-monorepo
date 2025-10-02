import { VStack, HStack, Text } from '@chakra-ui/react'
import { Address } from 'viem'
import TokenRow from './TokenRow'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { HumanAmount } from '@balancer/sdk'
import { useSwap } from '../../swap/SwapProvider'
import { slippageDiffLabel } from '@repo/lib/shared/utils/slippage'
import { CustomToken } from '../token.types'
import { ReactNode } from 'react'

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
  const rightElement = (
    <Text color="font.primary">
      {slippageDiffLabel(actualReceivedTokenAmount, expectedTokenOut)}
    </Text>
  )

  return (
    <SwapTokenRow
      chain={chain}
      label="You got"
      rightElement={rightElement}
      tokenAddress={tokenAddress}
      tokenAmount={actualReceivedTokenAmount}
    />
  )
}

export function SwapTokenRow({
  label,
  rightElement,
  chain,
  tokenAmount,
  tokenAddress,
  customToken,
}: {
  label: string
  chain: GqlChain
  tokenAmount: string
  tokenAddress: string
  rightElement?: ReactNode
  customToken?: CustomToken
}) {
  return (
    <VStack align="start" spacing="md">
      <HStack justify="space-between" w="full">
        <Text color="font.primary" variant="primaryGradient">
          {label}
        </Text>
        {rightElement}
      </HStack>

      <TokenRow
        abbreviated={false}
        address={tokenAddress as Address}
        chain={chain}
        customToken={customToken}
        value={tokenAmount}
      />
    </VStack>
  )
}
