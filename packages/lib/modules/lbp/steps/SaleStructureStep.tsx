'use client'

import { Heading, VStack, Text, Divider } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainSelect } from '../../chains/ChainSelect'
import { useLbpForm } from '../LbpFormProvider'
import { SaleStructureForm } from '../lbp.types'
import { Control, Controller, FieldErrors, SubmitHandler } from 'react-hook-form'
import { LbpFormAction } from '../LbpFormAction'
import { isAddressValidation } from '@repo/lib/shared/utils/addresses'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'
import { useEffect, useMemo } from 'react'
import { isAddress } from 'viem'
import { TokenSelectInput } from '../../tokens/TokenSelectInput'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getNetworkConfig } from '@repo/lib/config/app.config'

export function SaleStructureStep() {
  const {
    saleStructureForm: {
      handleSubmit,
      control,
      formState: { errors, isValid },
      watch,
    },
    setActiveStep,
    activeStepIndex,
  } = useLbpForm()

  const supportedChains = PROJECT_CONFIG.supportedNetworks.filter(chain => {
    const chainConfig = getNetworkConfig(chain)
    return typeof chainConfig?.lbps !== 'undefined'
  })

  const selectedChain = watch('selectedChain')
  const launchTokenAddress = watch('launchTokenAddress')
  const startTime = watch('startTime')

  useEffect(() => {
    console.log(startTime)
  }, [startTime])

  const validLaunchTokenAddress = useMemo(() => {
    return isAddress(launchTokenAddress)
  }, [launchTokenAddress])

  const onSubmit: SubmitHandler<SaleStructureForm> = data => {
    console.log(data)
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
          <LaunchTokenAddressInput control={control} errors={errors} />
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
          </>
        )}

        <LbpFormAction disabled={!isValid} />
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
}: {
  control: Control<SaleStructureForm>
  errors: FieldErrors<SaleStructureForm>
}) {
  return (
    <VStack align="start" w="full">
      <Text color="font.primary">Contract address of launch token</Text>
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
