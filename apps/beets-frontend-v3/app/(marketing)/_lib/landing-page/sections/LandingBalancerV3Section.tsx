'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
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
    <Box flex="1" mx="lg">
      <Box pb="lg">{image}</Box>
      <Box>
        <Heading fontSize="2xl" pb="md">
          {title}
        </Heading>
        <Text fontSize="lg" fontWeight="thin">
          {description}
        </Text>
      </Box>
    </Box>
  )
}

export function LandingBalancerV3Section() {
  return (
    <LandingSectionContainer
      title="Powered by Balancer v3"
      subtitle="Revolutionizing Liquidity, Redefining DeFi"
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
          <Box fontSize="2xl" fontWeight="thin" textAlign="center" pb="2xl">
            Balancer v3 shifts complexity into a unified Vault,
            <br />
            simplifying pool creation and enhancing flexibility.
          </Box>
        </Box>

        <Box display="flex" bg="rgba(0, 0, 0, 0.2)" p="lg">
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
        </Box>
        <Box fontSize="2xl" fontWeight="thin" textAlign="center" pt="xl" pb="md">
          Balancer v3 transforms beets into a hub of
          <br />
          cutting-edge liquidity solutions, empowering builders
          <br />
          to shape the future of Sonic.
        </Box>
      </Box>
    </LandingSectionContainer>
  )
}
