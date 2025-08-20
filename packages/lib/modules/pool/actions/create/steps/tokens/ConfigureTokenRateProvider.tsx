import {
  Text,
  IconButton,
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
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { RATE_PROVIDER_OPTIONS, RateProviderOption } from '../../constants'
import { usePoolCreationForm, PoolCreationConfig } from '../../PoolCreationFormProvider'
import { Address, zeroAddress, isAddress } from 'viem'
import { getChainName } from '@repo/lib/config/app.config'
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { TokenType } from '@balancer/sdk'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'

export function ConfigureTokenRateProvider({
  tokenIndex,
  verifiedRateProviderAddress,
}: {
  verifiedRateProviderAddress: string | undefined
  tokenIndex: number
}) {
  const {
    poolConfigForm: {
      watch,
      setValue,
      control,
      formState: { errors },
    },
  } = usePoolCreationForm()
  const { poolTokens, network } = watch()
  const rateProviderOption = poolTokens[tokenIndex].rateProviderOption
  const isCustomRateProvider = rateProviderOption === RateProviderOption.Custom
  const rateProviderOptionMap = {
    [RateProviderOption.Null]: zeroAddress,
    [RateProviderOption.Verified]: verifiedRateProviderAddress as Address,
    [RateProviderOption.Custom]: '' as const, // to be updated by user input
  }

  const handleRateProviderOptionChange = (value: RateProviderOption) => {
    const newTokenType =
      value === RateProviderOption.Null ? TokenType.STANDARD : TokenType.TOKEN_WITH_RATE
    const newPoolTokens = [...poolTokens]
    newPoolTokens[tokenIndex].config.rateProvider = rateProviderOptionMap[value]
    newPoolTokens[tokenIndex].rateProviderOption = value
    newPoolTokens[tokenIndex].config.tokenType = newTokenType

    setValue('poolTokens', newPoolTokens)
  }

  if (!verifiedRateProviderAddress) {
    return <Text color="font.secondary">No rate provider is required for this token</Text>
  }

  return (
    <VStack align="start" spacing="md" w="full">
      <VStack align="start" w="full">
        <HStack spacing="xs">
          <Text>Rate Provider</Text>
          <InfoIconPopover />
        </HStack>
        <RadioGroup onChange={handleRateProviderOptionChange} value={rateProviderOption}>
          <Stack spacing={3}>
            {RATE_PROVIDER_OPTIONS.map(({ label, value }) => (
              <HStack key={value} spacing="xs">
                <Radio size="lg" value={value}>
                  <Text>{label}</Text>
                </Radio>
                {value === RateProviderOption.Verified && (
                  <BlockExplorerLink
                    address={verifiedRateProviderAddress as Address}
                    chain={network}
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
          setValue={setValue}
          tokenIndex={tokenIndex}
        />
      )}
    </VStack>
  )
}

function CustomRateProviderInput({
  tokenIndex,
  control,
  errors,
  setValue,
  chainName,
}: {
  tokenIndex: number
  control: Control<PoolCreationConfig>
  errors: FieldErrors<PoolCreationConfig>
  setValue: UseFormSetValue<PoolCreationConfig>
  chainName: string
}) {
  async function paste() {
    const clipboardText = await navigator.clipboard.readText()
    setValue(`poolTokens.${tokenIndex}.config.rateProvider`, clipboardText as Address)
  }

  return (
    <VStack align="start" spacing="sm" w="full">
      <HStack spacing="xs">
        <Text>Rate provider contract address on {chainName}</Text>
        <InfoIconPopover />
      </HStack>
      <InputGroup>
        <Controller
          control={control}
          name={`poolTokens.${tokenIndex}.config.rateProvider`}
          render={({ field }) => (
            <InputWithError
              error={errors.poolTokens?.[tokenIndex]?.config?.rateProvider?.message}
              isInvalid={!!errors.poolTokens?.[0]?.config?.rateProvider}
              onChange={e => field.onChange(e.target.value)}
              placeholder="0xba100000625a3754423978a60c9317c58a424e3D"
              value={field.value}
            />
          )}
          rules={{
            required: 'Token address is required',
            validate: (value: string) => {
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

      <BalAlert
        content="All new Rate Provider contracts must be reviewed and approved before LPs can interact with the pool on the Balancer.fi UI. Learn more."
        status="warning"
      />
    </VStack>
  )
}

function InfoIconPopover() {
  return (
    <IconButton
      _hover={{
        opacity: '1',
      }}
      aria-label="Token info"
      color="grayText"
      h="24px"
      icon={<InfoIcon />}
      isRound
      opacity="0.5"
      size="xs"
      variant="link"
    />
  )
}
