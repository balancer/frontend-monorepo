import {
  VStack,
  Text,
  Radio,
  Stack,
  RadioGroup,
  InputGroup,
  InputRightElement,
  IconButton,
  Heading,
  Divider,
  Box,
  Button,
} from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainSelect } from '../../chains/ChainSelect'
import { SaleStructureForm, UserActions, WeightAdjustmentType } from '../lbp.types'
import {
  Control,
  Controller,
  FieldErrors,
  SubmitHandler,
  UseFormReset,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { isAddress } from 'viem'
import { TokenSelectInput } from '../../tokens/TokenSelectInput'
import { getChainName, getNetworkConfig } from '@repo/lib/config/app.config'
import { Edit, Percent } from 'react-feather'
import { TokenMetadata, useTokenMetadata } from '../../tokens/useTokenMetadata'
import { useEffect, useState } from 'react'
import { useTokens } from '../../tokens/TokensProvider'
import { useLbpForm } from '../LbpFormProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import {
  addDays,
  addHours,
  differenceInDays,
  differenceInHours,
  format,
  parseISO,
  isAfter,
} from 'date-fns'
import { WeightAdjustmentTypeInput } from './WeightAdjustmentTypeInput'
import { LbpFormAction } from '../LbpFormAction'
import { DynamicLbpTokenAmountInputs } from './sale-structure/DynamicLbpTokenAmountInputs'
import { FixedLbpTokenAmountInputs } from './sale-structure/FixedLbpTokenAmountInputs'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { useInterval } from 'usehooks-ts'
import { isSaleStartValid, saleStartsSoon } from './sale-structure/helpers'
import { useWatch, useFormState } from 'react-hook-form'
import { SaleTypeInput } from './sale-structure/SaleTypeInput'

export function SaleStructureStep() {
  const { getToken } = useTokens()

  const {
    saleStructureForm: { handleSubmit, control, setValue, trigger },
    goToNextStep,
    resetLbpCreation,
    poolAddress,
    isDynamicSale,
    isFixedSale,
  } = useLbpForm()

  const [
    selectedChain,
    launchTokenAddress,
    collateralTokenAddress,
    startDateTime,
    endDateTime,
    customEndWeight,
    customStartWeight,
    weightAdjustmentType,
    fee,
  ] = useWatch({
    control,
    name: [
      'selectedChain',
      'launchTokenAddress',
      'collateralTokenAddress',
      'startDateTime',
      'endDateTime',
      'customEndWeight',
      'customStartWeight',
      'weightAdjustmentType',
      'fee',
    ],
  })
  const { isValid, errors } = useFormState({ control })

  const supportedChains = PROJECT_CONFIG.supportedNetworks.filter(chain => {
    const chainConfig = getNetworkConfig(chain)
    return typeof chainConfig?.lbps !== 'undefined'
  })

  const collateralToken = getToken(collateralTokenAddress, selectedChain)

  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, selectedChain)
  const launchTokenIsValid = isAddress(launchTokenAddress) && !!launchTokenMetadata.symbol

  const onSubmit: SubmitHandler<SaleStructureForm> = () => {
    goToNextStep()
  }

  const isPoolCreated = !!poolAddress

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        {!isPoolCreated && (
          <>
            <Heading color="font.maxContrast" size="md">
              Launch token details
            </Heading>

            <VStack align="start" spacing="lg" w="full">
              <SaleTypeInput control={control} />
              <NetworkSelectInput chains={supportedChains} control={control} />
              <LaunchTokenAddressInput
                chainId={selectedChain}
                control={control}
                errors={errors}
                metadata={launchTokenMetadata}
                resetForm={resetLbpCreation}
                setFormValue={setValue}
                triggerValidation={trigger}
                value={launchTokenAddress}
              />
            </VStack>

            {launchTokenIsValid && (
              <>
                <Divider />

                <Heading color="font.maxContrast" size="md">
                  Sale period
                </Heading>
                <VStack align="start" gap="lg" w="full">
                  <VStack align="start" gap="sm" w="full">
                    <SaleStartInput
                      control={control}
                      errors={errors}
                      triggerValidation={trigger}
                      value={startDateTime}
                    />
                  </VStack>
                  <VStack align="start" gap="sm" w="full">
                    <SaleEndInput
                      control={control}
                      errors={errors}
                      saleStart={startDateTime}
                      value={endDateTime}
                    />
                  </VStack>
                </VStack>

                <Divider />

                <Heading color="font.maxContrast" size="md">
                  LBP mechanism
                </Heading>
                <CollateralTokenAddressInput control={control} selectedChain={selectedChain} />
                {isDynamicSale && (
                  <WeightAdjustmentTypeInput
                    collateralTokenSymbol={collateralToken?.symbol || ''}
                    control={control}
                    customEndWeight={customEndWeight ?? 10}
                    customStartWeight={customStartWeight ?? 90}
                    launchTokenSymbol={launchTokenMetadata.symbol || ''}
                    setValue={setValue}
                    weightAdjustmentType={weightAdjustmentType ?? WeightAdjustmentType.LINEAR_90_10}
                  />
                )}
                <UserActionsInput control={control} isFixedSale={isFixedSale} setValue={setValue} />
                <FeeSelection
                  control={control}
                  errors={errors}
                  feeValue={fee}
                  setFormValue={setValue}
                />
                <Divider />
              </>
            )}
          </>
        )}
        {isDynamicSale && <DynamicLbpTokenAmountInputs />}
        {isFixedSale && <FixedLbpTokenAmountInputs />}
        <Divider />
        <LbpFormAction disabled={!isValid || launchTokenMetadata.isLoading} />
      </VStack>
    </form>
  )
}

