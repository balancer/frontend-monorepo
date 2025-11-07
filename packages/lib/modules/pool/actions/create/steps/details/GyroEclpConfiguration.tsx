import { VStack, Heading, Text, HStack } from '@chakra-ui/react'
import { Link } from '@chakra-ui/next-js'
import { ArrowUpRight } from 'react-feather'
import { InputWithSuggestion } from './InputWithSuggestion'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useSuggestedGyroEclpConfig } from './useSuggestedGyroEclpConfig'
import { calculateRotationComponents } from './gyro.helpers'
import { useEffect } from 'react'

export function GyroEclpConfiguration() {
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
  const suggestedEclpConfig = useSuggestedGyroEclpConfig()
  const { eclpConfigForm, poolCreationForm } = usePoolCreationForm()
  const { poolTokens } = poolCreationForm.watch()
  const { peakPrice } = eclpConfigForm.watch()

  const tokenPricePair = poolTokens
    .map(token => token.data?.symbol)
    .filter(Boolean)
    .join(' / ')

  // must re-calculate c and s as peak price input changes
  useEffect(() => {
    const { c, s } = calculateRotationComponents(peakPrice)
    eclpConfigForm.setValue('c', c)
    eclpConfigForm.setValue('s', s)
  }, [peakPrice])

  const lowerBoundPriceInput = {
    label: `Lower bound price: ${tokenPricePair}`,
    name: 'alpha' as const,
    placeholder: '???',
    suggestedValue: suggestedEclpConfig.alpha,
    tooltip: 'The lowest price the pool will provide liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('alpha', suggestedEclpConfig.alpha)
      eclpConfigForm.trigger('alpha')
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }

  const peakPriceInput = {
    label: `Peak price: ${tokenPricePair}`,
    name: 'peakPrice' as const,
    placeholder: '???',
    suggestedValue: suggestedEclpConfig.peakPrice,
    tooltip: 'The price where the pool will provide the deepest liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('peakPrice', suggestedEclpConfig.peakPrice)
      eclpConfigForm.trigger('peakPrice')
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }

  const upperBoundPriceInput = {
    label: `Upper bound price: ${tokenPricePair}`,
    name: 'beta' as const,
    placeholder: '???',
    suggestedValue: suggestedEclpConfig.beta,
    tooltip: 'The highest price the pool will provide liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('beta', suggestedEclpConfig.beta)
      eclpConfigForm.trigger('beta')
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }

  const stretchingFactorInput = {
    label: `Stretching factor`,
    name: 'lambda' as const,
    placeholder: '100',
    tooltip: 'The concentration of liquidity around the peak price',
    control: eclpConfigForm.control,
    validate: (value: string) => {
      if (Number(value) < 0) return 'Value must be greater than 0'
      return true
    },
  }

  const eclpConfigInputs = [
    lowerBoundPriceInput,
    peakPriceInput,
    upperBoundPriceInput,
    stretchingFactorInput,
  ]

  return (
    <>
      {eclpConfigInputs.map(input => (
        <InputWithSuggestion key={input.name} {...input} />
      ))}
    </>
  )
}
