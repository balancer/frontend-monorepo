'use client'

import { Heading, VStack, Text, Input } from '@chakra-ui/react'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainSelect } from '../../chains/ChainSelect'
import { useLbpForm } from '../LbpFormProvider'
import { LbpFormStep1 } from '../lbp.types'
import { SubmitHandler } from 'react-hook-form'
import { LbpFormAction } from '../LbpFormAction'

export function SaleStructureStep() {
  const { formStep1 } = useLbpForm()

  const onSubmit: SubmitHandler<LbpFormStep1> = data => {
    console.log(data)
  }

  return (
    <form onSubmit={formStep1.handleSubmit(onSubmit)}>
      <VStack align="start" spacing="md" w="full">
        <Heading color="font.maxContrast" size="md">
          Launch token details
        </Heading>

        <VStack align="start" w="full">
          <Text color="font.primary">Network / L2</Text>
          <ChainSelect
            onChange={newValue => {
              setSelectedChain(newValue as GqlChain)
            }}
            value={selectedChain}
          />
        </VStack>

        <VStack align="start" w="full">
          <Text color="font.primary">Contract address of launch token</Text>
          <Input
            onChange={e => setLaunchTokenAddress(e.target.value)}
            placeholder="Enter token address"
            value={launchTokenAddress}
          />
        </VStack>
      </VStack>
      <LbpFormAction />
    </form>
  )
}
