import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'
import { HStack, Skeleton, VStack } from '@chakra-ui/react'

export function PoolDetailSkeleton() {
  return (
    <DefaultPageContainer>
      <VStack align="start" spacing="2xl" w="full">
        <VStack align="start" w="full" spacing="md">
          <Skeleton w="lg" maxW="full" h="100px" />
          <HStack w="full" spacing="md">
            <Skeleton w="300px" h="400px" display={{ base: 'none', md: 'block' }} />
            <Skeleton w="full" h="400px" />
          </HStack>
        </VStack>
        <Skeleton w="full" h="400px" />
        <Skeleton w="full" h="400px" />
        <Skeleton w="full" h="400px" />
      </VStack>
    </DefaultPageContainer>
  )
}
