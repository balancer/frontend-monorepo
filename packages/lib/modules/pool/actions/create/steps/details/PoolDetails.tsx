import { VStack, Heading } from '@chakra-ui/react'
import { InputWithSuggestion } from './InputWithSuggestion'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { validatePoolDetails } from '../../validatePoolCreationForm'
import { useWatch } from 'react-hook-form'
import { useEffect, useRef } from 'react'
import { PoolCreationToken, SupportedPoolTypes } from '../../types'
import { isWeightedPool, isStableSurgePool, isReClammPool } from '../../helpers'
import { MAX_POOL_NAME_LENGTH, MAX_POOL_SYMBOL_LENGTH } from '../../constants'

export function PoolDetails() {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolTokens, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'poolType'],
  })

  const { suggestedPoolName, suggestedPoolSymbol } = getSuggestions(poolTokens, poolType)

  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    if (!suggestedPoolName || suggestedPoolName === '-') return

    const currentName = poolCreationForm.getValues('name')
    const currentSymbol = poolCreationForm.getValues('symbol')

    if (!currentName) {
      poolCreationForm.setValue('name', suggestedPoolName)
      poolCreationForm.trigger('name')
    }
    if (!currentSymbol) {
      poolCreationForm.setValue('symbol', suggestedPoolSymbol)
      poolCreationForm.trigger('symbol')
    }

    hasInitialized.current = true
  }, [suggestedPoolName, suggestedPoolSymbol, poolCreationForm])

  return (
    <VStack align="start" spacing="xl" w="full">
      <Heading color="font.maxContrast" size="md">
        Pool details
      </Heading>

      <InputWithSuggestion
        control={poolCreationForm.control}
        label="Pool name"
        name="name"
        onClickSuggestion={() => {
          poolCreationForm.setValue('name', suggestedPoolName)
          poolCreationForm.trigger('name')
        }}
        placeholder="Enter pool name"
        suggestedValue={suggestedPoolName}
        tooltip="The name for the pool token"
        validate={validatePoolDetails.name}
      />

      <InputWithSuggestion
        control={poolCreationForm.control}
        label="Pool symbol"
        name="symbol"
        onClickSuggestion={() => {
          poolCreationForm.setValue('symbol', suggestedPoolSymbol)
          poolCreationForm.trigger('symbol')
        }}
        placeholder="Enter pool symbol"
        suggestedValue={suggestedPoolSymbol}
        tooltip="The symbol for the pool token"
        validate={validatePoolDetails.symbol}
      />
    </VStack>
  )
}

function getSuggestions(poolTokens: PoolCreationToken[], poolType: SupportedPoolTypes) {
  const poolTypePrefix = isStableSurgePool(poolType)
    ? 'surge'
    : isReClammPool(poolType)
      ? 'reCLAMM'
      : ''

  const tokenSymbols = poolTokens
    .map(({ data, weight }) => {
      if (!data?.symbol) return ''
      if (!isWeightedPool(poolType) || !weight) return data.symbol
      return weight + data.symbol
    })
    .join('-')

  const poolSymbol = poolTypePrefix ? `${poolTypePrefix}-${tokenSymbols}` : tokenSymbols
  const suggestedPoolSymbol =
    poolSymbol.length <= MAX_POOL_SYMBOL_LENGTH ? poolSymbol : tokenSymbols

  const poolName = poolTypePrefix ? `${poolTypePrefix} ${tokenSymbols}` : tokenSymbols
  const suggestedPoolName =
    `Balancer ${poolName}`.length <= MAX_POOL_NAME_LENGTH ? `Balancer ${poolName}` : poolName

  return { suggestedPoolName, suggestedPoolSymbol }
}
