import { PoolCreationToken, SupportedPoolTypes } from '../../types'
import { useEffect } from 'react'
import { useCoingeckoTokenPrice } from './useCoingeckoTokenPrice'
import { InputWithSuggestion } from '../details/InputWithSuggestion'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

import { WeightedPoolStructure } from '../../constants'
import { NumberInput } from '@repo/lib/shared/components/inputs/NumberInput'

import { ConfigureTokenRateProvider } from './ConfigureTokenRateProvider'
import { isWeightedPool } from '../../helpers'
import { Box, VStack, HStack, Text, Button, Icon, Link } from '@chakra-ui/react'
import { Address } from 'viem'
import { Trash2 } from 'react-feather'
import { AlertTriangle } from 'react-feather'
import { ArrowUpRight } from 'react-feather'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

import { TokenInputSelector } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

interface ConfigureTokenProps {
  token: PoolCreationToken
  index: number
  rateProviderAddress: Address | undefined
  onToggleTokenClicked: () => void
  weightedPoolStructure: WeightedPoolStructure
  poolTokensLength: number
  network: GqlChain
  poolType: SupportedPoolTypes
}

export function ConfigureToken({
  token,
  index,
  rateProviderAddress,
  onToggleTokenClicked,
  weightedPoolStructure,
  poolTokensLength,
  network,
  poolType,
}: ConfigureTokenProps) {
  const { poolCreationForm, removePoolToken, updatePoolToken } = usePoolCreationForm()

  const { priceFor } = useTokens()

  const apiPriceForToken = priceFor(token.address || '', network)
  const { cgPriceForToken } = useCoingeckoTokenPrice({ token: token.address, network })

  useEffect(() => {
    // automatically hydrate form with coingecko price for unlisted tokens
    if (!apiPriceForToken && cgPriceForToken && !token.usdPrice) {
      updatePoolToken(index, {
        usdPrice: cgPriceForToken.toString(),
      })
    }
  }, [cgPriceForToken, apiPriceForToken, token.usdPrice])

  const isInvalidWeight = !!token.weight && Number(token.weight) < 1
  const tokenWeightErrorMsg = poolCreationForm.formState.errors.poolTokens?.[index]?.weight?.message

  return (
    <VStack align="start" key={index} spacing="md" w="full">
      <HStack align="end" w="full">
        <VStack align="start" spacing="sm" w="full">
          <Text>Token {index + 1}</Text>

          <TokenInputSelector onToggleTokenClicked={onToggleTokenClicked} token={token?.data} />
        </VStack>

        {isWeightedPool(poolType) && (
          <Box>
            <NumberInput
              control={poolCreationForm.control}
              isDisabled={weightedPoolStructure !== WeightedPoolStructure.Custom}
              isInvalid={isInvalidWeight}
              isPercentage
              label="Weight"
              name={`poolTokens.${index}.weight`}
              validate={weight => {
                if (!isWeightedPool(poolType)) return true
                if (weight < 1) return 'Minimum weight for each token is 1%'
                if (weight > 99) return 'Maximum weight for a token is 99%'
                return true
              }}
            />
          </Box>
        )}

        {poolTokensLength > 2 && (
          <RemoveTokenButton
            isDisabled={poolTokensLength <= 2}
            onClick={() => removePoolToken(index)}
          />
        )}
      </HStack>

      {isWeightedPool(poolType) && <InvalidWeightInputAlert message={tokenWeightErrorMsg} />}

      {token.address && !apiPriceForToken && (
        <VStack align="start" spacing="sm" w="full">
          <InputWithSuggestion
            attribution={cgPriceForToken && <CoingeckoAttribution />}
            control={poolCreationForm.control}
            isFiatPrice
            label="Estimated current  price of token"
            name={`poolTokens.${index}.usdPrice`}
            onClickSuggestion={() => {
              poolCreationForm.setValue(`poolTokens.${index}.usdPrice`, cgPriceForToken?.toString())
              poolCreationForm.trigger(`poolTokens.${index}.usdPrice`)
            }}
            placeholder="Enter token price"
            suggestedValue={cgPriceForToken ? `$${cgPriceForToken}` : undefined}
            tooltip="Enter the token’s price accurately to avoid losing money to arbitrage."
            validate={(price: string) => {
              if (Number(price) < 0) return 'Token price must be greater than 0'
              return true
            }}
          />
        </VStack>
      )}

      <ConfigureTokenRateProvider
        network={network}
        token={token}
        tokenIndex={index}
        verifiedRateProvider={rateProviderAddress}
      />
    </VStack>
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

function CoingeckoAttribution() {
  return (
    <HStack spacing="xs">
      <Text color="font.secondary" fontSize="sm">
        Price data by
      </Text>

      <Link color="font.link" fontSize="sm" href="https://www.coingecko.com" isExternal>
        CoinGecko
        <Icon as={ArrowUpRight} />
      </Link>
    </HStack>
  )
}
