import {
  VStack,
  Text,
  Radio,
  Stack,
  RadioGroup,
  InputGroup,
  InputRightElement,
  Heading,
  Divider,
  Box,
  Button,
  HStack,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainSelect } from '../../chains/ChainSelect'
import { SaleStructureForm, UserActions, WeightAdjustmentType } from '../lbp.types'
import { Control, Controller, SubmitHandler, UseFormSetValue } from 'react-hook-form'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { TokenSelectInput } from '../../tokens/TokenSelectInput'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { Percent } from 'react-feather'
import { useTokenMetadata, useTokenMetadataAcrossChains } from '../../tokens/useTokenMetadata'
import { useEffect, useState } from 'react'
import { useTokens } from '../../tokens/TokensProvider'
import { useLbpForm } from '../LbpFormProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { addHours, differenceInDays, differenceInHours, format, parseISO } from 'date-fns'
import { WeightAdjustmentTypeInput } from './WeightAdjustmentTypeInput'
import { LbpFormAction } from '../LbpFormAction'
import { DynamicLbpTokenAmountInputs } from './sale-structure/DynamicLbpTokenAmountInputs'
import { FixedLbpTokenAmountInputs } from './sale-structure/FixedLbpTokenAmountInputs'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { saleStartsSoon } from './sale-structure/helpers'
import { useWatch } from 'react-hook-form'
import { SaleTypeInput } from './sale-structure/SaleTypeInput'
import { InfoIconPopover } from '@repo/lib/modules/pool/actions/create/InfoIconPopover'

export function SaleStructureStep() {
  const { getToken } = useTokens()

  const { saleStructureForm, goToNextStep, poolAddress, isDynamicSale, isFixedSale } = useLbpForm()

  const { handleSubmit, setValue, control, clearErrors } = saleStructureForm

  const [
    selectedChain,
    launchTokenAddress,
    collateralTokenAddress,
    saleType,
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
      'saleType',
      'startDateTime',
      'endDateTime',
      'customEndWeight',
      'customStartWeight',
      'weightAdjustmentType',
      'fee',
    ],
  })

  useEffect(() => {
    clearErrors()
  }, [saleType, clearErrors])

  const supportedChains = PROJECT_CONFIG.supportedNetworks.filter(chain => {
    const chainConfig = getNetworkConfig(chain)
    return typeof chainConfig?.lbps !== 'undefined'
  })

  const collateralToken = getToken(collateralTokenAddress, selectedChain)

  const { match: launchTokenMatch } = useTokenMetadataAcrossChains(
    launchTokenAddress,
    supportedChains
  )
  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, selectedChain)

  useEffect(() => {
    if (launchTokenMatch?.chain && launchTokenMatch.chain !== selectedChain) {
      setValue('selectedChain', launchTokenMatch.chain, { shouldDirty: true })
    }
  }, [launchTokenMatch?.chain, selectedChain, setValue])

  useEffect(() => {
    const chainConfig = getNetworkConfig(selectedChain)
    const nativeAsset = chainConfig?.tokens?.nativeAsset?.address
    const collateralTokens = [...(chainConfig?.lbps?.collateralTokens || []), nativeAsset]
    const normalizedTokens = collateralTokens.filter(Boolean).map(token => token?.toLowerCase())
    const hasValidCollateral = normalizedTokens.includes(
      (collateralTokenAddress || '').toLowerCase()
    )

    if (!hasValidCollateral) {
      setValue('collateralTokenAddress', collateralTokens?.[0] || '', { shouldDirty: true })
    }
  }, [collateralTokenAddress, selectedChain, setValue])
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
              <LaunchTokenAddressInput
                clearErrors={clearErrors}
                control={control}
                setFormValue={setValue}
              />
              <NetworkSelectInput chains={supportedChains} control={control} />
            </VStack>
            <Divider />

            <Heading color="font.maxContrast" size="md">
              Sale period
            </Heading>
            <VStack align="start" gap="lg" w="full">
              <VStack align="start" gap="sm" w="full">
                <SaleStartInput clearErrors={clearErrors} control={control} value={startDateTime} />
              </VStack>
              <VStack align="start" gap="sm" w="full">
                <SaleEndInput
                  clearErrors={clearErrors}
                  control={control}
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
            <UserActionsInput control={control} isFixedSale={isFixedSale} setFormValue={setValue} />
            <FeeSelection
              clearErrors={clearErrors}
              control={control}
              feeValue={fee}
              setFormValue={setValue}
            />
            <Divider />
          </>
        )}
        {isDynamicSale && <DynamicLbpTokenAmountInputs />}
        {isFixedSale && <FixedLbpTokenAmountInputs />}
        <Divider />
        <LbpFormAction />
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
  clearErrors,
  control,
  setFormValue,
}: {
  clearErrors: (name?: keyof SaleStructureForm) => void
  control: Control<SaleStructureForm>
  setFormValue: UseFormSetValue<SaleStructureForm>
}) {
  async function paste() {
    const clipboardText = await navigator.clipboard.readText()
    setFormValue('launchTokenAddress', clipboardText, { shouldDirty: true })
    clearErrors('launchTokenAddress')
  }

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Contract address of launch token</Text>
      <InputGroup>
        <Controller
          control={control}
          name="launchTokenAddress"
          render={({ field, fieldState }) => (
            <InputWithError
              error={fieldState.error?.message}
              info="First create the token on the chosen network, if you haven't already."
              isInvalid={fieldState.invalid}
              onChange={e => {
                field.onChange(e.target.value)
                clearErrors('launchTokenAddress')
              }}
              placeholder="Enter token address"
              value={field.value}
            />
          )}
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
  )
}

