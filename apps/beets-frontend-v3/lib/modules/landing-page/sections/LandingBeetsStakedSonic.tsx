'use client'

import { Box, Flex, Grid, GridItem, Heading, HStack, Text, Link } from '@chakra-ui/react'
import { LandingSectionContainer } from '../components/LandingSectionContainer'
import { StakedSonicComposabilitySvg } from '../components/StakedSonicComposabilitySvg'
import { StakedSonicDecentralizationSvg } from '../components/StakedSonicDecentralizationSvg'
import { StakedSonicStakingRewardsSvg } from '../components/StakedSonicStakingRewardsSvg'
import { SpearbitLogo } from '@repo/lib/shared/components/imgs/SpearbitLogo'
import NextLink from 'next/link'

export function LandingBeetsStakedSonic() {
  return (
    <LandingSectionContainer
      button={{
        text: 'Stake $S',
        href: '/stake',
      }}
      subtitle="stS redefines Liquid Staking by combining deep liquidity, robust security, and competitive yield into one powerful position. Purpose-built for Sonic, stS delivers an unparalleled staking experience—maximizing rewards without sacrificing flexibility."
      title="stS: Liquid Staking on Sonic"
    >
      <Box
        backgroundImage={{ base: 'none', lg: 'url(/images/misc/staking-bg.png)' }}
        backgroundPosition="left bottom"
        backgroundRepeat="no-repeat"
        backgroundSize="50%"
        bg="rgba(255, 255, 255, 0.05)"
        p="xl"
        w="full"
      >
        <Grid
          gap="sm"
          templateColumns={{
            base: '1fr',
            lg: '1fr 1fr',
          }}
        >
          <GridItem>
            {/* <Box mb="xl">
              <Heading fontSize="3xl">Sonic's Leading LST</Heading>
              <Text fontSize="lg" fontWeight="thin">
                stS redefines Liquid Staking by combining deep liquidity, robust security, and
                competitive yield into one powerful position. Purpose-built for Sonic, stS delivers
                an unparalleled staking experience—maximizing rewards without sacrificing
                flexibility.
              </Text>
            </Box> */}
            <Box mb="xl">
              <Heading fontSize="3xl">Earn Network Rewards</Heading>
              <Text fontSize="lg" fontWeight="thin">
                Convert S to stS and earn continuous staking yields - while keeping your capital
                fully liquid.
              </Text>
            </Box>
          </GridItem>
          <GridItem>
            <Flex alignItems="center" mb="xl">
              <Box bg="rgba(255, 255, 255, 0.05)" height="170px" width="170px">
                <StakedSonicDecentralizationSvg />
              </Box>
              <Box flex="1" ml="xl">
                <Heading fontSize="2xl">Drive Decentralization</Heading>
                <Text fontSize="lg" fontWeight="thin">
                  Support Sonic's security by distributing consensus power, enhancing ecosystem
                  resilience.
                </Text>
              </Box>
            </Flex>
            <Flex alignItems="center" mb="xl">
              <Box flex="1" mr="xl">
                <Heading fontSize="2xl">Composability</Heading>
                <Text fontSize="lg" fontWeight="thin">
                  Use stS seamlessly across DeFi - access lending markets, liquidity pools, and more
                  without pausing your rewards.
                </Text>
              </Box>
              <Box bg="rgba(255, 255, 255, 0.05)" height="170px" width="170px">
                <StakedSonicComposabilitySvg />
              </Box>
            </Flex>
            <Flex alignItems="center">
              <Box bg="rgba(255, 255, 255, 0.05)" height="170px" width="170px">
                <StakedSonicStakingRewardsSvg />
              </Box>
              <Box flex="1" ml="xl">
                <Heading fontSize="2xl">Security & Trust</Heading>
                <Text fontSize="lg" fontWeight="thin" mb="md">
                  Protected by audited contracts and transparent governance, stS ensures your assets
                  remain secure and accessible.
                </Text>
                <Link
                  href="https://github.com/spearbit/portfolio/blob/master/pdfs/Beethoven-Sonic-Staking-Spearbit-Security-Review-December-2024.pdf"
                  target="_blank"
                >
                  <HStack gap="md">
                    <Heading fontSize="2xl">Audited by: </Heading>
                    <SpearbitLogo color="#25f2d0" height="36px" width="176px" />
                  </HStack>
                </Link>
              </Box>
            </Flex>
          </GridItem>
        </Grid>
      </Box>
    </LandingSectionContainer>
  )
}
