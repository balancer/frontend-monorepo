import { VStack, Heading, Text, HStack } from '@chakra-ui/react'
import { Link } from '@chakra-ui/next-js'
import { ArrowUpRight } from 'react-feather'
import { InputWithSuggestion } from './InputWithSuggestion'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

export function EclpConfiguration() {
  return (
    <VStack align="start" spacing="xl" w="full">
      <EclpParamHeader />
      <EclpParamInputs />
    </VStack>
  )
}

function EclpParamHeader() {
  return (
    <VStack align="start" spacing="sm" w="full">
      <Heading color="font.maxContrast" size="md">
        Gyro E-CLP configuration
      </Heading>
      <HStack>
        <Text color="font.secondary">To learn more about all the parameters, </Text>
        <Link
          alignItems="center"
          display="inline-flex"
          gap="xs"
          href="https://docs.gyro.finance/pools/e-clps.html#reading-e-clp-parameters"
          isExternal
        >
          read the Gyroscope docs
          <ArrowUpRight size={14} />
        </Link>
      </HStack>
    </VStack>
  )
}

function EclpParamInputs() {
  const { eclpConfigForm, poolCreationForm, updatePoolToken } = usePoolCreationForm()
  const { poolTokens, network } = poolCreationForm.watch()
  const { priceFor } = useTokens()

  const tokenA = poolTokens[0]
  const tokenB = poolTokens[1]
  const usdPriceTokenA = priceFor(tokenA?.address || '', network)
  const usdPriceTokenB = priceFor(tokenB?.address || '', network)

  const tokenPricePair = poolTokens
    .map(token => token.data?.symbol)
    .filter(Boolean)
    .join(' / ')

  const usdPriceForTokenA = {
    label: `${tokenA.data?.symbol} / USD price`,
    name: 'poolTokens.0.usdPrice' as const,
    placeholder: '???',
    suggestionLabel: 'Current price',
    suggestedValue: `$${usdPriceTokenA}`,
    tooltip: `Amount of USD per ${tokenA.data?.symbol}`,
    control: poolCreationForm.control,
    onClickSuggestion: () => {
      updatePoolToken(0, { usdPrice: usdPriceTokenA })
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }

  const usdPriceForTokenB = {
    label: `${tokenB.data?.symbol} / USD price`,
    name: 'poolTokens.1.usdPrice' as const,
    placeholder: '???',
    suggestionLabel: 'Current price',
    suggestedValue: `$${usdPriceTokenB}`,
    tooltip: `Amount of USD per ${tokenB.data?.symbol}`,
    control: poolCreationForm.control,
    onClickSuggestion: () => {
      updatePoolToken(1, { usdPrice: usdPriceTokenB })
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }

  const lowerBoundPrice = {
    label: `Lower bound price: ${tokenPricePair}`,
    name: 'alpha' as const,
    placeholder: '???',
    suggestedValue: '1',
    tooltip: 'The lowest price the pool will provide liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('alpha', '1')
      eclpConfigForm.trigger('alpha')
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }
  const peakPrice = {
    label: `Peak price: ${tokenPricePair}`,
    name: 'peakPrice' as const,
    placeholder: '???',
    suggestedValue: '2',
    tooltip: 'The price where the pool will provide the deepest liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('peakPrice', '2')
      eclpConfigForm.trigger('peakPrice')
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }
  const upperBoundPrice = {
    label: `Upper bound price: ${tokenPricePair}`,
    name: 'beta' as const,
    placeholder: '???',
    suggestedValue: '3',
    tooltip: 'The highest price the pool will provide liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('beta', '3')
      eclpConfigForm.trigger('beta')
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }
  const stretchingFactor = {
    label: `Stretching factor`,
    name: 'lambda' as const,
    placeholder: '???',
    suggestedValue: '10',
    tooltip: 'The concentration of liquidity around the peak price',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('lambda', '10')
      eclpConfigForm.trigger('lambda')
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }

  const eclpConfigInputs = [
    usdPriceForTokenA,
    usdPriceForTokenB,
    lowerBoundPrice,
    peakPrice,
    upperBoundPrice,
    stretchingFactor,
  ]

  return (
    <>
      {eclpConfigInputs.map(input => (
        <InputWithSuggestion key={input.name} {...input} />
      ))}
    </>
  )
}
