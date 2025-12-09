import { VStack, Text, SimpleGrid, Card } from '@chakra-ui/react'
import { PROTOCOLS } from '@repo/lib/modules/pool/actions/create/constants'
import Image from 'next/image'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { type PoolCreationForm } from '../../types'
import { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

export function ChooseProtocol({ control }: { control: Control<PoolCreationForm> }) {
  const { poolCreationForm } = usePoolCreationForm()

  const selectedProtocol = useWatch({ control, name: 'protocol' })

  const handleChooseProtocol = (protocolName: PoolCreationForm['protocol']) => {
    poolCreationForm.setValue('protocol', protocolName)
    poolCreationForm.trigger('protocol')
  }
  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose protocol</Text>
      <SimpleGrid columns={2} spacing="md" w="full">
        {PROTOCOLS.map(({ name, imageSrc }) => (
          <Card
            backgroundColor={selectedProtocol === name ? 'rgba(0, 211, 149, 0.05)' : 'transparent'}
            border={selectedProtocol === name ? '2px solid' : '1px solid'}
            borderColor={selectedProtocol === name ? 'green.500' : 'transparent'}
            cursor="pointer"
            display="flex"
            gap="sm"
            key={name}
            onClick={() => handleChooseProtocol(name)}
          >
            <VStack spacing="sm">
              <Image alt={`${name} logo`} height={80} src={imageSrc} width={80} />
              <Text>{name}</Text>
            </VStack>
          </Card>
        ))}
      </SimpleGrid>
    </VStack>
  )
}
