import { Box, Center, Text, VStack } from '@chakra-ui/react'
import { Title } from '../components/Title'

export function LandingBeetsHero() {
  return (
    <Box maxW="100vw" position="relative">
      <Center pb="100px" pt="200px" textAlign="center">
        <VStack w="100%">
          <Title mb="md" />
          <Text
            fontSize="2xl"
            fontWeight="thin"
            maxW="full"
            px={{ base: 'md', md: 'none' }}
            w="2xl"
          >
            Formely Beethoven X, Beets is an established, trusted, community-led project providing
            innovative crypto investment opportunities with Balancer tech on the Sonic & Optimisim
            networks.
          </Text>
        </VStack>
      </Center>
    </Box>
  )
}
