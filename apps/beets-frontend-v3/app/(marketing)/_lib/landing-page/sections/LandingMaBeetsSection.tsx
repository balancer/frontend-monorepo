'use client'

import { Box, Center, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { LandingSectionContainer } from '../components/LandingSectionContainer'
import { MaBeetsAddLiquiditySvg } from '../components/MaBeetsAddLiquiditySvg'
import { MaBeetsFairerRewardsSvg } from '../components/MaBeetsFairerRewardsSvg'
import { MaBeetsGrowEarnSvg } from '../components/MaBeetsGrowEarnSvg'
import { MaBeetsMaturityVsLockingSvg } from '../components/MaBeetsMaturityVsLocking'
import { MaBeetsMintMabeetsSvg } from '../components/MaBeetsMintMabeetsSvg'

function FeatureCard({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image: React.ReactNode
}) {
  return (
    <HStack align="start" h="full" spacing="none" w="full">
      <Box bg="rgba(0, 0, 0, 0.1)" borderBottom="30px solid rgba(0, 0, 0, 0.4)" h="full" w="40%">
        {image}
      </Box>
      <VStack align="start" borderBottom="30px solid rgba(0, 0, 0, 0.3)" h="full" p="lg" w="60%">
        <Heading fontSize="2xl">{title}</Heading>
        <Text fontSize="lg" fontWeight="thin">
          {description}
        </Text>
      </VStack>
    </HStack>
  )
}

export function LandingMaBeetsSection() {
  return (
    <LandingSectionContainer
      title="maBEETS: Your Voice, Your Rewards"
      subtitle="Shape the Future. Earn as You Grow. maBEETS unlocks maturity-adjusted voting power,
            allowing you to participate in governance decisions and earn rewards without locking
            your assets."
    >
      <Box bg="rgba(255, 255, 255, 0.05)" p="xl" w="full">
        <Box display="flex" mb="xl">
          <Box flex={1} mr="md">
            <FeatureCard
              title="Maturity vs Locking"
              description="Your voting power grows with time, rewarding commitment and active participation, not lock-ups."
              image={<MaBeetsMaturityVsLockingSvg />}
            />
          </Box>
          <Box flex={1} ml="md">
            <FeatureCard
              title="Fairer Rewards"
              description="Earn based on both the size and maturity of your position, aligning long-term contributors with the protocol’s success. "
              image={<MaBeetsFairerRewardsSvg />}
            />
          </Box>
        </Box>
        <Box mb="lg">
          <Center>
            <Heading fontSize="3xl">How it works</Heading>
          </Center>
        </Box>
        <Box display="flex">
          <Box flex="1">
            <Box height="100px" mb="lg">
              <MaBeetsAddLiquiditySvg />
            </Box>
            <Heading fontSize="xl" mb="md">
              Add Liquidity
            </Heading>
            <Text fontWeight="thin" fontSize="lg">
              Join the Fresh Beets Pool (80/20 BEETS/stS) to receive fBEETS.
            </Text>
          </Box>
          <Box flex="1" mx="lg">
            <Box height="100px" mb="lg">
              <MaBeetsMintMabeetsSvg />
            </Box>
            <Heading fontSize="xl" mb="md">
              Mint maBEETS
            </Heading>
            <Text fontWeight="thin" fontSize="lg">
              Deposit your fBEETS to create a maBEETS position tied to a Relic NFT.
            </Text>
          </Box>
          <Box flex="1">
            <Box height="100px" mb="lg">
              <MaBeetsGrowEarnSvg />
            </Box>
            <Heading fontSize="xl" mb="md">
              Grow & Earn
            </Heading>
            <Text fontWeight="thin" fontSize="lg">
              As your position matures, enjoy increasing rewards and voting power.
            </Text>
          </Box>
        </Box>
      </Box>
    </LandingSectionContainer>
  )
}
