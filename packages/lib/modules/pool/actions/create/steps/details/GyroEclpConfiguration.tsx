import { VStack, Heading, Text, HStack, Link } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { InputWithSuggestion } from './InputWithSuggestion'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useSuggestedGyroEclpConfig } from './useSuggestedGyroEclpConfig'
import { calculateRotationComponents } from './gyro.helpers'
import { useEffect } from 'react'
import { MAX_LAMBDA } from '../../constants'
import { useValidateEclpParams } from './useValidateEclpParams'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useWatch } from 'react-hook-form'

export function GyroEclpConfiguration() {
  const { errorMessage } = useValidateEclpParams()

  return (
    <VStack align="start" spacing="xl" w="full">
      <EclpParamHeader />
      <EclpParamInputs />
      {errorMessage && (
        <BalAlert content={errorMessage} status="error" title="Invalid E-CLP parameters" />
      )}
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
  const poolTokens = useWatch({ control: poolCreationForm.control, name: 'poolTokens' })
  const [alpha, beta, peakPrice, lambda, c, s] = useWatch({
    control: eclpConfigForm.control,
    name: ['alpha', 'beta', 'peakPrice', 'lambda', 'c', 's'],
  })

  const tokenPricePair = poolTokens
    .map(token => token.data?.symbol)
    .filter(Boolean)
    .join(' / ')

  // peak price is used to calculate c and s
  useEffect(() => {
    const { c, s } = calculateRotationComponents(peakPrice || '')
    eclpConfigForm.setValue('c', c, { shouldValidate: true })
    eclpConfigForm.setValue('s', s, { shouldValidate: true })
  }, [peakPrice])

  // reset init amounts when eclp params change
  useEffect(() => {
    poolCreationForm.setValue(
      'poolTokens',
      [...poolTokens].map(token => ({ ...token, amount: '' }))
    )
  }, [alpha, beta, peakPrice, lambda, c, s])

  const lowerBoundPriceInput = {
    label: `Lower bound price: ${tokenPricePair}`,
    name: 'alpha' as const,
    placeholder: suggestedEclpConfig.alpha,
    suggestedValue: suggestedEclpConfig.alpha,
    tooltip: 'The lowest price the pool will provide liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('alpha', suggestedEclpConfig.alpha, { shouldValidate: true })
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Lower bound price must be greater than 0'
      if (Number(value) >= Number(peakPrice)) {
        return 'Lower bound price must be less than peak price'
      }
      if (Number(value) >= Number(beta)) {
        return 'Lower bound price must be less than upper bound price'
      }
      return true
    },
  }

  const peakPriceInput = {
    label: `Peak price: ${tokenPricePair}`,
    name: 'peakPrice' as const,
    placeholder: suggestedEclpConfig.peakPrice,
    suggestedValue: suggestedEclpConfig.peakPrice,
    tooltip: 'The price where the pool will provide the deepest liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('peakPrice', suggestedEclpConfig.peakPrice, { shouldValidate: true })
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Peak price must be greater than 0'
      if (Number(value) <= Number(alpha)) return 'Peak price must be greater than lower bound price'
      if (Number(value) >= Number(beta)) return 'Peak price must be less than upper bound price'
      return true
    },
  }

  const upperBoundPriceInput = {
    label: `Upper bound price: ${tokenPricePair}`,
    name: 'beta' as const,
    placeholder: suggestedEclpConfig.beta,
    suggestedValue: suggestedEclpConfig.beta,
    tooltip: 'The highest price the pool will provide liquidity',
    control: eclpConfigForm.control,
    onClickSuggestion: () => {
      eclpConfigForm.setValue('beta', suggestedEclpConfig.beta, { shouldValidate: true })
    },
    validate: (value: string) => {
      if (Number(value) < 0) return 'Upper bound price must be greater than 0'
      if (Number(value) <= Number(alpha)) {
        return 'Upper bound price must be greater than lower bound price'
      }
      if (Number(value) <= Number(peakPrice)) {
        return 'Upper bound price must be greater than peak price'
      }
      return true
    },
  }

  const stretchingFactorInput = {
    label: `Stretching factor`,
    name: 'lambda' as const,
    placeholder: suggestedEclpConfig.lambda,
    tooltip: 'The concentration of liquidity around the peak price',
    control: eclpConfigForm.control,
    validate: (value: string) => {
      if (Number(value) <= 0) return 'Stretching factor must be greater than 0'
      if (Number(value) > MAX_LAMBDA) return `Maximum value for stretching factor is ${MAX_LAMBDA}`
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
