'use client'

import { Box, Center, Grid, GridItem, Heading, HStack, Text, VStack } from '@chakra-ui/react'
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

function HowItWorksCard({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image: React.ReactNode
}) {
  return (
    <GridItem
      p={{ base: 'lg', lg: 'none' }}
      bg={{ base: 'rgba(0, 0, 0, 0.2)', lg: 'none' }}
      display={{ base: 'flex', lg: 'block' }}
      flexDirection="column"
      alignItems="center"
    >
      <Box height="100px" mb="lg">
        {image}
      </Box>
      <Heading fontSize="xl" mb="md">
        {title}
      </Heading>
      <Text fontWeight="thin" fontSize="lg">
        {description}
      </Text>
    </GridItem>
  )
}

export function LandingMaBeetsSection() {
  return (
    <LandingSectionContainer
      title="maBEETS: Your Voice, Your Rewards"
      subtitle="Shape the Future. Earn as You Grow. maBEETS unlocks maturity-adjusted voting power,
            allowing you to participate in governance decisions and earn rewards without locking
            your assets."
      button={{
        text: 'Get maBEETS',
        href: '',
      }}
    >
      <Box bg="rgba(255, 255, 255, 0.05)" p="xl" w="full">
        <Grid
          gap="xl"
          templateColumns={{
            base: '1fr',
            lg: '1fr 1fr',
          }}
          mb="xl"
        >
          <GridItem>
            <FeatureCard
              title="Maturity vs Locking"
              description="Your voting power grows with time, rewarding commitment and active participation, not lock-ups."
              image={<MaBeetsMaturityVsLockingSvg />}
            />
          </GridItem>
          <GridItem>
            <FeatureCard
              title="Fairer Rewards"
              description="Earn based on both the size and maturity of your position, aligning long-term contributors with the protocol’s success. "
              image={<MaBeetsFairerRewardsSvg />}
            />
          </GridItem>
        </Grid>
        <Box mb="lg">
          <Center>
            <Heading fontSize="3xl">How it works</Heading>
          </Center>
        </Box>
        <Grid
          gap="lg"
          templateColumns={{
            base: '1fr',
            lg: '1fr 1fr 1fr',
          }}
        >
          <HowItWorksCard
            title="Add Liquidity"
            description="Join the Fresh Beets Pool (80/20 BEETS/stS) to receive fBEETS."
            image={<MaBeetsAddLiquiditySvg />}
          />
          <HowItWorksCard
            title="Mint maBEETS"
            description="Deposit your fBEETS to create a maBEETS position tied to a Relic NFT."
            image={<MaBeetsMintMabeetsSvg />}
          />
          <HowItWorksCard
            title="Grow & Earn"
            description="As your position matures, enjoy increasing rewards and voting power."
            image={<MaBeetsGrowEarnSvg />}
          />
        </Grid>
      </Box>
    </LandingSectionContainer>
  )
}
