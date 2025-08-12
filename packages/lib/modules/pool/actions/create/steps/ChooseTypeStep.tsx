import { VStack, Heading, Text, Card, SimpleGrid } from '@chakra-ui/react'
import Image from 'next/image'
import { BeetsLogo } from '../../../../../../../apps/beets-frontend-v3/lib/components/imgs/BeetsLogo'
import { ReactNode } from 'react'

export function ChooseTypeStep() {
  return (
    <form style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Pool type
        </Heading>
        <VStack align="start" spacing="md" w="full">
          <Text color="font.primary">Choose protocol</Text>
          <SimpleGrid columns={3} spacing="md" w="full">
            <ProtocolCard
              icon={
                <Image
                  alt="Balancer logo"
                  height={80}
                  src="/images/icons/balancer.svg"
                  width={80}
                />
              }
              name={'Balancer'}
            />
            <ProtocolCard icon={<BeetsLogo width="80px" />} name={'Beets'} />
          </SimpleGrid>
        </VStack>
        <VStack align="start" spacing="md" w="full">
          <Text color="font.primary">Choose network</Text>
        </VStack>
        <VStack align="start" spacing="md" w="full">
          <Text color="font.primary">Choose a pool</Text>
        </VStack>
      </VStack>
    </form>
  )
}

function ProtocolCard({ name, icon }: { name: string; icon: ReactNode }) {
  return (
    <Card display="flex" gap="sm">
      <VStack spacing="sm">
        {icon}
        <Text>{name}</Text>
      </VStack>
    </Card>
  )
}
