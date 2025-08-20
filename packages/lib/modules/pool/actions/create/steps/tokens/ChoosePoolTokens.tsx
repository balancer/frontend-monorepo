import { VStack, Heading, Text, useDisclosure, HStack, Button } from '@chakra-ui/react'
import { TokenInputSelector } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { Address, zeroAddress } from 'viem'
import { PoolType } from '@balancer/sdk'
import { useState } from 'react'
import { WeightedPoolStructure } from '../../constants'
import { PlusCircle, Trash2 } from 'react-feather'
import { POOL_TYPES } from '../../constants'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import {
  TotalWeightDisplay,
  TokenWeightInput,
  InvalidWeightInputAlert,
} from './ConfigureTokenWeight'
import { ConfigureTokenRateProvider } from './ConfigureTokenRateProvider'

export function ChoosePoolTokens() {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null)
  const tokenSelectDisclosure = useDisclosure()
  const {
    network,
    poolTokens,
    weightedPoolStructure,
    poolType,
    updatePoolToken,
    removePoolToken,
    addPoolToken,
  } = usePoolCreationForm()

  const { getTokensByChain } = useTokens()
  const tokens = getTokensByChain(network)

  function handleTokenSelect(tokenData: ApiToken) {
    if (!tokenData || selectedTokenIndex === null) return

    const existingPoolToken = poolTokens[selectedTokenIndex]
    const verifiedRateProviderAddress = tokenData?.priceRateProviderData?.address as Address

    updatePoolToken(selectedTokenIndex, {
      ...existingPoolToken,
      address: tokenData.address as Address,
      rateProvider: verifiedRateProviderAddress ? verifiedRateProviderAddress : zeroAddress,
      data: tokenData,
    })
    setSelectedTokenIndex(null)
  }

  const maxTokens = POOL_TYPES[poolType].maxTokens
  const isAtMaxTokens = poolTokens.length === maxTokens
  const isWeightedPool = poolType === PoolType.Weighted
  const isCustomWeightedPool = weightedPoolStructure === WeightedPoolStructure.Custom
  const currentTokenAddress = selectedTokenIndex
    ? poolTokens[selectedTokenIndex].address
    : undefined

  return (
    <>
      <VStack align="start" spacing="md" w="full">
        <VStack align="start" spacing="sm">
          <Heading color="font.maxContrast" size="md">
            Choose pool tokens
          </Heading>
          {isCustomWeightedPool && (
            <BalAlert
              content="Note: Most pool actions like creation and add/remove liquidity become more expensive with each additional token."
              status="info"
              title={`Add up to ${maxTokens} tokens in ${poolType} pools`}
            />
          )}
        </VStack>
        <VStack align="start" spacing="xl" w="full">
          {poolTokens.map((token, index) => {
            const isInvalidWeight = !!token.weight && Number(token.weight) < 1
            const verifiedRateProviderAddress = token?.data?.priceRateProviderData?.address

            return (
              <VStack align="start" key={index} spacing="md" w="full">
                <HStack align="end" w="full">
                  <VStack align="start" spacing="sm" w="full">
                    <Text>Token {index + 1}</Text>
                    <TokenInputSelector
                      onToggleTokenClicked={() => {
                        setSelectedTokenIndex(index)
                        tokenSelectDisclosure.onOpen()
                      }}
                      showWeight={false}
                      token={token?.data}
                    />
                  </VStack>

                  {isWeightedPool && (
                    <TokenWeightInput
                      index={index}
                      isDisabled={weightedPoolStructure !== WeightedPoolStructure.Custom}
                      isInvalid={isInvalidWeight}
                      tokenWeightValue={token?.weight}
                    />
                  )}

                  <RemoveTokenButton
                    isDisabled={poolTokens.length <= 2}
                    onClick={() => removePoolToken(index)}
                  />
                </HStack>
                {isInvalidWeight && <InvalidWeightInputAlert />}

                <ConfigureTokenRateProvider
                  tokenIndex={index}
                  verifiedRateProviderAddress={verifiedRateProviderAddress}
                />
              </VStack>
            )
          })}
          {(!isWeightedPool || isCustomWeightedPool) && (
            <AddTokenButton isDisabled={isAtMaxTokens} onClick={() => addPoolToken()} />
          )}

          {isCustomWeightedPool && <TotalWeightDisplay />}
        </VStack>
      </VStack>

      <TokenSelectModal
        chain={network}
        currentToken={currentTokenAddress}
        isOpen={tokenSelectDisclosure.isOpen}
        onClose={tokenSelectDisclosure.onClose}
        onOpen={tokenSelectDisclosure.onOpen}
        onTokenSelect={handleTokenSelect}
        tokens={tokens}
      />
    </>
  )
}

function AddTokenButton({ isDisabled, onClick }: { isDisabled: boolean; onClick: () => void }) {
  return (
    <Button isDisabled={isDisabled} onClick={onClick} variant="secondary">
      <HStack spacing="sm">
        <PlusCircle size={20} />
        <Text color="font.dark">Add token</Text>
      </HStack>
    </Button>
  )
}

function RemoveTokenButton({ onClick, isDisabled }: { onClick: () => void; isDisabled: boolean }) {
  return (
    <Button color="font.secondary" isDisabled={isDisabled} onClick={onClick} variant="unstyled">
      <Trash2 size={16} />
    </Button>
  )
}
