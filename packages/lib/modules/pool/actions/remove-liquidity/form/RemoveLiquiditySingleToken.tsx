'use client'

import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Box, HStack, Radio, RadioGroup, Text, VStack } from '@chakra-ui/react'
import { Address } from 'viem'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { isNativeAsset } from '@repo/lib/modules/tokens/token.helpers'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'

interface RemoveLiquiditySingleTokenProps {
  tokens: (ApiToken | undefined)[]
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
      <HStack justify="space-between" w="full">
        <Text fontSize="1rem" fontWeight="bold">
          Choose a token to receive
        </Text>
      </HStack>
      <Box
        bg="background.level1"
        border="white"
        borderRadius="md"
        p="md"
        shadow="innerBase"
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
                      address={token.address as Address}
                      chain={chain}
                      disabled={token.address !== singleTokenOutAddress}
                      isLoading={isLoading}
                      showZeroAmountAsDash
                      value={amountOutForToken(token.address as Address)}
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
