import { VStack, Heading, Text, useDisclosure } from '@chakra-ui/react'
import { TokenInputSelector } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { Address } from 'viem'
import { TokenType } from '@balancer/sdk'
import { zeroAddress } from 'viem'
import { useState } from 'react'

export function ChoosePoolTokens() {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null)
  const tokenSelectDisclosure = useDisclosure()

  const {
    poolConfigForm: { watch, setValue },
  } = usePoolCreationForm()
  const { network, poolTokens } = watch()

  const { getTokensByChain } = useTokens()
  const tokens = getTokensByChain(network)

  function handleTokenSelect(tokenData: ApiToken) {
    if (!tokenData || selectedTokenIndex === null) return

    const existingPoolToken = poolTokens[selectedTokenIndex]
    const newPoolTokens = [...poolTokens]
    newPoolTokens[selectedTokenIndex] = {
      ...existingPoolToken,
      config: {
        address: tokenData.address as Address,
        tokenType: TokenType.STANDARD,
        rateProvider: zeroAddress,
        paysYieldFees: false,
        weight: '',
      },
      data: tokenData,
    }
    setValue('poolTokens', newPoolTokens)
    setSelectedTokenIndex(null)
  }

  const currentToken = selectedTokenIndex ? poolTokens[selectedTokenIndex] : undefined

  return (
    <VStack align="start" spacing="md" w="full">
      <Heading color="font.maxContrast" size="md">
        Choose pool tokens
      </Heading>
      {poolTokens.map((token, index) => (
        <VStack align="start" key={index} spacing="md" w="full">
          <Text>Token {index + 1}</Text>
          <TokenInputSelector
            onToggleTokenClicked={() => {
              setSelectedTokenIndex(index)
              tokenSelectDisclosure.onOpen()
            }}
            token={token?.data}
            weight={undefined}
          />
        </VStack>
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
