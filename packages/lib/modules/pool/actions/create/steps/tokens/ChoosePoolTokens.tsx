import { VStack, Heading, Text, useDisclosure, HStack, Box } from '@chakra-ui/react'
import { TokenInputSelector } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { Address } from 'viem'
import { PoolType } from '@balancer/sdk'
import { useState } from 'react'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { WeightedPoolStructure } from '../../constants'

export function ChoosePoolTokens() {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null)
  const tokenSelectDisclosure = useDisclosure()

  const {
    poolConfigForm: { watch, setValue },
  } = usePoolCreationForm()
  const { network, poolTokens, weightedPoolStructure, poolType } = watch()

  const { getTokensByChain } = useTokens()
  const tokens = getTokensByChain(network)

  function handleTokenSelect(tokenData: ApiToken) {
    if (!tokenData || selectedTokenIndex === null) return

    const existingPoolToken = poolTokens[selectedTokenIndex]
    const newPoolTokens = [...poolTokens]
    newPoolTokens[selectedTokenIndex] = {
      ...existingPoolToken,
      config: {
        ...existingPoolToken.config,
        address: tokenData.address as Address,
      },
      data: tokenData,
    }
    setValue('poolTokens', newPoolTokens)
    setSelectedTokenIndex(null)
  }

  function handleWeightChange(index: number, value: string) {
    const newPoolTokens = [...poolTokens]
    newPoolTokens[index].config.weight = value
    setValue('poolTokens', newPoolTokens)
  }

  const currentToken = selectedTokenIndex ? poolTokens[selectedTokenIndex] : undefined

  return (
    <VStack align="start" spacing="md" w="full">
      <Heading color="font.maxContrast" size="md">
        Choose pool tokens
      </Heading>
      {poolTokens.map((token, index) => (
        <HStack w="full">
          <VStack align="start" key={index} spacing="md" w="full">
            <Text>Token {index + 1}</Text>
            <HStack w="full">
              <TokenInputSelector
                onToggleTokenClicked={() => {
                  setSelectedTokenIndex(index)
                  tokenSelectDisclosure.onOpen()
                }}
                showWeight={false}
                token={token?.data}
                weight={token?.config?.weight}
              />
            </HStack>
          </VStack>
          {poolType === PoolType.Weighted && (
            <VStack align="start" spacing="md">
              <Text>Weight</Text>
              <Box position="relative" w="20">
                <InputWithError
                  isDisabled={weightedPoolStructure !== WeightedPoolStructure.Custom}
                  name="weight"
                  onChange={e => {
                    handleWeightChange(index, e.target.value)
                  }}
                  placeholder="0"
                  value={token?.config?.weight}
                />
                <Text
                  color="font.secondary"
                  opacity={weightedPoolStructure !== WeightedPoolStructure.Custom ? 0.3 : 1}
                  position="absolute"
                  right="3"
                  top="2.5"
                  zIndex={1}
                >
                  %
                </Text>
              </Box>
            </VStack>
          )}
        </HStack>
      ))}
      <TokenSelectModal
        chain={network}
        currentToken={currentToken?.config?.address}
        isOpen={tokenSelectDisclosure.isOpen}
        onClose={tokenSelectDisclosure.onClose}
        onOpen={tokenSelectDisclosure.onOpen}
        onTokenSelect={handleTokenSelect}
        tokens={tokens}
      />
    </VStack>
  )
}
