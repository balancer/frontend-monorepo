'use client'

import {
  Heading,
  VStack,
  Text,
  Divider,
  HStack,
  Radio,
  Stack,
  RadioGroup,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainSelect } from '../../chains/ChainSelect'
import { useLbpForm } from '../LbpFormProvider'
import { SaleStructureForm } from '../lbp.types'
import { Control, Controller, FieldErrors, SubmitHandler, UseFormSetValue } from 'react-hook-form'
import { LbpFormAction } from '../LbpFormAction'
import { isAddressValidation } from '@repo/lib/shared/utils/addresses'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { useMemo } from 'react'
import { isAddress } from 'viem'
import { TokenSelectInput } from '../../tokens/TokenSelectInput'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { SelectInput } from '@repo/lib/shared/components/inputs/SelectInput'
import { ArrowRight, Clipboard } from 'react-feather'
import { useTokenMetadata } from '../../tokens/useTokenMetadata'
import { TokenInput } from '../../tokens/TokenInput/TokenInput'
import { TokenBalancesProvider } from '../../tokens/TokenBalancesProvider'
import { useTokens } from '../../tokens/TokensProvider'
import { TokenInputsValidationProvider } from '../../tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '../../price-impact/PriceImpactProvider'
import { isGreaterThanZeroValidation } from '@repo/lib/shared/utils/numbers'

export function SaleStructureStep() {
  const {
    saleStructureForm: {
      handleSubmit,
      control,
      formState: { errors, isValid },
      watch,
      setValue,
    },
    setActiveStep,
    activeStepIndex,
  } = useLbpForm()
  const { getToken } = useTokens()

  const supportedChains = PROJECT_CONFIG.supportedNetworks.filter(chain => {
    const chainConfig = getNetworkConfig(chain)
    return typeof chainConfig?.lbps !== 'undefined'
  })

  const selectedChain = watch('selectedChain')
  const launchTokenAddress = watch('launchTokenAddress')
  const collateralTokenAddress = watch('collateralTokenAddress')

  const launchToken = getToken(launchTokenAddress, selectedChain)
  const collateralToken = getToken(collateralTokenAddress, selectedChain)

  const tokens = useMemo(() => {
    const _tokens = []
    if (launchToken) _tokens.push(launchToken)
    if (collateralToken) _tokens.push(collateralToken)
    return _tokens
  }, [launchToken, collateralToken])

  const launchTokenMetadata = useTokenMetadata(launchTokenAddress, selectedChain)

  const validLaunchTokenAddress = useMemo(() => {
    return isAddress(launchTokenAddress)
  }, [launchTokenAddress])

  const onSubmit: SubmitHandler<SaleStructureForm> = data => {
    console.log(data)
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <TokenBalancesProvider initTokens={tokens}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <VStack align="start" spacing="lg" w="full">
          <Heading color="font.maxContrast" size="md">
            Launch token details
          </Heading>

          <VStack align="start" spacing="md" w="full">
            <NetworkSelectInput chains={supportedChains} control={control} />
            <LaunchTokenAddressInput control={control} errors={errors} setFormValue={setValue} />
          </VStack>

          {validLaunchTokenAddress && (
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
                  name="endTime"
                />
              </VStack>

              <Divider />

              <Heading color="font.maxContrast" size="md">
                LBP mechanism
              </Heading>
              <CollateralTokenAddressInput control={control} selectedChain={selectedChain} />
              <WeightAdjustmentTypeInput
                control={control}
                launchTokenSymbol={launchTokenMetadata.symbol}
              />
              <UserActionsInput control={control} />

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
                  <SaleTokenAmountInput
                    control={control}
                    launchTokenAddress={launchTokenAddress}
                    selectedChain={selectedChain}
                  />
                  <CollateralTokenAmountInput
                    collateralTokenAddress={collateralTokenAddress}
                    control={control}
                    selectedChain={selectedChain}
                  />
                </PriceImpactProvider>
              </TokenInputsValidationProvider>
            </>
          )}

          <LbpFormAction disabled={!isValid} />
        </VStack>
      </form>
    </TokenBalancesProvider>
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
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
  setFormValue: UseFormSetValue<SaleStructureForm>
}) {
  async function paste() {
    const clipboardText = await navigator.clipboard.readText()
    setFormValue('launchTokenAddress', clipboardText)
  }

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
              isInvalid={!!errors.launchTokenAddress}
              onChange={e => field.onChange(e.target.value)}
              placeholder="Enter token address"
              value={field.value}
            />
          )}
          rules={{
            required: 'Token address is required',
            validate: isAddressValidation,
          }}
        />

        <InputRightElement>
          <IconButton
            size="xs"
            variant="link"
            aria-label="paste"
            icon={<Clipboard />}
            onClick={paste}
          />
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
}: {
  name: keyof SaleStructureForm
  label: string
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
}) {
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
            defaultTokenAddress={collateralTokens?.[0]}
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

function WeightAdjustmentTypeInput({
  control,
  launchTokenSymbol,
}: {
  control: Control<SaleStructureForm>
  launchTokenSymbol?: string
}) {
  const options = useMemo(
    () => [
      {
        label: (
          <HStack justify="space-between" w="full">
            <Text>Standard Linear LBP</Text>
            <HStack color="font.secondary">
              <Text color="font.secondary" fontSize="sm">
                {launchTokenSymbol} 90%
              </Text>
              <ArrowRight size={12} />
              <Text color="font.secondary" fontSize="sm">
                10%
              </Text>
            </HStack>
          </HStack>
        ),
        value: 'linear_90_10',
      },
      {
        label: (
          <HStack justify="space-between" w="full">
            <Text>Linear LBP to 50/50 pool</Text>
            <HStack color="font.secondary">
              <Text color="font.secondary" fontSize="sm">
                {launchTokenSymbol} 90%
              </Text>
              <ArrowRight size={12} />
              <Text color="font.secondary" fontSize="sm">
                50%
              </Text>
            </HStack>
          </HStack>
        ),
        value: 'linear_90_50',
      },
    ],
    [launchTokenSymbol]
  )

  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Dynamic token weight adjustments</Text>
      <Controller
        control={control}
        name="weightAdjustmentType"
        render={({ field }) => (
          <SelectInput
            defaultValue={options[0].value}
            id="weight-adjustment-type"
            onChange={newValue => {
              field.onChange(newValue as GqlChain)
            }}
            options={options}
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

function SaleTokenAmountInput({
  control,
  selectedChain,
  launchTokenAddress,
}: {
  control: Control<SaleStructureForm>
  selectedChain: GqlChain
  launchTokenAddress: string
}) {
  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Sale token</Text>
      <Controller
        control={control}
        name="saleTokenAmount"
        render={({ field }) => (
          <TokenInput
            address={launchTokenAddress}
            chain={selectedChain}
            onChange={e => field.onChange(e.currentTarget.value)}
            value={field.value}
          />
        )}
        rules={{
          required: 'Sale token amount is required',
          validate: isGreaterThanZeroValidation,
        }}
      />
    </VStack>
  )
}

function CollateralTokenAmountInput({
  control,
  selectedChain,
  collateralTokenAddress,
}: {
  control: Control<SaleStructureForm>
  selectedChain: GqlChain
  collateralTokenAddress: string
}) {
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
          required: 'Sale token amount is required',
          validate: isGreaterThanZeroValidation,
        }}
      />
    </VStack>
  )
}
