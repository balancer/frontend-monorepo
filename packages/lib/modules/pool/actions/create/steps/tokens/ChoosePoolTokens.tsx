import { VStack, Heading, Text, useDisclosure, HStack, Box, Button } from '@chakra-ui/react'
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
import { PlusCircle, Trash2 } from 'react-feather'
import { DEFAULT_TOKEN, POOL_TYPES } from '../../constants'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

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

  const handleRemoveToken = (index: number) => {
    const newPoolTokens = [...poolTokens]
    newPoolTokens.splice(index, 1)
    setValue('poolTokens', newPoolTokens)
  }

  const handleAddToken = () => {
    const newPoolTokens = [...poolTokens]
    newPoolTokens.push(DEFAULT_TOKEN)
    setValue('poolTokens', newPoolTokens)
  }

  const currentToken = selectedTokenIndex ? poolTokens[selectedTokenIndex] : undefined

  const maxTokens = POOL_TYPES[poolType].maxTokens
  const isAtMaxTokens = poolTokens.length === maxTokens
  const isWeightedPool = poolType === PoolType.Weighted

  return (
    <VStack align="start" spacing="xl" w="full">
      <Heading color="font.maxContrast" size="md">
        Choose pool tokens
      </Heading>
      <BalAlert
        content="Note: Most pool actions like creation and add/remove liquidity become more expensive with each additional token."
        status="info"
        title={`Add up to ${maxTokens} tokens in ${poolType} pools`}
      />
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

          <VStack align="start" spacing="md">
            <Text visibility={isWeightedPool ? 'visible' : 'hidden'}>Weight</Text>
            <HStack>
              {isWeightedPool && (
                <TokenWeightInput
                  handleWeightChange={(value: string) => handleWeightChange(index, value)}
                  isDisabled={weightedPoolStructure !== WeightedPoolStructure.Custom}
                  tokenWeightValue={token?.config?.weight}
                />
              )}
              <RemoveTokenButton
                isDisabled={poolTokens.length <= 2}
                onClick={() => handleRemoveToken(index)}
              />
            </HStack>
          </VStack>
        </HStack>
      ))}

      {!isAtMaxTokens && <AddTokenButton onClick={handleAddToken} />}

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

function TokenWeightInput({
  tokenWeightValue,
  isDisabled,
  handleWeightChange,
}: {
  tokenWeightValue: string | undefined
  isDisabled: boolean
  handleWeightChange: (value: string) => void
}) {
  return (
    <Box position="relative" w="20">
      <InputWithError
        isDisabled={isDisabled}
        name="weight"
        onChange={e => {
          handleWeightChange(e.target.value)
        }}
        placeholder="0"
        value={tokenWeightValue}
      />
      <Text
        color="font.secondary"
        opacity={isDisabled ? 0.3 : 1}
        position="absolute"
        right="3"
        top="2.5"
        zIndex={1}
      >
        %
      </Text>
    </Box>
  )
}

function AddTokenButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="secondary">
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
