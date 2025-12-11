import { VStack, Text, SimpleGrid, Card } from '@chakra-ui/react'
import {
  PROTOCOLS,
  INITIAL_POOL_CREATION_FORM,
} from '@repo/lib/modules/pool/actions/create/constants'
import Image from 'next/image'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { type PoolCreationForm } from '../../types'
import { Control, useWatch } from 'react-hook-form'
import { isCowProtocol } from '../../helpers'
import { PoolType } from '@balancer/sdk'

export function ChooseProtocol({ control }: { control: Control<PoolCreationForm> }) {
  const { poolCreationForm } = usePoolCreationForm()

  const selectedProtocol = useWatch({ control, name: 'protocol' })

  const handleChooseProtocol = (protocol: PoolCreationForm['protocol']) => {
    const poolType = isCowProtocol(protocol) ? PoolType.CowAmm : PoolType.Stable

    poolCreationForm.reset({ ...INITIAL_POOL_CREATION_FORM, protocol, poolType })
  }
  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary" fontWeight="bold">
        Choose protocol
      </Text>
      <SimpleGrid columns={2} spacing="md" w="full">
        {PROTOCOLS.map(({ name, imageSrc }) => {
          const cardProps = {
            cursor: 'pointer',
            display: 'flex',
            gap: 'sm',
            onClick: () => handleChooseProtocol(name),
            ...(selectedProtocol === name
              ? {
                  backgroundColor: 'rgba(0, 211, 149, 0.05)',
                  border: '1px solid',
                  borderColor: 'green.500',
                }
              : {
                  backgroundColor: 'background.level2',
                  border: '1px solid',
                  borderColor: 'transparent',
                }),
          }

          return (
            <Card {...cardProps}>
              <VStack spacing="sm">
                <Image alt={`${name} logo`} height={80} src={imageSrc} width={80} />
                <Text>{name}</Text>
              </VStack>
            </Card>
          )
        })}
      </SimpleGrid>
    </VStack>
  )
}
