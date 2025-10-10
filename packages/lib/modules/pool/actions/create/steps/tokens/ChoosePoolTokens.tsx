import { VStack, Heading, Text, useDisclosure, HStack, Button, Icon, Box } from '@chakra-ui/react'
import { TokenInputSelector } from '@repo/lib/modules/tokens/TokenInput/TokenInput'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ApiToken, ApiOrCustomToken } from '@repo/lib/modules/tokens/token.types'
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
import {
  isConstantRateProvider,
  isDynamicRateProvider,
} from '@repo/lib/modules/tokens/token.helpers'

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
    reClammConfigForm,
    isReClamm,
  } = usePoolCreationForm()

  const isCustomWeightedPool = validatePoolType.isCustomWeightedPool(
    poolType,
    weightedPoolStructure
  )
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)

  const maxTokens = validatePoolTokens.maxTokens(poolType)
  const isPoolAtMaxTokens = validatePoolTokens.isAtMaxTokens(poolType, poolTokens)

  const { getTokensByChain, priceFor } = useTokens()
  const allTokens = getTokensByChain(network)

  // Filter out already selected tokens
  const selectedTokenAddresses = poolTokens.map(token => token.address?.toLowerCase())
  const tokens = allTokens.filter(
    token => !selectedTokenAddresses.includes(token.address.toLowerCase())
  )

  function getVerifiedRateProviderAddress(token: ApiToken) {
    if (!token.priceRateProviderData) return undefined

    const isRateProviderConstant = isConstantRateProvider(token)
    const isRateProviderDynamic = isDynamicRateProvider(token)

    return !(isRateProviderConstant || isRateProviderDynamic)
      ? (token.priceRateProviderData?.address as Address)
      : undefined
  }

  function handleTokenSelect(tokenMetadata: ApiOrCustomToken) {
    if (!tokenMetadata || selectedTokenIndex === null) return

    let rateProvider: Address = zeroAddress

    if ('priceRateProviderData' in tokenMetadata) {
      rateProvider = getVerifiedRateProviderAddress(tokenMetadata) ?? zeroAddress
    }

    updatePoolToken(selectedTokenIndex, {
      address: tokenMetadata.address as Address,
      rateProvider,
      data: tokenMetadata,
      paysYieldFees: rateProvider !== zeroAddress,
    })

    setSelectedTokenIndex(null)
    poolCreationForm.setValue('hasAcceptedSimilarPoolsWarning', false)
    if (isReClamm) reClammConfigForm.resetToInitial()
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

            const tokenData = allTokens.find(
              t => t.address.toLowerCase() === token.address?.toLowerCase()
            ) as ApiToken

            const verifiedRateProviderAddress = tokenData
              ? getVerifiedRateProviderAddress(tokenData)
              : undefined

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
                      token={token?.data}
                    />
                  </VStack>

                  {isWeightedPool && (
                    <Box>
                      <NumberInput
                        control={poolCreationForm.control}
                        isDisabled={weightedPoolStructure !== WeightedPoolStructure.Custom}
                        isInvalid={isInvalidWeight}
                        isPercentage
                        label="Weight"
                        name={`poolTokens.${index}.weight`}
                        validate={weight => {
                          // getValues() grabs poolType from LS but watch() is tricked by initial default values
                          const poolType = poolCreationForm.getValues('poolType')
                          const isWeightedPool = validatePoolType.isWeightedPool(poolType)
                          if (!isWeightedPool) return true
                          if (weight < 1) return 'Minimum weight for each token is 1%'
                          if (weight > 99) return 'Maximum weight for a token is 99%'
                          return true
                        }}
                      />
                    </Box>
                  )}

                  {poolTokens.length > 2 && (
                    <RemoveTokenButton
                      isDisabled={poolTokens.length <= 2}
                      onClick={() => removePoolToken(index)}
                    />
                  )}
                </HStack>

                {isWeightedPool && <InvalidWeightInputAlert message={tokenWeightErrorMsg} />}

                {token.address && !priceFor(token.address || '', network) && (
                  <VStack align="start" spacing="sm" w="full">
                    <NumberInput
                      control={poolCreationForm.control}
                      label="Estimated current  price of token"
                      name={`poolTokens.${index}.usdPrice`}
                      validate={price => {
                        if (price < 0) return 'Token price must be greater than 0'
                        return true
                      }}
                      width="full"
                    />
                    <Text color="font.secondary">
                      Enter the token’s price accurately, or you’ll be vulnerable to losing money to
                      arbitrageurs, if you don’t add pool assets in proportion to their target
                      weights.
                    </Text>
                  </VStack>
                )}

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
        enableUnknownToken
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
