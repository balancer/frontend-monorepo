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
  Alert,
  AlertIcon,
  AlertDescription,
  Button,
} from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainSelect } from '../../chains/ChainSelect'
import { SaleStructureForm } from '../lbp.types'
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
import { formatUnits, isAddress } from 'viem'
import { TokenSelectInput } from '../../tokens/TokenSelectInput'
import { getChainId, getChainName, getNetworkConfig } from '@repo/lib/config/app.config'
import { AlertTriangle, Edit, Percent } from 'react-feather'
import { TokenMetadata, useTokenMetadata } from '../../tokens/useTokenMetadata'
import { TokenInput } from '../../tokens/TokenInput/TokenInput'
import { isGreaterThanZeroValidation, bn } from '@repo/lib/shared/utils/numbers'
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
  isBefore,
  parseISO,
  isAfter,
} from 'date-fns'
import { TokenBalancesProvider, useTokenBalances } from '../../tokens/TokenBalancesProvider'
import { WeightAdjustmentTypeInput } from './WeightAdjustmentTypeInput'
import { TokenInputsValidationProvider } from '../../tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '../../price-impact/PriceImpactProvider'
import { LbpFormAction } from '../LbpFormAction'
import { CustomToken } from '../../tokens/token.types'
import { useUserBalance } from '@repo/lib/shared/hooks/useUserBalance'
import { LightbulbIcon } from '@repo/lib/shared/components/icons/LightbulbIcon'
import { now } from '@repo/lib/shared/utils/time'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export function SaleStructureStep() {
  const { getToken } = useTokens()

  const {
    saleStructureForm: {
      handleSubmit,
      control,
      formState: { errors, isValid },
      watch,
      setValue,
      trigger,
    },
    setActiveStep,
    activeStepIndex,
    resetLbpCreation,
    launchToken,
  } = useLbpForm()
  const saleStructureData = watch()

  const supportedChains = PROJECT_CONFIG.supportedNetworks.filter(chain => {
    const chainConfig = getNetworkConfig(chain)
    return typeof chainConfig?.lbps !== 'undefined'
  })

  const selectedChain = saleStructureData.selectedChain
  const launchTokenAddress = saleStructureData.launchTokenAddress
  const collateralTokenAddress = saleStructureData.collateralTokenAddress

  const saleStart = saleStructureData.startTime
  const saleEnd = saleStructureData.endTime

  const validateSaleStart = (value: string | number) => {
    if (typeof value !== 'string') return 'Start time must be type string'
    if (!isAfter(parseISO(value), addHours(now(), 1))) {
      return 'Set the start time at least 1 hour ahead to ensure the pool is seeded before the sale begins.'
    }
    return true
  }

  const validateSaleEnd = (value: string | number) => {
    if (typeof value !== 'string') return 'End time must be type string'
    if (!isAfter(parseISO(value), addDays(parseISO(saleStart), 1))) {
      return 'End time must be at least 24 hours after start time'
    }
    return true
  }

  const isSaleStartValid = validateSaleStart(saleStart)

  const saleStartsSoon =
    isSaleStartValid && saleStart && isBefore(parseISO(saleStart), addDays(now(), 1))
  const areSaleTimesValid = !!saleStart && !!saleEnd
  const daysDiff = areSaleTimesValid ? differenceInDays(parseISO(saleEnd), parseISO(saleStart)) : 0
  const hoursDiff = areSaleTimesValid
    ? differenceInHours(parseISO(saleEnd), parseISO(saleStart)) - daysDiff * 24
    : 0

  const collateralToken = getToken(collateralTokenAddress, selectedChain)

  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, selectedChain)
  const launchTokenIsValid = isAddress(launchTokenAddress) && !!launchTokenMetadata.symbol

  const onSubmit: SubmitHandler<SaleStructureForm> = () => {
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Launch token details
        </Heading>

        <VStack align="start" spacing="lg" w="full">
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
                <DateTimeInput
                  control={control}
                  errors={errors}
                  label="Start date and time"
                  min={format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:00")}
                  name="startTime"
                  validate={validateSaleStart}
                />
                {saleStartsSoon && (
                  <Text color="font.warning" fontSize="sm">
                    This sale starts soon. Make sure to seed liquidity before this time or the LBP
                    will fail to launch.
                  </Text>
                )}
              </VStack>
              <VStack align="start" gap="sm" w="full">
                <DateTimeInput
                  control={control}
                  errors={errors}
                  label="End date and time"
                  min={saleStart}
                  name="endTime"
                  validate={validateSaleEnd}
                />
                <Text color="font.secondary" fontSize="sm">
                  {saleStart && saleEnd
                    ? `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''} (5 days suggested)`
                    : 'Suggested sale period: 5 days'}
                </Text>
              </VStack>
            </VStack>
            <Divider />
            <Heading color="font.maxContrast" size="md">
              LBP mechanism
            </Heading>
            <CollateralTokenAddressInput control={control} selectedChain={selectedChain} />
            <WeightAdjustmentTypeInput
              collateralTokenSymbol={collateralToken?.symbol || ''}
              control={control}
              launchTokenSymbol={launchTokenMetadata.symbol || ''}
              setValue={setValue}
              watch={watch}
            />
            <UserActionsInput control={control} />
            <FeeSelection
              control={control}
              errors={errors}
              feeValue={saleStructureData.fee}
              setFormValue={setValue}
            />
            <Divider />
            <VStack align="start" spacing="md" w="full">
              <Heading color="font.maxContrast" size="md">
                Seed initial pool liquidity
              </Heading>
              <Text color="font.secondary" fontSize="sm">
                The initial seed amounts and their ratio set the starting price, projected market
                cap and price curve. The stats and charts in the preview show the impact of your
                choices.
              </Text>
              {isSaleStartValid && saleStart && (
                <Alert status={saleStartsSoon ? 'warning' : 'info'} variant="WideOnDesktop">
                  <AlertIcon as={saleStartsSoon ? AlertTriangle : LightbulbIcon} />
                  <AlertDescription color="#000" fontSize="sm">
                    {saleStartsSoon && 'This sale is scheduled to start soon. '}
                    The LBP will fail to launch unless you seed the initial liquidity before the
                    scheduled start time at {format(parseISO(saleStart), 'h:mmaaa, d MMMM yyyy')}.
                  </AlertDescription>
                </Alert>
              )}
            </VStack>

            <TokenInputsValidationProvider>
              {/* TODO: Decouple PriceImpactProvider from Token input, it shouldn't be a dependency. */}
              <PriceImpactProvider>
                {collateralToken && (
                  <TokenBalancesProvider extTokens={[collateralToken]}>
                    <SaleTokenAmountInput
                      control={control}
                      errors={errors}
                      launchToken={launchToken}
                      selectedChain={selectedChain}
                    />
                    <CollateralTokenAmountInput
                      collateralTokenAddress={collateralTokenAddress}
                      collateralTokenSymbol={collateralToken?.symbol || ''}
                      control={control}
                      errors={errors}
                      selectedChain={selectedChain}
                    />
                  </TokenBalancesProvider>
                )}
              </PriceImpactProvider>
            </TokenInputsValidationProvider>
          </>
        )}
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
  validate: (value: string | number) => string | true
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

