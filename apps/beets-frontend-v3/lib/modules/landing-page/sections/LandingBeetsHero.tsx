import { Box, Button, Center, Flex, Text, VStack } from '@chakra-ui/react'
import { Title } from '../components/Title'
import NextLink from 'next/link'

export function LandingBeetsHero() {
  return (
    <Box maxW="100vw" position="relative" pt="72px">
      <Center h="60vh" textAlign="center">
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
          <Flex gap="lg" mt="lg">
            <Button as={NextLink} href="/stake" size="lg" variant="primary">
              Stake $S
            </Button>
            <Button as={NextLink} href="/pools" size="lg" variant="secondary">
              Explore Pools
            </Button>
          </Flex>
        </VStack>
      </Center>
    </Box>
  )
}
