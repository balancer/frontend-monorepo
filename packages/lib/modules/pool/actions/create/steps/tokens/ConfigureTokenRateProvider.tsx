import { Text, HStack, VStack, RadioGroup, Stack, Radio } from '@chakra-ui/react'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { RATE_PROVIDER_RADIO_OPTIONS, RateProviderOption } from '../../constants'
import { PoolCreationForm } from '../../types'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { Address, parseAbi, zeroAddress } from 'viem'
import { getChainName } from '@repo/lib/config/app.config'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { ShareYieldFeesCheckbox } from './ShareYieldFeesCheckbox'
import { InfoIconPopover } from '../../InfoIconPopover'
import { usePublicClient } from 'wagmi'
import { getChainId } from '@repo/lib/config/app.config'

interface ConfigureTokenRateProviderProps {
  tokenIndex: number
  verifiedRateProviderAddress: string | undefined
}

export function ConfigureTokenRateProvider({
  tokenIndex,
  verifiedRateProviderAddress,
}: ConfigureTokenRateProviderProps) {
  const { poolTokens, network, updatePoolToken, poolCreationForm } = usePoolCreationForm()

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
    <VStack align="start" spacing="md" w="full">
      <VStack align="start" w="full">
        <HStack spacing="xs">
          <Text>Rate Provider</Text>
          <InfoIconPopover message="Tokens that accrue yield over time should use a rate provider" />
        </HStack>
        <RadioGroup onChange={handleRateProviderOptionChange} value={rateProviderRadioValue}>
          <Stack spacing={3}>
            {adjustedRateProviderOptions.map(({ label, value }) => (
              <HStack key={value} spacing="xs">
                <Radio size="lg" value={value}>
                  <Text>{label}</Text>
                </Radio>
                {value === RateProviderOption.Verified && (
                  <BlockExplorerLink
                    address={verifiedRateProviderAddress as Address}
                    chain={network}
                    fontSize="md"
                  />
                )}
              </HStack>
            ))}
          </Stack>
        </RadioGroup>
      </VStack>

      {isCustomRateProvider && (
        <CustomRateProviderInput
          chainName={getChainName(network)}
          control={poolCreationForm.control}
          errors={poolCreationForm.formState.errors}
          isCustomRateProvider={isCustomRateProvider}
          tokenIndex={tokenIndex}
        />
      )}
      {showYieldFeesToggle && (
        <ShareYieldFeesCheckbox paysYieldFees={paysYieldFees} tokenIndex={tokenIndex} />
      )}
    </VStack>
  )
}

interface CustomRateProviderInputProps {
  tokenIndex: number
  control: Control<PoolCreationForm>
  errors: FieldErrors<PoolCreationForm>
  chainName: string
  isCustomRateProvider: boolean
}

function CustomRateProviderInput({
  tokenIndex,
  control,
  errors,
  chainName,
}: CustomRateProviderInputProps) {
  const { updatePoolToken, poolCreationForm, network } = usePoolCreationForm()
  const rateProviderErrors = errors.poolTokens?.[tokenIndex]?.rateProvider

  async function paste() {
    const clipboardText = await navigator.clipboard.readText()
    updatePoolToken(tokenIndex, { rateProvider: clipboardText as Address })
    poolCreationForm.trigger(`poolTokens.${tokenIndex}.rateProvider`)
  }

  const publicClient = usePublicClient({ chainId: getChainId(network) })

  const validateRateProvider = async (address: string) => {
    if (address === '') return false
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
    <VStack align="start" spacing="md" w="full">
      <VStack align="start" spacing="sm" w="full">
        <Controller
          control={control}
          name={`poolTokens.${tokenIndex}.rateProvider`}
          render={({ field }) => (
            <InputWithError
              error={rateProviderErrors?.message}
              isInvalid={!!rateProviderErrors}
              label={`Rate provider contract address on ${chainName}`}
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
        content="All new Rate Provider contracts must be reviewed and approved before LPs can interact with the pool on the Balancer.fi UI. Learn more."
        status="warning"
      />
    </VStack>
  )
}
