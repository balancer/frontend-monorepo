'use client'

import TokenRow from '@/lib/modules/tokens/TokenRow/TokenRow'
import { GqlChain, GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { Box, HStack, Radio, RadioGroup, Text, VStack } from '@chakra-ui/react'
import { Address } from 'viem'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { isNativeAsset } from '@/lib/modules/tokens/token.helpers'

interface RemoveLiquiditySingleTokenProps {
  tokens: (GqlToken | undefined)[]
  chain: GqlChain
}

export function RemoveLiquiditySingleToken({ tokens, chain }: RemoveLiquiditySingleTokenProps) {
  const {
    singleTokenOutAddress,
    setSingleTokenAddress,
    amountOutForToken,
    setWethIsEth,
    simulationQuery,
    priceImpactQuery,
  } = useRemoveLiquidity()

  const isLoading = simulationQuery.isLoading || priceImpactQuery.isLoading

  function onChange(tokenAddress: Address) {
    if (isNativeAsset(tokenAddress, chain)) {
      setWethIsEth(true)
    } else {
      setWethIsEth(false)
    }
    setSingleTokenAddress(tokenAddress)
  }

  return (
    <VStack w="full">
      <HStack w="full" justify="space-between">
        <Text fontWeight="bold" fontSize="1rem">
          Choose a token to receive
        </Text>
      </HStack>
      <Box
        borderRadius="md"
        p="md"
        shadow="innerBase"
        bg="background.level1"
        border="white"
        w="full"
      >
        <RadioGroup onChange={onChange} value={singleTokenOutAddress ?? tokens[0]?.address}>
          <VStack w="full">
            {tokens.map(
              token =>
                token && (
                  <HStack key={token.address} w="full">
                    <Radio value={token.address} />
                    <TokenRow
                      chain={token.chain}
                      address={token.address as Address}
                      value={amountOutForToken(token.address as Address)}
                      disabled={token.address !== singleTokenOutAddress}
                      showZeroAmountAsDash
                      isLoading={isLoading}
                    />
                  </HStack>
                )
            )}
          </VStack>
        </RadioGroup>
      </Box>
    </VStack>
  )
}
