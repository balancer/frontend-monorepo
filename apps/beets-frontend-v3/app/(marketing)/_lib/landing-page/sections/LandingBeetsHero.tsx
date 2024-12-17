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
            The Flagship LST Hub on Sonic. From seamless staking to earning real yield on
            LST-focused liquidity pools, beets is the ultimate destination for your liquid-staked
            tokens.
          </Text>
        </VStack>
      </Center>
    </Box>
  )
}
