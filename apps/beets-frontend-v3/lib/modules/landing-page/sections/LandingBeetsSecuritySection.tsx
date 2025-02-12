'use client'

import { Box, Flex, Grid, GridItem, Heading, Text } from '@chakra-ui/react'
import React from 'react'
import { LandingSectionContainer } from '../components/LandingSectionContainer'
import { SecurityAuditsSvg } from '../components/SecurityAuditsSvg'
import { SecurityMonitoringSvg } from '../components/SecurityMonitoringSvg'
import { SecurityOpenSourceSvg } from '../components/SecurityOpenSourceSvg'

function Card({
  title,
  description,
  image,
}: {
  title: React.ReactNode
  description: string
  image: React.ReactNode
}) {
  return (
    <GridItem mb={{ base: 'lg', lg: 'none' }}>
      <Flex mb="md">
        <Box flex="1">
          <Heading fontSize="2xl">{title}</Heading>
        </Box>
        {image}
      </Flex>
      <Text fontSize="lg" fontWeight="thin">
        {description}
      </Text>
    </GridItem>
  )
}

export function LandingBeetsSecuritySection() {
  return (
    <LandingSectionContainer
      button={{
        text: 'View audits',
        href: 'https://docs.beets.fi/ecosystem/security#audits',
        isExternal: true,
      }}
      subtitle="Built with security at its core, beets prioritizes trust at every level. From rigorous audits to open-source transparency and continuous monitoring, our ecosystem ensures your assets remain safe, reliable, and accessible."
      title="Code you can trust"
    >
      <Box bg="rgba(255, 255, 255, 0.05)" p="xl" w="full">
        <Grid
          bg="rgba(0, 0, 0, 0.2)"
          gap="2xl"
          p="lg"
          templateColumns={{
            base: '1fr',
            lg: '1fr 1fr 1fr',
          }}
        >
          <Card
            description="Our code is thoroughly audited by leading security firms."
            image={<SecurityAuditsSvg />}
            title={
              <>
                Rigorous
                <br />
                Audits
              </>
            }
          />
          <Card
            description="All code is publicly available for community scrutiny and trust."
            image={<SecurityOpenSourceSvg />}
            title={
              <>
                Open-Source
                <br />
                Transparency
              </>
            }
          />
          <Card
            description="Ongoing security assessments ensure the integrity of the beets ecosystem."
            image={<SecurityMonitoringSvg />}
            title={
              <>
                Continous
                <br />
                Monitoring
              </>
            }
          />
        </Grid>
      </Box>
    </LandingSectionContainer>
  )
}