function UserActionsInput({ control }: { control: Control<SaleStructureForm> }) {
  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Available user actions</Text>
      <Controller
        control={control}
        name="userActions"
        render={({ field }) => (
          <RadioGroup onChange={field.onChange} value={field.value}>
            <Stack direction="row" gap="md">
              <Radio value="buy_and_sell">Buy & sell</Radio>
              <Radio value="buy_only">Buy only</Radio>
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
  const [value, setValue] = useState('minimum')

  useEffect(() => {
    if (feeValue !== 1.0) setValue('custom')
  }, [feeValue])

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

function SaleTokenAmountInput({
  control,
  errors,
  selectedChain,
  launchToken,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  selectedChain: GqlChain
  launchToken: CustomToken
}) {
  const { balanceData, isLoading } = useUserBalance({
    chainId: getChainId(selectedChain),
    token: launchToken.address,
  })

  const haveEnoughAmount = (value: string) => {
    if (isLoading) return true

    if (!balanceData || balanceData.value === 0n) {
      return `Your wallet has no ${launchToken.symbol}. You will need some to seed this pool and sell it during the LBP`
    }

    if (bn(balanceData.value).shiftedBy(balanceData.decimals).lt(value)) {
      return `Your wallet does not have enough ${launchToken.symbol}`
    }

    return true
  }

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Sale token</Text>
      <Controller
        control={control}
        name="saleTokenAmount"
        render={({ field }) => (
          <TokenInput
            address={launchToken.address}
            apiToken={launchToken}
            chain={selectedChain}
            customUserBalance={formatUnits(balanceData?.value || 0n, launchToken.decimals)}
            onChange={e => field.onChange(e.currentTarget.value)}
            priceMessage="Price: N/A"
            value={field.value}
          />
        )}
        rules={{
          required: 'Sale token amount is required',
          validate: { isGreaterThanZeroValidation, haveEnoughAmount },
        }}
      />
      {errors.saleTokenAmount && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full">
          {errors.saleTokenAmount.message}
        </Text>
      )}
    </VStack>
  )
}

function CollateralTokenAmountInput({
  control,
  errors,
  selectedChain,
  collateralTokenAddress,
  collateralTokenSymbol,
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  selectedChain: GqlChain
  collateralTokenAddress: string
  collateralTokenSymbol: string
}) {
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const balance = balanceFor(collateralTokenAddress)

  const haveEnoughAmount = (value: string) => {
    if (isBalancesLoading) return true

    if (!balance || balance.amount === 0n) {
      return `Your wallet has no ${collateralTokenSymbol}. You need some to seed this pool.\nSuggested seed liquidity amount: $5k+`
    }

    if (bn(balance.amount).shiftedBy(balance.decimals).lt(value)) {
      return `Your wallet does not have enough ${collateralTokenSymbol}`
    }

    return true
  }

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Collateral token</Text>
      <Controller
        control={control}
        name="collateralTokenAmount"
        render={({ field }) => (
          <TokenInput
            address={collateralTokenAddress}
            chain={selectedChain}
            onChange={e => field.onChange(e.currentTarget.value)}
            value={field.value}
          />
        )}
        rules={{
          required: 'Collateral token amount is required',
          validate: { isGreaterThanZeroValidation, haveEnoughAmount },
        }}
      />
      <Text fontSize="sm" pt="xs" variant="secondary">
        Add $5k+ of the collateral token to ensure a smooth start.
      </Text>
      {errors.collateralTokenAmount && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full" whiteSpace="pre-wrap">
          {errors.collateralTokenAmount.message}
        </Text>
      )}
    </VStack>
  )
}
