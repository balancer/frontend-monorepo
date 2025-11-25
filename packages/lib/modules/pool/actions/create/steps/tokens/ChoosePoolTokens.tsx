import { VStack, Heading, Text, useDisclosure, HStack, Button } from '@chakra-ui/react'
import { TokenSelectModal } from '@repo/lib/modules/tokens/TokenSelectModal/TokenSelectModal'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { ApiToken, ApiOrCustomToken } from '@repo/lib/modules/tokens/token.types'
import { Address, zeroAddress } from 'viem'
import { useState } from 'react'
import { PlusCircle } from 'react-feather'
import { TotalWeightDisplay } from './TotalWeightDisplay'
import { validatePoolTokens } from '../../validatePoolCreationForm'
import {
  isConstantRateProvider,
  isDynamicRateProvider,
} from '@repo/lib/modules/tokens/token.helpers'
import {
  isWeightedPool,
  isCustomWeightedPool,
  isReClammPool,
  isGyroEllipticPool,
} from '../../helpers'
import { ChoosePoolTokensAlert } from './ChoosePoolTokensAlert'
import { useWatch } from 'react-hook-form'
import { ConfigureToken } from './ConfigureToken'

export function ChoosePoolTokens() {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null)
  const tokenSelectDisclosure = useDisclosure()
  const { updatePoolToken, addPoolToken, poolCreationForm, reClammConfigForm, eclpConfigForm } =
    usePoolCreationForm()

  const [network, poolType, poolTokens, weightedPoolStructure] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'poolType', 'poolTokens', 'weightedPoolStructure'],
  })

  const isPoolAtMaxTokens = validatePoolTokens.isAtMaxTokens(poolType, poolTokens)

  const { getTokensByChain } = useTokens()
  const listedTokens = getTokensByChain(network)

  // Filter out already selected tokens
  const selectedTokenAddresses = poolTokens.map(token => token.address?.toLowerCase())
  const tokens = listedTokens.filter(
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
      usdPrice: '',
    })

    setSelectedTokenIndex(null)
    poolCreationForm.setValue('hasAcceptedSimilarPoolsWarning', false)
    poolCreationForm.setValue('name', '')
    poolCreationForm.setValue('symbol', '')
    if (isReClammPool(poolType)) reClammConfigForm.resetToInitial()
    if (isGyroEllipticPool(poolType)) eclpConfigForm.resetToInitial()
  }

  const currentTokenAddress = selectedTokenIndex
    ? poolTokens[selectedTokenIndex].address
    : undefined

  return (
    <>
      <VStack align="start" spacing="md" w="full">
        <ChoosePoolTokensAlert poolType={poolType} weightedPoolStructure={weightedPoolStructure} />

        <Heading color="font.maxContrast" size="md">
          Choose pool tokens
        </Heading>

        <VStack align="start" spacing="xl" w="full">
          {poolTokens.map((token, index) => {
            const tokenData = listedTokens.find(
              t => t.address.toLowerCase() === token.address?.toLowerCase()
            ) as ApiToken

            const verifiedRateProvider = tokenData
              ? getVerifiedRateProviderAddress(tokenData)
              : undefined

            return (
              <ConfigureToken
                index={index}
                key={index}
                network={network}
                onToggleTokenClicked={() => {
                  setSelectedTokenIndex(index)
                  tokenSelectDisclosure.onOpen()
                }}
                poolTokensLength={poolTokens.length}
                poolType={poolType}
                rateProviderAddress={verifiedRateProvider}
                token={token}
                weightedPoolStructure={weightedPoolStructure}
              />
            )
          })}
          {(!isWeightedPool(poolType) || isCustomWeightedPool(poolType, weightedPoolStructure)) && (
            <AddTokenButton isDisabled={isPoolAtMaxTokens} onClick={() => addPoolToken()} />
          )}

          {isWeightedPool(poolType) && isCustomWeightedPool(poolType, weightedPoolStructure) && (
            <TotalWeightDisplay poolTokens={poolTokens} />
          )}
        </VStack>
      </VStack>

      <TokenSelectModal
        chain={network}
        currentToken={currentTokenAddress}
        enableUnlistedToken
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
