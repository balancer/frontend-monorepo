import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { HStack, Skeleton, VStack } from '@chakra-ui/react'

export function PoolDetailSkeleton() {
  return (
    <DefaultPageContainer>
      <VStack align="start" spacing="2xl" w="full">
        <VStack align="start" spacing="md" w="full">
          <Skeleton h="100px" maxW="full" w="lg" />
          <HStack spacing="md" w="full">
            <Skeleton display={{ base: 'none', md: 'block' }} h="400px" w="300px" />
            <Skeleton h="400px" w="full" />
          </HStack>
        </VStack>
        <Skeleton h="400px" w="full" />
        <Skeleton h="400px" w="full" />
        <Skeleton h="400px" w="full" />
      </VStack>
    </DefaultPageContainer>
  )
}
