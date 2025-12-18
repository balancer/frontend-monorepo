import { VStack, Heading } from '@chakra-ui/react'
import { InputWithSuggestion } from './InputWithSuggestion'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { validatePoolDetails } from '../../validatePoolCreationForm'
import { useWatch } from 'react-hook-form'
import { useEffect, useRef } from 'react'

export function PoolDetails() {
  const { poolCreationForm } = usePoolCreationForm()
  const poolTokens = useWatch({ control: poolCreationForm.control, name: 'poolTokens' })

  const tokenSymbols = poolTokens.map(token => {
    const { data, weight } = token
    if (!data) return ''
    if (!weight) return data.symbol
    return weight + '% ' + data.symbol
  })

  const suggestedPoolName = tokenSymbols.join(' / ')
  const suggestedPoolSymbol = tokenSymbols.join('-').replace(/% /g, '-')

  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    if (!suggestedPoolName || suggestedPoolName === ' / ') return

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
