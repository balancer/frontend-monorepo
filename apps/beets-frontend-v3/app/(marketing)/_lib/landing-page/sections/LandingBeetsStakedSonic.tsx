'use client'

import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { LandingSectionContainer } from '../components/LandingSectionContainer'
import { StakedSonicComposabilitySvg } from '../components/StakedSonicComposabilitySvg'
import { StakedSonicDecentralizationSvg } from '../components/StakedSonicDecentralizationSvg'
import { StakedSonicStakingRewardsSvg } from '../components/StakedSonicStakingRewardsSvg'

export function LandingBeetsStakedSonic() {
  return (
    <LandingSectionContainer
      title="stS: Liquid Staking on Sonic"
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit ligula a ultrices
            dapibus. Maecenas sit amet lectus tortor. Nam luctus eros leo."
      button={{
        text: 'Stake',
        href: '',
      }}
    >
      <Box
        bg="rgba(255, 255, 255, 0.05)"
        p="xl"
        w="full"
        backgroundImage="url(/images/misc/staking-bg.png)"
        backgroundPosition="left bottom"
        backgroundSize="50%"
        backgroundRepeat="no-repeat"
      >
        <Flex>
          <Box flex="1" mr="2xl">
            <Box mb="xl">
              <Heading fontSize="3xl">Sonic’s Leading LST</Heading>
              <Text fontSize="lg" fontWeight="thin">
                stS redefines Liquid Staking by combining deep liquidity, robust security, and
                competitive yield into one powerful position. Purpose-built for Sonic, stS delivers
                an unparalleled staking experience—maximizing rewards without sacrificing
                flexibility.
              </Text>
            </Box>
            <Box>
              <Heading fontSize="3xl">Earn Network Rewards</Heading>
              <Text fontSize="lg" fontWeight="thin">
                Convert S to stS and earn continuous staking yields - while keeping your capital
                fully liquid.
              </Text>
            </Box>
          </Box>
          <Box flex="1">
            <Flex mb="xl" alignItems="center">
              <Box width="170px" height="170px" bg="rgba(255, 255, 255, 0.05)">
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
            <Flex mb="xl" alignItems="center">
              <Box flex="1" mr="xl">
                <Heading fontSize="2xl">Composability</Heading>
                <Text fontSize="lg" fontWeight="thin">
                  Use stS seamlessly across DeFi - access lending markets, liquidity pools, and more
                  without pausing your rewards.
                </Text>
              </Box>
              <Box width="170px" height="170px" bg="rgba(255, 255, 255, 0.05)">
                <StakedSonicComposabilitySvg />
              </Box>
            </Flex>
            <Flex alignItems="center">
              <Box width="170px" height="170px" bg="rgba(255, 255, 255, 0.05)">
                <StakedSonicStakingRewardsSvg />
              </Box>
              <Box flex="1" ml="xl">
                <Heading fontSize="2xl">Security & Trust</Heading>
                <Text fontSize="lg" fontWeight="thin">
                  Protected by audited contracts and transparent governance, stS ensures your assets
                  remain secure and accessible.
                </Text>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </LandingSectionContainer>
  )
}
