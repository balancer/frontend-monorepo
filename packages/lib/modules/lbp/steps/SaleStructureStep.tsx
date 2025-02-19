'use client'

import { Heading, VStack, Text } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainSelect } from '../../chains/ChainSelect'
import { useLbpForm } from '../LbpFormProvider'
import { SaleStructureForm } from '../lbp.types'
import { Controller, SubmitHandler } from 'react-hook-form'
import { LbpFormAction } from '../LbpFormAction'
import { isAddressValidation } from '@repo/lib/shared/utils/addresses'
import { InputWithError } from '@repo/lib/shared/components/inputs/InputWithError'

export function SaleStructureStep() {
  const {
    saleStructureForm: {
      handleSubmit,
      control,
      formState: { errors, isValid },
    },
    setActiveStep,
    activeStepIndex,
  } = useLbpForm()

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
          <VStack align="start" w="full">
            <Text color="font.primary">Network / L2</Text>
            <Controller
              control={control}
              name="selectedChain"
              render={({ field }) => (
                <ChainSelect
                  onChange={newValue => {
                    field.onChange(newValue as GqlChain)
                  }}
                  value={field.value}
                />
              )}
            />
          </VStack>

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
        </VStack>

        <LbpFormAction disabled={!isValid} />
      </VStack>
    </form>
  )
}
