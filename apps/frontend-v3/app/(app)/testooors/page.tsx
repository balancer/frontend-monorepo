'use client'
import { HStack, Heading, Link, Stack, Text, VStack } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'

export default function TestooorV3Pools() {
  return (
    <FadeInOnView>
      <VStack margin="lg" padding="lg">
        <Stack alignItems="center" mb="xl">
          <HStack>
            <Text>🙏</Text> <Heading size="md">Welcome to the Zen testooor page </Heading>{' '}
            <Text>🙏</Text>
          </HStack>
          <Heading size="sm">
            Follow the instructions in this doc to test the following V3 sepolia pools
          </Heading>
        </Stack>

        <Link as={NextLink} href="pools/sepolia/v3/0x86fde41ff01b35846eb2f27868fb2938addd44c4">
          Sepolia WEIGHTED (Balancer 50 DAI 50 USDC)
        </Link>
        <Link as={NextLink} href="/pools/sepolia/v3/0xb1769fee9845e2762539c9d4b6a3793388152930">
          Sepolia Weighted BOOSTED pool (Balancer 50 WETH 50 stataUSDC)
        </Link>
        <Link as={NextLink} href="/pools/sepolia/v3/0x693cc6a39bbf35464f53d6a5dbf7d6c2fa93741c">
          Sepolia reference NESTED boosted pool (Balancer 50 bbaUSD 50 WETH)
        </Link>
        <Link as={NextLink} href="/pools/sepolia/v3/0xc832a37c8252117604f1329b4a7fed7076880b27">
          Sepolia reference STABLE NESTED pool (Balancer DAI/USDC/USDT)
        </Link>
        <Link as={NextLink} href="/pools/sepolia/v3/0x59fa488dda749cdd41772bb068bb23ee955a6d7a">
          Sepolia reference STABLE NON-NESTED pool (Balancer USDC/USDT)
        </Link>
        {/* <Link as={NextLink} href="/pools/sepolia/v3/0xa8c18ce5e987d7d82ccaccb93223e9bb5df4a3c0">
          Sepolia WEIGHTED with Proportional joins (Balancer 50 BAL 50 WETH -ExitFee Hook)
        </Link> */}
      </VStack>
    </FadeInOnView>
  )
}
