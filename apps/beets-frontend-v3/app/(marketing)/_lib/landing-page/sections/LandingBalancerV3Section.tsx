'use client'

import { Box, Button, Flex, GridItem, Heading, Text, Grid } from '@chakra-ui/react'
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
      p={{ base: 'lg', lg: 'none' }}
      bg={{ base: 'rgba(0, 0, 0, 0.2)', lg: 'none' }}
      display={{ base: 'flex', lg: 'block' }}
      flexDirection="column"
      alignItems="center"
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
      title="Powered by Balancer v3"
      subtitle="Revolutionizing Liquidity, Redefining DeFi"
      button={{
        text: 'Discover Balancer v3',
        href: '',
      }}
    >
      <Box bg="rgba(255, 255, 255, 0.05)" pb="xl" px="xl" w="full">
        <Box
          w="full"
          height="350px"
          backgroundImage="url(/images/misc/bal-v3.png)"
          backgroundPosition="center"
          backgroundSize="100%"
          backgroundRepeat="no-repeat"
          display="flex"
          alignItems="flex-end"
          justifyContent="center"
        >
          <Box
            fontSize="2xl"
            fontWeight="thin"
            textAlign="center"
            pb="2xl"
            w={{ base: 'full', lg: '2xl' }}
          >
            Balancer v3 shifts complexity into a unified Vault, simplifying pool creation and
            enhancing flexibility.
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
              title="Custom Pools"
              description="Easily build specialized liquidity pools tailored to your needs."
              image={<BalancerV3CustomPoolsSvg />}
            />
            <Card
              title="Hooks Framework"
              description="Add custom logic to pools for enhanced control."
              image={<BalancerV3HooksSvg />}
            />
            <Card
              title="100% Boosted Pools"
              description="Maximize yields with integrated lending opportunities."
              image={<BalancerV3BoostedPoolsSvg />}
            />
          </Grid>
        </Box>
        <Box
          fontSize="2xl"
          fontWeight="thin"
          textAlign="center"
          pt="xl"
          pb="md"
          w={{ base: 'full', lg: '2xl' }}
        >
          Balancer v3 transforms beets into a hub of cutting-edge liquidity solutions, empowering
          builders to shape the future of Sonic.
        </Box>
      </Box>
    </LandingSectionContainer>
  )
}
