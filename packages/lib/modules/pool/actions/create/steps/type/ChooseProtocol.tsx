import { ProjectConfig } from '@repo/lib/config/config.types'
import { VStack, Text, SimpleGrid, Card } from '@chakra-ui/react'
import { PROTOCOLS } from '@repo/lib/modules/pool/actions/create/constants'
import Image from 'next/image'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'

// TODO: Protocol selection part of OG designs, but maybe remove after discussion with pon?
export function ChooseProtocol() {
  const {
    poolCreationForm: { watch, setValue, trigger },
  } = usePoolCreationForm()

  const poolConfig = watch()
  const selectedProtocol = poolConfig.protocol

  const handleChooseProtocol = (protocolId: ProjectConfig['projectId']) => {
    setValue('protocol', protocolId)
    trigger('protocol')
  }
  return (
    <VStack align="start" spacing="md" w="full">
      <Text color="font.primary">Choose protocol</Text>
      <SimpleGrid columns={3} spacing="md" w="full">
        {PROTOCOLS.map(({ id, name, imageSrc }) => (
          <Card
            backgroundColor={selectedProtocol === id ? 'rgba(0, 211, 149, 0.05)' : 'transparent'}
            border={selectedProtocol === id ? '2px solid' : '1px solid'}
            borderColor={selectedProtocol === id ? 'green.500' : 'transparent'}
            cursor="pointer"
            display="flex"
            gap="sm"
            key={id}
            onClick={() => handleChooseProtocol(id)}
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