function NetworkSelectInput({
  control,
  chains,
}: {
  control: Control<SaleStructureForm>
  chains: GqlChain[]
}) {
  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Network / L2</Text>
      <Controller
        control={control}
        name="selectedChain"
        render={({ field }) => (
          <ChainSelect
            chains={chains}
            onChange={newValue => {
              field.onChange(newValue as GqlChain)
            }}
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function LaunchTokenAddressInput({
  control,
  errors,
  setFormValue,
  value,
  metadata,
  chainId,
  triggerValidation,
  resetForm,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  setFormValue: UseFormSetValue<SaleStructureForm>
  value: string
  metadata: TokenMetadata
  chainId: GqlChain
  triggerValidation: UseFormTrigger<SaleStructureForm>
  resetForm: UseFormReset<SaleStructureForm>
}) {
  async function paste() {
    const clipboardText = await navigator.clipboard.readText()
    setFormValue('launchTokenAddress', clipboardText)
  }

  const locked = !!value && !errors.launchTokenAddress

  useEffect(() => {
    if (value) triggerValidation('launchTokenAddress')
  }, [metadata.isLoading, value, triggerValidation])

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Contract address of launch token</Text>
      <InputGroup>
        <Controller
          control={control}
          name="launchTokenAddress"
          render={({ field }) => (
            <InputWithError
              error={errors.launchTokenAddress?.message}
              info="First create the token on the chosen network, if you haven't already."
              isDisabled={locked}
              isInvalid={!!errors.launchTokenAddress}
              onChange={e => field.onChange(e.target.value)}
              placeholder="Enter token address"
              value={field.value}
            />
          )}
          rules={{
            required: 'Token address is required',
            validate: (value: string) => {
              if (!isAddress(value)) return 'This is an invalid token address format'
              if (!metadata.isLoading && !metadata.symbol) {
                return `This is not a valid token address on ${getChainName(chainId)}`
              }

              return true
            },
          }}
        />

        <InputRightElement w="max-content">
          {!locked ? (
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
          ) : (
            <IconButton
              aria-label="edit"
              icon={<Edit size="16px" />}
              onClick={() => resetForm()}
              variant="link"
            />
          )}
        </InputRightElement>
      </InputGroup>
    </VStack>
  )
}

function SaleStartInput({
  control,
  errors,
  value,
  triggerValidation,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  value: string
  triggerValidation: UseFormTrigger<SaleStructureForm>
}) {
  useEffect(() => {
    if (value) triggerValidation('startDateTime')
  }, [value, triggerValidation])

  useInterval(() => {
    if (value) triggerValidation('startDateTime')
  }, 5000)

  return (
    <>
      <DateTimeInput
        control={control}
        errors={errors}
        label="Start date and time"
        min={format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:00")}
        name="startDateTime"
        validate={isSaleStartValid}
      />
      {saleStartsSoon(value) && !errors['startDateTime'] && (
        <Text color="font.warning" fontSize="sm">
          This sale starts soon. Make sure to seed liquidity before this time or the LBP will fail
          to launch.
        </Text>
      )}
    </>
  )
}

function SaleEndInput({
  control,
  errors,
  value,
  saleStart,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  value: string
  saleStart: string
}) {
  const validateSaleEnd = (value: string | number | undefined) => {
    if (typeof value !== 'string') return 'End time must be type string'
    if (!isAfter(parseISO(value), addDays(parseISO(saleStart), 1))) {
      return 'End time must be at least 24 hours after start time'
    }
    return true
  }

  const areSaleTimesValid = !!saleStart && !!value
  const daysDiff = areSaleTimesValid ? differenceInDays(parseISO(value), parseISO(saleStart)) : 0
  const hoursDiff = areSaleTimesValid
    ? differenceInHours(parseISO(value), parseISO(saleStart)) - daysDiff * 24
    : 0

  return (
    <>
      <DateTimeInput
        control={control}
        errors={errors}
        label="End date and time"
        min={saleStart}
        name="endDateTime"
        validate={validateSaleEnd}
      />
      <Text color="font.secondary" fontSize="sm">
        {saleStart && value
          ? `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''} (5 days suggested)`
          : 'Suggested sale period: 5 days'}
      </Text>
    </>
  )
}

function DateTimeInput({
  name,
  label,
  control,
  errors,
  min,
  validate,
}: {
  name: keyof SaleStructureForm
  label: string
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  min?: string
  validate: (value: string | number | undefined) => string | true
}) {
  const today = format(new Date(), "yyyy-MM-dd'T'HH:mm:00")

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <InputWithError
            error={errors[field.name]?.message}
            isInvalid={!!errors[field.name]}
            min={min || today}
            onChange={e => field.onChange(e.target.value)}
            type="datetime-local"
            value={field.value}
          />
        )}
        rules={{
          required: 'Start date and time is required',
          validate,
        }}
      />
    </VStack>
  )
}

