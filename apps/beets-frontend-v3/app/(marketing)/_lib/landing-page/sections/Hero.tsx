import { Center, Heading, Text, VStack } from '@chakra-ui/react'

export function Hero() {
  return (
    <Center py="200px" textAlign="center">
      <VStack>
        <Heading fontSize="5xl">DeFine your financial future</Heading>
        <Text fontSize="2xl" fontWeight="thin" maxW="full" w="2xl">
          Formely Beethoven X, Beets is an established, trusted, community-led project providing
          innovative crypto investment opportunities with Balancer tech on the Sonic & Optimisim
          networks.
        </Text>
      </VStack>
    </Center>
  )
}
