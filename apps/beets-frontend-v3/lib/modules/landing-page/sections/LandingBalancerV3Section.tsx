'use client'

import { Box, GridItem, Heading, Text, Grid, Center } from '@chakra-ui/react'
import React from 'react'
import { BalancerV3BoostedPoolsSvg } from '../components/BalancerV3BoostedPoolsSvg'
import { BalancerV3CustomPoolsSvg } from '../components/BalancerV3CustomPoolsSvg'
import { BalancerV3HooksSvg } from '../components/BalancerV3HooksSvg'
import { LandingSectionContainer } from '../components/LandingSectionContainer'
function Card({
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
      alignItems="center"
      bg={{ base: 'rgba(0, 0, 0, 0.2)', lg: 'none' }}
      display={{ base: 'flex', lg: 'block' }}
      flexDirection="column"
      p={{ base: 'lg', lg: 'none' }}
    >
      <Box pb="lg">{image}</Box>
      <Box>
        <Heading fontSize="2xl" pb="md">
          {title}
        </Heading>
        <Text fontSize="lg" fontWeight="thin">
          {description}
        </Text>
      </Box>
    </GridItem>
  )
}

export function LandingBalancerV3Section() {
  return (
    <LandingSectionContainer
      button={{
        text: 'Discover Balancer v3',
        href: 'https://docs.balancer.fi',
        isExternal: true,
      }}
      subtitle="Revolutionizing Liquidity, Redefining DeFi"
      title="Powered by Balancer v3"
    >
      <Box bg="rgba(255, 255, 255, 0.05)" pb="xl" px="xl" w="full">
        <Box
          alignItems="flex-end"
          backgroundImage="url(/images/misc/bal-v3.png)"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          backgroundSize="100%"
          display="flex"
          height="350px"
          justifyContent="center"
          w="full"
        >
          <Box
            fontSize="2xl"
            fontWeight="thin"
            pb="xl"
            textAlign="center"
            w={{ base: 'full', lg: '2xl' }}
          >
            Balancer v3 provides permissionless technology to streamline AMM development for
            developers and empower liquidity providers with an ever-expanding DEX product suite.
          </Box>
        </Box>

        <Box bg={{ base: 'none', lg: 'rgba(0, 0, 0, 0.2)' }} p="lg">
          <Grid
            gap="lg"
            templateColumns={{
              base: '1fr',
              lg: '1fr 1fr 1fr',
            }}
          >
            <Card
              description="Easily build specialized liquidity pools tailored to your needs."
              image={<BalancerV3CustomPoolsSvg />}
              title="Custom Pools"
            />
            <Card
              description="Add custom logic to pools for enhanced control."
              image={<BalancerV3HooksSvg />}
              title="Hooks Framework"
            />
            <Card
              description="Maximize yields with integrated lending opportunities."
              image={<BalancerV3BoostedPoolsSvg />}
              title="100% Boosted Pools"
            />
          </Grid>
        </Box>
        <Center>
          <Box
            fontSize="2xl"
            fontWeight="thin"
            pb="md"
            pt="xl"
            textAlign="center"
            w={{ base: 'full', lg: '2xl' }}
          >
            Balancer v3 transforms beets into a hub of cutting-edge liquidity solutions, empowering
            builders to shape the future of Sonic.
          </Box>
        </Center>
      </Box>
    </LandingSectionContainer>
  )
}
