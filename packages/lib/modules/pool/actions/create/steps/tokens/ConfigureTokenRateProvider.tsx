import {
  Text,
  HStack,
  VStack,
  RadioGroup,
  Stack,
  Radio,
  InputGroup,
  InputRightElement,
  Button,
} from '@chakra-ui/react'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { RATE_PROVIDER_RADIO_OPTIONS, RateProviderOption } from '../../constants'
import { usePoolCreationForm, PoolCreationConfig } from '../../PoolCreationFormProvider'
import { Address, zeroAddress, isAddress } from 'viem'
import { getChainName } from '@repo/lib/config/app.config'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { ShareYieldFeesCheckbox } from './ShareYieldFeesCheckbox'
import { InfoIconPopover } from '../../InfoIconPopover'

export function ConfigureTokenRateProvider({
  tokenIndex,
  verifiedRateProviderAddress,
}: {
  verifiedRateProviderAddress: string | undefined
  tokenIndex: number
}) {
  const {
    poolTokens,
    network,
    updatePoolToken,
    poolConfigForm: {
      control,
      formState: { errors },
      trigger,
    },
  } = usePoolCreationForm()

  if (!poolTokens[tokenIndex].address) return null

  if (!verifiedRateProviderAddress) {
    return <Text color="font.secondary">No rate provider is required for this token</Text>
  }

  const { rateProvider: currentRateProvider, paysYieldFees } = poolTokens[tokenIndex]

  let rateProviderRadioValue = RateProviderOption.Null
  if (currentRateProvider === verifiedRateProviderAddress)
    rateProviderRadioValue = RateProviderOption.Verified
  if (currentRateProvider !== zeroAddress && currentRateProvider !== verifiedRateProviderAddress)
    rateProviderRadioValue = RateProviderOption.Custom

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
    trigger(`poolTokens.${tokenIndex}.rateProvider`)
  }

  const isCustomRateProvider = rateProviderRadioValue === RateProviderOption.Custom
  const isVerifiedRateProvider = rateProviderRadioValue === RateProviderOption.Verified
  const showYieldFeesToggle = isCustomRateProvider || isVerifiedRateProvider

  return (
    <VStack align="start" spacing="md" w="full">
      <VStack align="start" w="full">
        <HStack spacing="xs">
          <Text>Rate Provider</Text>
          <InfoIconPopover message="Tokens that accrue yield over time should use a rate provider" />
        </HStack>
        <RadioGroup onChange={handleRateProviderOptionChange} value={rateProviderRadioValue}>
          <Stack spacing={3}>
            {RATE_PROVIDER_RADIO_OPTIONS.map(({ label, value }) => (
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
          control={control}
          errors={errors}
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

function CustomRateProviderInput({
  tokenIndex,
  control,
  errors,
  chainName,
  isCustomRateProvider,
}: {
  tokenIndex: number
  control: Control<PoolCreationConfig>
  errors: FieldErrors<PoolCreationConfig>
  chainName: string
  isCustomRateProvider: boolean
}) {
  const { updatePoolToken } = usePoolCreationForm()
  async function paste() {
    const clipboardText = await navigator.clipboard.readText()
    updatePoolToken(tokenIndex, { rateProvider: clipboardText as Address })
  }

  return (
    <VStack align="start" spacing="md" w="full">
      <VStack align="start" spacing="sm" w="full">
        <HStack spacing="xs">
          <Text>Rate provider contract address on {chainName}</Text>
          <InfoIconPopover message="The contract you enter must have a function named getRate" />
        </HStack>
        <InputGroup>
          <Controller
            control={control}
            name={`poolTokens.${tokenIndex}.rateProvider`}
            render={({ field }) => (
              <InputWithError
                error={errors.poolTokens?.[tokenIndex]?.rateProvider?.message}
                isInvalid={!!errors.poolTokens?.[tokenIndex]?.rateProvider}
                onChange={e => field.onChange(e.target.value)}
                placeholder="0xba100000625a3754423978a60c9317c58a424e3D"
                value={field.value}
              />
            )}
            rules={{
              validate: (value: string) => {
                if (!isCustomRateProvider) return true
                if (!isAddress(value)) return 'This is an invalid rate provider address format'
                return true
              },
            }}
          />

          <InputRightElement w="max-content">
            <Button
              aria-label="paste"
              h="28px"
              letterSpacing="0.25px"
              lineHeight="1"
              mr="0.5"
              onClick={paste}
              position="relative"
              px="2"
              right="3px"
              rounded="sm"
              size="sm"
              variant="tertiary"
            >
              Paste
            </Button>
          </InputRightElement>
        </InputGroup>
      </VStack>

      <BalAlert
        content="All new Rate Provider contracts must be reviewed and approved before LPs can interact with the pool on the Balancer.fi UI. Learn more."
        status="warning"
      />
    </VStack>
  )
}
