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
import { Clipboard, Edit, Percent } from 'react-feather'
import { TokenMetadata, useTokenMetadata } from '../../tokens/useTokenMetadata'
import { TokenInput } from '../../tokens/TokenInput/TokenInput'
import { isGreaterThanZeroValidation, bn } from '@repo/lib/shared/utils/numbers'
import { useEffect, useState } from 'react'
import { useTokens } from '../../tokens/TokensProvider'
import { useLbpForm } from '../LbpFormProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { differenceInDays, differenceInHours, format, parseISO } from 'date-fns'
import { TokenBalancesProvider, useTokenBalances } from '../../tokens/TokenBalancesProvider'
import { WeightAdjustmentTypeInput } from './WeightAdjustmentTypeInput'
import { TokenInputsValidationProvider } from '../../tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '../../price-impact/PriceImpactProvider'
import { LbpFormAction } from '../LbpFormAction'
import { CustomToken } from '../../tokens/token.types'
import { useUserBalance } from '@repo/lib/shared/hooks/useUserBalance'

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
  const daysDiff = differenceInDays(parseISO(saleEnd), parseISO(saleStart))
  const hoursDiff = differenceInHours(parseISO(saleEnd), parseISO(saleStart)) - daysDiff * 24

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

        <VStack align="start" spacing="md" w="full">
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
            <VStack align="start" spacing="sm" w="full">
              <DateTimeInput
                control={control}
                errors={errors}
                label="Start date and time"
                name="startTime"
              />
              <DateTimeInput
                control={control}
                errors={errors}
                label="End date and time"
                min={saleStart}
                name="endTime"
              />
              <Text color="font.secondary" fontSize="xs">
                {saleStart && saleEnd
                  ? `Sale period: ${daysDiff ? `${daysDiff} days` : ''} ${hoursDiff ? `${hoursDiff} hours` : ''} (5 days suggested)`
                  : 'Suggested sale period: 5 days'}
              </Text>
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
            <VStack align="start" spacing="sm" w="full">
              <Heading color="font.maxContrast" size="md">
                Seed initial pool liquidity
              </Heading>
              <Text color="font.secondary">
                The starting liquidity in the pool. The amounts and ratio will determine the
                starting price, projected market cap and price curve.
              </Text>
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

        <InputRightElement>
          {!locked ? (
            <IconButton
              aria-label="paste"
              icon={<Clipboard />}
              onClick={paste}
              size="xs"
              variant="link"
            />
          ) : (
            <IconButton
              aria-label="edit"
              icon={<Edit />}
              onClick={() => resetForm()}
              size="xs"
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
}: {
  name: keyof SaleStructureForm
  label: string
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  min?: string
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
  const collateralTokens = chainConfig?.lbps?.collateralTokens

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
            <Stack direction="row">
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
        <Stack direction="row">
          <Radio value="minimum">1.00%</Radio>
          <Radio value="custom">Custom</Radio>
        </Stack>
      </RadioGroup>

      {value === 'custom' && (
        <InputGroup>
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
      {errors.collateralTokenAmount && (
        <Text color="font.error" fontSize="sm" textAlign="start" w="full" whiteSpace="pre-wrap">
          {errors.collateralTokenAmount.message}
        </Text>
      )}
    </VStack>
  )
}
