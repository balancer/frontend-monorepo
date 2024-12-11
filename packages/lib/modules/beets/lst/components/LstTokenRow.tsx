import { VStack, HStack, Text } from '@chakra-ui/react'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'

export function LstTokenRow({
  label,
  chain,
  tokenAmount,
  tokenAddress,
  isLoading,
}: {
  label: string
  chain: GqlChain
  tokenAmount: string
  tokenAddress: string
  isLoading: boolean
}) {
  return (
    <VStack align="start" spacing="md">
      <HStack justify="space-between" w="full">
        <Text color="font.primary" variant="primaryGradient">
          {label}
        </Text>
      </HStack>
      <TokenRow
        abbreviated={false}
        address={tokenAddress as Address}
        chain={chain}
        isLoading={isLoading}
        value={tokenAmount}
      />
    </VStack>
  )
}