function CollateralTokenAddressInput({
  selectedChain,
  control,
}: {
  selectedChain: GqlChain
  control: Control<SaleStructureForm>
}) {
  const chainConfig = getNetworkConfig(selectedChain)
  const nativeAsset = chainConfig?.tokens?.nativeAsset?.address
  const collateralTokens = [...(chainConfig?.lbps?.collateralTokens || []), nativeAsset]

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Collateral token</Text>
      <Controller
        control={control}
        name="collateralTokenAddress"
        render={({ field }) => (
          <TokenSelectInput
            chain={selectedChain}
            defaultTokenAddress={field.value || collateralTokens?.[0]}
            onChange={newValue => {
              field.onChange(newValue as GqlChain)
            }}
            tokenAddresses={collateralTokens ?? []}
            value={field.value}
          />
        )}
      />
    </VStack>
  )
}

function UserActionsInput({
  control,
  isFixedSale,
  setValue,
}: {
  control: Control<SaleStructureForm>
  isFixedSale?: boolean
  setValue?: UseFormSetValue<SaleStructureForm>
}) {
  // For fixed sale types, force "Buy only" and disable the other option
  useEffect(() => {
    if (isFixedSale && setValue) {
      setValue('userActions', UserActions.BUY_ONLY)
    }
  }, [isFixedSale, setValue])

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Available user actions</Text>
      <Controller
        control={control}
        name="userActions"
        render={({ field }) => (
          <RadioGroup onChange={field.onChange} value={field.value}>
            <Stack direction="row" gap="md">
              <Radio isDisabled={isFixedSale} value={UserActions.BUY_AND_SELL}>
                Buy & sell
              </Radio>
              <Radio value={UserActions.BUY_ONLY}>Buy only</Radio>
            </Stack>
          </RadioGroup>
        )}
      />
    </VStack>
  )
}

function FeeSelection({
  control,
  errors,
  feeValue,
  setFormValue,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  feeValue: number
  setFormValue: UseFormSetValue<SaleStructureForm>
}) {
  const [value, setValue] = useState(() => (feeValue === 1.0 ? 'minimum' : 'custom'))

  const isInRange = (fee: number) => {
    if (fee < 1) return 'LBP swap fees must be set at or above 1.00%'
    if (fee > 10) return 'LBP swap fees must be set at or below 10.00%'
    return true
  }

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">LBP swap fees (50% share with Balancer DAO)</Text>
      <RadioGroup
        onChange={(value: string) => {
          setValue(value)
          if (value === 'minimum') setFormValue('fee', 1.0)
        }}
        value={value}
      >
        <Stack direction="row" gap="md">
          <Radio value="minimum">1.00%</Radio>
          <Radio value="custom">Custom</Radio>
        </Stack>
      </RadioGroup>

      {value === 'custom' && (
        <Box w="full">
          <FadeInOnView scaleUp={false}>
            <InputGroup w="full">
              <Controller
                control={control}
                name="fee"
                render={({ field }) => (
                  <InputWithError
                    error={errors[field.name]?.message}
                    info="Minimum fee: 1.00% - Maximum fee: 10.00%"
                    isInvalid={!!errors[field.name]}
                    onChange={e => field.onChange(e.target.value)}
                    step=".01"
                    type="number"
                    value={field.value}
                  />
                )}
                rules={{
                  required: 'Swap fee is required',
                  validate: isInRange,
                }}
              />
              <InputRightElement>
                <Percent size="20" />
              </InputRightElement>
            </InputGroup>
          </FadeInOnView>
        </Box>
      )}
    </VStack>
  )
}