function SaleStartInput({
  control,
  clearErrors,
  value,
}: {
  control: Control<SaleStructureForm>
  clearErrors: (name?: keyof SaleStructureForm) => void
  value: string
}) {
  return (
    <>
      <DateTimeInput
        clearErrors={clearErrors}
        control={control}
        label="Start date and time"
        min={format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:00")}
        name="startDateTime"
      />
      {saleStartsSoon(value) && (
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
  clearErrors,
  value,
  saleStart,
}: {
  control: Control<SaleStructureForm>
  clearErrors: (name?: keyof SaleStructureForm) => void
  value: string
  saleStart: string
}) {
  const areSaleTimesValid = !!saleStart && !!value
  const daysDiff = areSaleTimesValid ? differenceInDays(parseISO(value), parseISO(saleStart)) : 0
  const hoursDiff = areSaleTimesValid
    ? differenceInHours(parseISO(value), parseISO(saleStart)) - daysDiff * 24
    : 0

  return (
    <>
      <DateTimeInput
        clearErrors={clearErrors}
        control={control}
        label="End date and time"
        min={saleStart}
        name="endDateTime"
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
  clearErrors,
  min,
}: {
  name: keyof SaleStructureForm
  label: string
  control: Control<SaleStructureForm>
  clearErrors: (name?: keyof SaleStructureForm) => void
  min?: string
}) {
  const today = format(new Date(), "yyyy-MM-dd'T'HH:mm:00")

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <InputWithError
            error={fieldState.error?.message}
            isInvalid={!!fieldState.error}
            min={min || today}
            onChange={e => {
              field.onChange(e.target.value)
              clearErrors(name)
            }}
            type="datetime-local"
            value={field.value}
          />
        )}
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
        render={({ field, fieldState }) => (
          <FormControl isInvalid={!!fieldState.error}>
            <TokenSelectInput
              chain={selectedChain}
              defaultTokenAddress={field.value || collateralTokens?.[0]}
              onChange={newValue => {
                field.onChange(newValue as GqlChain)
              }}
              tokenAddresses={collateralTokens ?? []}
              value={field.value}
            />
            <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
          </FormControl>
        )}
      />
    </VStack>
  )
}

function UserActionsInput({
  control,
  isFixedSale,
  setFormValue,
}: {
  control: Control<SaleStructureForm>
  isFixedSale?: boolean
  setFormValue: UseFormSetValue<SaleStructureForm>
}) {
  useEffect(() => {
    if (isFixedSale) {
      setFormValue('userActions', UserActions.BUY_ONLY, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }, [isFixedSale, setFormValue])

  return (
    <VStack align="start" w="full">
      <HStack>
        <Text color="font.primary">Available user actions</Text>
        {isFixedSale && (
          <InfoIconPopover message="A fixed price LBP does not allow users to sell the project tokens back into the pool." />
        )}
      </HStack>
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
  clearErrors,
  control,
  feeValue,
  setFormValue,
}: {
  clearErrors: (name?: keyof SaleStructureForm) => void
  control: Control<SaleStructureForm>
  feeValue: number
  setFormValue: UseFormSetValue<SaleStructureForm>
}) {
  const [value, setValue] = useState(() => (feeValue === 1.0 ? 'minimum' : 'custom'))

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">{`LBP swap fees (50% share with ${PROJECT_CONFIG.projectName} DAO)`}</Text>
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
                render={({ field, fieldState }) => (
                  <InputWithError
                    error={fieldState.error?.message}
                    info="Minimum fee: 1.00% - Maximum fee: 10.00%"
                    isInvalid={fieldState.invalid}
                    onChange={e => {
                      field.onChange(e.target.value)
                      clearErrors('fee')
                    }}
                    step=".01"
                    type="number"
                    value={field.value}
                  />
                )}
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
