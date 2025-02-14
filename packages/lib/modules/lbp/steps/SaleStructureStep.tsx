'use client'

import { Heading, VStack, Text, Input } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainSelect } from '../../chains/ChainSelect'
import { useLbpForm } from '../LbpFormProvider'
import { LbpFormStep1 } from '../lbp.types'
import { Controller, SubmitHandler } from 'react-hook-form'
import { LbpFormAction } from '../LbpFormAction'
import { isAddressValidation } from '@repo/lib/shared/utils/addresses'

export function SaleStructureStep() {
  const { formStep1, setActiveStep, activeStepIndex } = useLbpForm()

  const onSubmit: SubmitHandler<LbpFormStep1> = data => {
    console.log(data)
    setActiveStep(activeStepIndex + 1)
  }

  return (
    <form onSubmit={formStep1.handleSubmit(onSubmit)} style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Launch token details
        </Heading>

        <VStack align="start" spacing="md" w="full">
          <VStack align="start" w="full">
            <Text color="font.primary">Network / L2</Text>
            <Controller
              control={formStep1.control}
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
              control={formStep1.control}
              name="launchTokenAddress"
              render={({ field }) => (
                <>
                  <Input
                    isInvalid={!!formStep1.formState.errors.launchTokenAddress}
                    onChange={e => field.onChange(e.target.value)}
                    placeholder="Enter token address"
                    value={field.value}
                  />
                  <Text color="font.error" fontSize="sm">
                    {formStep1.formState.errors.launchTokenAddress?.message}
                  </Text>
                </>
              )}
              rules={{
                required: 'Token address is required',
                validate: isAddressValidation,
              }}
            />
          </VStack>
        </VStack>

        <LbpFormAction />
      </VStack>
    </form>
  )
}
