import {
  VStack,
  Heading,
  Text,
  useDisclosure,
  HStack,
  Button,
  Divider,
  Icon,
} from '@chakra-ui/react'
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
import { TokenWeightInput } from './TokenWeightInput'
import { ConfigureTokenRateProvider } from './ConfigureTokenRateProvider'
import { AlertTriangle } from 'react-feather'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'

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
    poolConfigForm: {
      formState: { errors },
    },
  } = usePoolCreationForm()

  const { isWeightedPool, isCustomWeightedPool, isAtMaxTokenCount, maxTokenCount } =
    useValidatePoolConfig()

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
              title={`Add up to ${maxTokenCount} tokens in ${poolType} pools`}
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

                  <TokenWeightInput
                    index={index}
                    isDisabled={weightedPoolStructure !== WeightedPoolStructure.Custom}
                    isInvalid={isInvalidWeight}
                  />

                  <RemoveTokenButton
                    isDisabled={poolTokens.length <= 2}
                    onClick={() => removePoolToken(index)}
                  />
                </HStack>

                <InvalidWeightInputAlert message={errors?.poolTokens?.[index]?.weight?.message} />

                <ConfigureTokenRateProvider
                  tokenIndex={index}
                  verifiedRateProviderAddress={verifiedRateProviderAddress}
                />
              </VStack>
            )
          })}
          {(!isWeightedPool || isCustomWeightedPool) && (
            <AddTokenButton isDisabled={isAtMaxTokenCount} onClick={() => addPoolToken()} />
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

function TotalWeightDisplay() {
  const { totalWeight, isTotalWeightTooLow, isTotalWeightTooHigh } = useValidatePoolConfig()

  const isInvalidTotalWeight = isTotalWeightTooLow || isTotalWeightTooHigh

  let totalWeightColor = 'font.maxContrast'
  if (isTotalWeightTooLow) totalWeightColor = 'font.warning'
  if (isTotalWeightTooHigh) totalWeightColor = 'font.error'

  return (
    <>
      <Divider />
      <HStack justify="space-between" w="full">
        <Text color={totalWeightColor} fontWeight="bold">
          Total
        </Text>
        <HStack>
          {isInvalidTotalWeight && (
            <Icon as={AlertTriangle} boxSize="18px" color={totalWeightColor} />
          )}
          <Text color={totalWeightColor} fontWeight="bold">
            {totalWeight}
          </Text>
          <Text color="font.secondary">%</Text>
        </HStack>
      </HStack>
    </>
  )
}

function InvalidWeightInputAlert({ message }: { message: string | undefined }) {
  const { isWeightedPool } = useValidatePoolConfig()

  if (!isWeightedPool || !message) return null

  return (
    <HStack spacing="sm" w="full">
      <Icon as={AlertTriangle} boxSize="18px" color="font.error" />
      <Text color="font.error" fontSize="sm" fontWeight="semibold" textAlign="start" w="full">
        {message}
      </Text>
    </HStack>
  )
}
