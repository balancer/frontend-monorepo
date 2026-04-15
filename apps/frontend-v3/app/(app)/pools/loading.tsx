import { Box, Flex, Skeleton, VStack, HStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'

export default function PoolsLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <Box borderBottom="1px solid" borderColor="border.base">
        <Noise
          backgroundColor="background.level0WithOpacity"
          overflow="hidden"
          position="relative"
          shadow="innerBase"
        >
          <DefaultPageContainer pb={['xl', 'xl', '10']} pt={['xl', '40px']}>
            <Flex
              align={{ base: 'start', md: 'start' }}
              direction={{ base: 'column', lg: 'row' }}
              gap="4"
              justify={{ base: 'start', md: 'space-between' }}
              mb="10"
            >
              <VStack align="start" gap="3">
                <Skeleton h="40px" w="300px" />
                <Skeleton h="20px" w="450px" />
              </VStack>
              <HStack gap="4">
                <Skeleton h="80px" w="150px" />
                <Skeleton h="80px" w="150px" />
                <Skeleton h="80px" w="150px" />
              </HStack>
            </Flex>
            <Skeleton h="132px" w="full" />
          </DefaultPageContainer>
        </Noise>
      </Box>

      {/* Pool list skeleton */}
      <DefaultPageContainer noVerticalPadding pb="xl" pt={['lg', '54px']}>
        <VStack align="start" minH="1000px" spacing="md" w="full">
          <Skeleton h="40px" w="300px" />
          <Skeleton h="500px" w="full" />
        </VStack>
      </DefaultPageContainer>
    </>
  )
}
