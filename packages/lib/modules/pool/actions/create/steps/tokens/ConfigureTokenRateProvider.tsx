import { Text, HStack, VStack, RadioGroup, Stack, Radio, Link, Box } from '@chakra-ui/react'
import { FormSubsection } from '@repo/lib/shared/components/inputs/FormSubsection'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { RATE_PROVIDER_RADIO_OPTIONS, RateProviderOption } from '../../constants'
import { PoolCreationForm } from '../../types'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { Address, parseAbi, zeroAddress } from 'viem'
import { getChainName } from '@repo/lib/config/app.config'
import { Control, Controller, FieldErrors, useFormState, useWatch } from 'react-hook-form'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { ShareYieldFeesCheckbox } from './ShareYieldFeesCheckbox'
import { InfoIconPopover } from '../../InfoIconPopover'
import { usePublicClient } from 'wagmi'
import { getChainId } from '@repo/lib/config/app.config'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ArrowUpRight } from 'react-feather'

interface ConfigureTokenRateProviderProps {
  tokenIndex: number
  verifiedRateProviderAddress: string | undefined
}

export function ConfigureTokenRateProvider({
  tokenIndex,
  verifiedRateProviderAddress,
}: ConfigureTokenRateProviderProps) {
  const { updatePoolToken, poolCreationForm } = usePoolCreationForm()
  const [poolTokens, network] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'network'],
  })
  const formState = useFormState({ control: poolCreationForm.control })

  if (!poolTokens[tokenIndex].address) return null

  const { rateProvider: currentRateProvider, paysYieldFees } = poolTokens[tokenIndex]

  let rateProviderRadioValue = RateProviderOption.Null
  if (currentRateProvider === verifiedRateProviderAddress) {
    rateProviderRadioValue = RateProviderOption.Verified
  }
  if (currentRateProvider !== zeroAddress && currentRateProvider !== verifiedRateProviderAddress) {
    rateProviderRadioValue = RateProviderOption.Custom
  }

  const handleRateProviderOptionChange = (value: RateProviderOption) => {
    let rateProvider: Address | '' = zeroAddress

    if (value === RateProviderOption.Verified) {
      rateProvider = verifiedRateProviderAddress as Address
    } else if (value === RateProviderOption.Custom) {
      rateProvider = '' // to be updated by user input
    }

    const paysYieldFees = value !== RateProviderOption.Null

    updatePoolToken(tokenIndex, { rateProvider, paysYieldFees })
    // must trigger validation for text input since radio not kept in form state (instead we infer value for radio above)
    poolCreationForm.trigger(`poolTokens.${tokenIndex}.rateProvider`)
  }

  const isCustomRateProvider = rateProviderRadioValue === RateProviderOption.Custom
  const isVerifiedRateProvider = rateProviderRadioValue === RateProviderOption.Verified
  const showYieldFeesToggle = isCustomRateProvider || isVerifiedRateProvider

  const adjustedRateProviderOptions = RATE_PROVIDER_RADIO_OPTIONS.filter(
    option => option.value !== RateProviderOption.Verified || verifiedRateProviderAddress
  )

  return (
    <FormSubsection marginLeft={{ base: 0, sm: 4, md: 5 }}>
      <VStack align="start" w="full">
        <HStack spacing="xs">
          <Text fontWeight="bold">Rate Provider</Text>
          <InfoIconPopover message="Tokens that accrue yield over time should use a rate provider" />
        </HStack>
        <RadioGroup onChange={handleRateProviderOptionChange} value={rateProviderRadioValue}>
          <Stack spacing={3}>
            {adjustedRateProviderOptions.map(({ label, value }) => (
              <Stack
                direction={{ base: 'column', md: 'row' }}
                key={value}
                spacing={{ base: 1, md: 'xs' }}
              >
                <Radio size="lg" value={value}>
                  <Text>{label}</Text>
                </Radio>
                {value === RateProviderOption.Verified && (
                  <Box pl={{ base: 7, md: 0 }}>
                    <BlockExplorerLink
                      address={verifiedRateProviderAddress as Address}
                      chain={network}
                    />
                  </Box>
                )}
              </Stack>
            ))}
          </Stack>
        </RadioGroup>
      </VStack>

      {isCustomRateProvider && (
        <CustomRateProviderInput
          chainName={getChainName(network)}
          control={poolCreationForm.control}
          errors={formState.errors}
          isCustomRateProvider={isCustomRateProvider}
          network={network}
          tokenIndex={tokenIndex}
        />
      )}
      {showYieldFeesToggle && (
        <ShareYieldFeesCheckbox paysYieldFees={paysYieldFees} tokenIndex={tokenIndex} />
      )}
    </FormSubsection>
  )
}

interface CustomRateProviderInputProps {
  tokenIndex: number
  control: Control<PoolCreationForm>
  errors: FieldErrors<PoolCreationForm>
  chainName: string
  isCustomRateProvider: boolean
  network: GqlChain
}

function CustomRateProviderInput({
  tokenIndex,
  control,
  errors,
  chainName,
  network,
}: CustomRateProviderInputProps) {
  const { updatePoolToken, poolCreationForm } = usePoolCreationForm()
  const rateProviderErrors = errors.poolTokens?.[tokenIndex]?.rateProvider

  async function paste() {
    const clipboardText = await navigator.clipboard.readText()
    updatePoolToken(tokenIndex, { rateProvider: clipboardText as Address })
    poolCreationForm.trigger(`poolTokens.${tokenIndex}.rateProvider`)
  }

  const publicClient = usePublicClient({ chainId: getChainId(network) })

  const validateRateProvider = async (address: string) => {
    if (address === zeroAddress) return true
    if (address === '') return 'Rate provider address is required'
    try {
      if (!publicClient) return 'missing public client for rate provider validation'
      const rate = await publicClient.readContract({
        address: address as Address,
        abi: parseAbi(['function getRate() external view returns (uint256)']),
        functionName: 'getRate',
        args: [],
      })
      if (!rate) return 'invalid rate provider address'
      return true
    } catch (error) {
      if (error && typeof error === 'object' && 'shortMessage' in error) {
        return (error as any).shortMessage
      }
      return 'unexpected error validating rate provider address'
    }
  }

  return (
    <VStack align="start" my="4" spacing="md" w="full">
      <VStack align="start" spacing="sm" w="full">
        <Controller
          control={control}
          name={`poolTokens.${tokenIndex}.rateProvider`}
          render={({ field }) => (
            <InputWithError
              error={rateProviderErrors?.message}
              isInvalid={!!rateProviderErrors}
              label={`Rate Provider contract address (on ${chainName})`}
              onChange={e => field.onChange(e.target.value)}
              pasteFn={paste}
              placeholder="0xba100000625a3754423978a60c9317c58a424e3D"
              tooltip="The contract you enter must have a function named getRate"
              value={field.value}
            />
          )}
          rules={{
            validate: validateRateProvider,
          }}
        />
      </VStack>

      <BalAlert
        content={
          <Text color="black">
            All new Rate Provider contracts must be approved before LPs can interact with the pool
            on the {PROJECT_CONFIG.projectName} UI.{' '}
            <Link
              _hover={{ transform: 'none !important', color: 'black !important' }}
              alignItems="center"
              color="black !important"
              display="inline-flex"
              gap="xs"
              href="https://docs.balancer.fi/partner-onboarding/onboarding-overview/rate-providers.html#what-are-the-requirements-for-a-rate-provider-contract"
              isExternal
              textDecoration="underline"
            >
              Learn more
              <ArrowUpRight size={14} />
            </Link>
          </Text>
        }
        status="warning"
      />
    </VStack>
  )
}
