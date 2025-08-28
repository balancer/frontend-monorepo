import { VStack, Heading, Text, useDisclosure, HStack, Button, Icon } from '@chakra-ui/react'
import { TokenInputSelector } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { Address, zeroAddress } from 'viem'
import { useState } from 'react'
import { WeightedPoolStructure } from '../../constants'
import { PlusCircle, Trash2 } from 'react-feather'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { ConfigureTokenRateProvider } from './ConfigureTokenRateProvider'
import { AlertTriangle } from 'react-feather'
import { TotalWeightDisplay } from './TotalWeightDisplay'
import { NumberInput } from '@repo/lib/shared/components/inputs/NumberInput'
import { validatePoolTokens, validatePoolType } from '../../validatePoolCreationForm'

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
    poolCreationForm,
  } = usePoolCreationForm()

  const isCustomWeightedPool = validatePoolType.isCustomWeightedPool(
    poolType,
    weightedPoolStructure
  )
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)

  const maxTokens = validatePoolTokens.maxTokens(poolType)
  const isPoolAtMaxTokens = validatePoolTokens.isAtMaxTokens(poolType, poolTokens)

  const { getTokensByChain } = useTokens()
  const tokens = getTokensByChain(network)

  function handleTokenSelect(tokenData: ApiToken) {
    if (!tokenData || selectedTokenIndex === null) return

    const verifiedRateProviderAddress = tokenData?.priceRateProviderData?.address as Address

    updatePoolToken(selectedTokenIndex, {
      address: tokenData.address as Address,
      rateProvider: verifiedRateProviderAddress ? verifiedRateProviderAddress : zeroAddress, // default to using rate provider if exists in our DB
      data: tokenData,
      paysYieldFees: !!verifiedRateProviderAddress, // defaults to true if rate provider exists in our DB
    })
    setSelectedTokenIndex(null)
  }

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
            const tokenWeightErrorMsg =
              poolCreationForm.formState.errors.poolTokens?.[index]?.weight?.message

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
                    <NumberInput
                      control={poolCreationForm.control}
                      isDisabled={weightedPoolStructure !== WeightedPoolStructure.Custom}
                      isInvalid={isInvalidWeight}
                      isPercentage
                      label="Weight"
                      name={`poolTokens.${index}.weight`}
                      validate={value => validatePoolTokens.singleTokenWeight(value, poolType)}
                    />
                  )}

                  {poolTokens.length > 2 && (
                    <RemoveTokenButton
                      isDisabled={poolTokens.length <= 2}
                      onClick={() => removePoolToken(index)}
                    />
                  )}
                </HStack>

                {isWeightedPool && <InvalidWeightInputAlert message={tokenWeightErrorMsg} />}

                <ConfigureTokenRateProvider
                  tokenIndex={index}
                  verifiedRateProviderAddress={verifiedRateProviderAddress}
                />
              </VStack>
            )
          })}
          {(!isWeightedPool || isCustomWeightedPool) && (
            <AddTokenButton isDisabled={isPoolAtMaxTokens} onClick={() => addPoolToken()} />
          )}

          {isWeightedPool && isCustomWeightedPool && <TotalWeightDisplay />}
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

function InvalidWeightInputAlert({ message }: { message: string | undefined }) {
  if (!message) return null

  return (
    <HStack spacing="sm" w="full">
      <Icon as={AlertTriangle} boxSize="18px" color="font.error" />
      <Text color="font.error" fontSize="sm" fontWeight="semibold" textAlign="start" w="full">
        {message}
      </Text>
    </HStack>
  )
}
